import axios from 'axios';
import { now } from '../utils.js';

// Cache tweet narrative + failed URLs to avoid refetching the same tweet
// every candidate build (404 spam seen in logs). TTL 30 min for failures,
// 5 min for successes.
const twitterCache = new Map();
const TWITTER_FAIL_TTL_MS = 30 * 60 * 1000;
const TWITTER_OK_TTL_MS = 5 * 60 * 1000;
function twitterCacheGet(url) {
  const hit = twitterCache.get(url);
  if (hit && now() - hit.at < (hit.ok ? TWITTER_OK_TTL_MS : TWITTER_FAIL_TTL_MS)) return hit.data;
  if (hit) twitterCache.delete(url);
  return undefined;
}
function twitterCacheSet(url, data, ok) {
  if (twitterCache.size >= 200) {
    const oldest = twitterCache.keys().next().value;
    if (oldest !== undefined) twitterCache.delete(oldest);
  }
  twitterCache.set(url, { at: now(), data, ok });
}

function extractTweetUrl(input) {
  const urls = [
    input?.twitter,
    input?.twitter_username,
    input?.link?.twitter_username,
  ].filter(Boolean).map(String);
  const raw = urls.find(url => /(?:^|\/)status\/\d+/.test(url)) || '';
  if (!raw) return null;
  if (raw.startsWith('i/') || raw.startsWith('communities/')) return null;
  if (raw.startsWith('http')) return raw.replace(/^https?:\/\/(www\.)?twitter\.com/i, 'https://x.com');
  return `https://x.com/${raw.replace(/^@/, '')}`;
}

function toFxTwitter(url) {
  return String(url || '')
    .replace(/^https?:\/\/(www\.)?x\.com/i, 'https://fxtwitter.com')
    .replace(/^https?:\/\/(www\.)?twitter\.com/i, 'https://fxtwitter.com');
}

function toFxTwitterApi(url) {
  return String(url || '')
    .replace(/^https?:\/\/(www\.)?x\.com/i, 'https://api.fxtwitter.com')
    .replace(/^https?:\/\/(www\.)?twitter\.com/i, 'https://api.fxtwitter.com');
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractTweetTextFromFx(data) {
  if (!data) return null;
  if (typeof data === 'object') return data.tweet?.text || data.text || null;
  const ogDescription = data.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1]
    || data.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i)?.[1];
  if (ogDescription) return decodeHtmlEntities(ogDescription).trim();
  const title = data.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? decodeHtmlEntities(title.replace(/\s+/g, ' ')).trim() : null;
}

function extractTweetMetricsFromFx(data) {
  const tweet = data?.tweet || data;
  if (!tweet || typeof tweet !== 'object') return null;
  return {
    likes: Number(tweet.likes ?? 0),
    retweets: Number(tweet.retweets ?? tweet.reposts ?? 0),
    replies: Number(tweet.replies ?? 0),
    quotes: Number(tweet.quotes ?? 0),
    bookmarks: Number(tweet.bookmarks ?? 0),
    views: tweet.views == null ? null : Number(tweet.views),
    createdAt: tweet.created_at || tweet.date || null,
    createdTimestamp: tweet.created_timestamp || tweet.date_epoch || null,
    authorFollowers: tweet.author?.followers == null ? null : Number(tweet.author.followers),
    authorVerified: Boolean(tweet.author?.verification?.verified || tweet.author?.verified),
    authorScreenName: tweet.author?.screen_name || tweet.user_screen_name || null,
  };
}

function viralityScore(metrics) {
  if (!metrics) return null;
  const views = Number(metrics.views || 0);
  const followers = Number(metrics.authorFollowers || 0);
  const engagement = Number(metrics.likes || 0)
    + Number(metrics.retweets || 0) * 2
    + Number(metrics.quotes || 0) * 2
    + Number(metrics.replies || 0);
  return {
    engagement,
    engagementPerView: views > 0 ? engagement / views * 100 : null,
    engagementPerFollower: followers > 0 ? engagement / followers * 100 : null,
  };
}

async function fetchTwitterNarrative(graduatedCoin, gmgn) {
  const url = extractTweetUrl(graduatedCoin) || extractTweetUrl(gmgn);
  if (!url) return null;
  const cached = twitterCacheGet(url);
  if (cached !== undefined) return cached;
  try {
    const apiUrl = toFxTwitterApi(url);
    const api = await axios.get(apiUrl, {
      timeout: 8000,
      headers: { Accept: 'application/json' },
    });
    const text = extractTweetTextFromFx(api.data);
    const metrics = extractTweetMetricsFromFx(api.data);
    const result = { url, fxUrl: toFxTwitter(url), apiUrl, text, metrics, virality: viralityScore(metrics) };
    twitterCacheSet(url, result, true);
    return result;
  } catch (apiErr) {
    console.log(`[twitter] api ${url} ${apiErr.response?.status || ''} ${apiErr.message}`);
    twitterCacheSet(url, null, false);
  }

  try {
    const fxUrl = toFxTwitter(url);
    const res = await axios.get(fxUrl, {
      timeout: 8000,
      headers: { Accept: 'text/html,application/json' },
    });
    const text = extractTweetTextFromFx(res.data);
    const metrics = extractTweetMetricsFromFx(res.data);
    const result = { url, fxUrl, text, metrics, virality: viralityScore(metrics) };
    twitterCacheSet(url, result, true);
    return result;
  } catch (err) {
    console.log(`[twitter] ${url} ${err.message}`);
    twitterCacheSet(url, { url, fxUrl: toFxTwitter(url), text: null, error: err.message }, false);
    return { url, fxUrl: toFxTwitter(url), text: null, error: err.message };
  }
}

export {
  extractTweetUrl,
  toFxTwitter,
  toFxTwitterApi,
  decodeHtmlEntities,
  extractTweetTextFromFx,
  extractTweetMetricsFromFx,
  viralityScore,
  fetchTwitterNarrative,
};
