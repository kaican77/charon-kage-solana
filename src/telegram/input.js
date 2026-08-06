import { bot } from './bot.js';
import { TELEGRAM_CHAT_ID } from '../config.js';
import { now, parseNumericInput } from '../utils.js';
import { activeStrategy, setSetting, updateStrategyConfig, bankrollSol, addBankroll } from '../db/settings.js';
import {
  filtersText,
  filtersKeyboard,
  numericFilterLabels,
  navKeyboard,
  strategyKeyboard,
  strategyMenuText,
  strategyNumericLabels,
} from './menus.js';

export const pendingNumericInputs = new Map();

export async function requestNumericFilterInput(query, key) {
  const chatId = query.message?.chat?.id || TELEGRAM_CHAT_ID;
  if (!numericFilterLabels[key]) return bot.sendMessage(chatId, 'Unknown numeric filter.');
  pendingNumericInputs.set(String(chatId), {
    type: 'setting',
    key,
    at: now(),
    messageId: query.message?.message_id || null,
  });
  return editMenuMessage(
    query,
    `Send a number for ${numericFilterLabels[key]}.\nExamples: 5, 50000, 100k, 1.5m, off`,
    navKeyboard([[{ text: 'Cancel', callback_data: 'menu:filters' }]]),
  );
}

export async function requestStrategyNumericInput(query, key) {
  const chatId = query.message?.chat?.id || TELEGRAM_CHAT_ID;
  if (!strategyNumericLabels[key]) return bot.sendMessage(chatId, 'Unknown strategy setting.');
  const strat = activeStrategy();
  pendingNumericInputs.set(String(chatId), {
    type: 'strategy',
    key,
    strategyId: strat.id,
    at: now(),
    messageId: query.message?.message_id || null,
  });
  return editMenuMessage(
    query,
    `Send a number for ${strat.name} ${strategyNumericLabels[key]}.\nExamples: 5, 50000, 100k, 1.5m, -40, off`,
    navKeyboard([[{ text: 'Cancel', callback_data: 'menu:strategy' }]]),
  );
}

export async function requestBankrollInput(query) {
  const chatId = query.message?.chat?.id || TELEGRAM_CHAT_ID;
  const current = bankrollSol();
  pendingNumericInputs.set(String(chatId), {
    type: 'bankroll',
    at: now(),
    messageId: query.message?.message_id || null,
  });
  return editMenuMessage(
    query,
    `💰 <b>CHARON · BANKROLL</b>\n\nCurrent: <b>${current.toFixed(4)}</b> SOL\n\nSend SOL amount to add (e.g. 0.5, 1, 2):`,
    navKeyboard([[{ text: 'Cancel', callback_data: 'menu:pnlbot' }]]),
  );
}

export async function requestPositionTpSlInput(query, positionId) {
  const chatId = query.message?.chat?.id || TELEGRAM_CHAT_ID;
  pendingNumericInputs.set(String(chatId), {
    type: 'position_tpsl',
    positionId,
    at: now(),
    messageId: query.message?.message_id || null,
  });
  return editMenuMessage(
    query,
    `🎯 <b>CHARON · POSITION #${positionId} TP/SL</b>\n\nSend TP then SL (space separated), e.g.:\n<code>50 -25</code>  (TP +50%, SL -25%)\n\nOr send one value to set only TP:\n<code>75</code>`,
    navKeyboard([[{ text: 'Cancel', callback_data: `pos:${positionId}` }]]),
  );
}

export async function consumeNumericFilterInput(chatId, text, userMessageId = null) {
  const pending = pendingNumericInputs.get(String(chatId));
  if (!pending) return false;
  if (now() - pending.at > 5 * 60 * 1000) {
    pendingNumericInputs.delete(String(chatId));
    await bot.sendMessage(chatId, 'That input expired. Tap the filter input button again.');
    return true;
  }
  const value = parseNumericInput(text);
  if (value == null) {
    await bot.sendMessage(chatId, 'Invalid number. Try 5, 50000, 100k, 1.5m, or off.');
    return true;
  }
  pendingNumericInputs.delete(String(chatId));
  if (userMessageId) bot.deleteMessage(chatId, userMessageId).catch(() => {});
  if (pending.type === 'bankroll') {
    const next = addBankroll(value);
    await bot.sendMessage(chatId, `💰 <b>CHARON · BANKROLL</b>\n\n✅ Added <b>${value}</b> SOL\n💰 Bankroll now: <b>${next.toFixed(4)}</b> SOL`, { parse_mode: 'HTML' });
    return true;
  }
  if (pending.type === 'strategy') {
    const strat = activeStrategy();
    if (strat.id !== pending.strategyId) {
      await bot.sendMessage(chatId, 'Strategy changed while input was pending. Open Strategy menu and try again.');
      return true;
    }
    const newConfig = { ...strat, [pending.key]: value };
    delete newConfig.id;
    delete newConfig.name;
    updateStrategyConfig(strat.id, newConfig);
    if (pending.messageId) {
      await bot.editMessageText(strategyMenuText(), {
        chat_id: chatId,
        message_id: pending.messageId,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...strategyKeyboard(),
      }).catch(() => bot.sendMessage(chatId, strategyMenuText(), { parse_mode: 'HTML', ...strategyKeyboard() }));
    } else {
      await bot.sendMessage(chatId, strategyMenuText(), { parse_mode: 'HTML', ...strategyKeyboard() });
    }
  } else if (pending.type === 'position_tpsl') {
    const { updatePositionRule } = await import('./commands.js');
    const [tpRaw, slRaw] = String(text).trim().split(/\s+/);
    const tp = parseNumericInput(tpRaw);
    if (tp != null && tp > 0) await updatePositionRule(chatId, pending.positionId, 'tp_percent', tp, null);
    if (slRaw !== undefined) {
      const sl = parseNumericInput(slRaw);
      if (sl != null && sl < 0) await updatePositionRule(chatId, pending.positionId, 'sl_percent', sl, null);
    }
    const { sendPosition } = await import('./commands.js');
    await sendPosition(chatId, pending.positionId, null);
  } else {
    setSetting(pending.key, String(value));
    if (pending.messageId) {
      await bot.editMessageText(filtersText(), {
        chat_id: chatId,
        message_id: pending.messageId,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...filtersKeyboard(),
      }).catch(() => bot.sendMessage(chatId, filtersText(), { parse_mode: 'HTML', ...filtersKeyboard() }));
    } else {
      await bot.sendMessage(chatId, filtersText(), { parse_mode: 'HTML', ...filtersKeyboard() });
    }
  }
  return true;
}

async function editMenuMessage(query, text, extra = {}) {
  const chatId = query.message?.chat?.id || TELEGRAM_CHAT_ID;
  const messageId = query.message?.message_id;
  if (!messageId) {
    return bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    });
  }
  try {
    return await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    });
  } catch (err) {
    if (/message is not modified/i.test(err.message)) return null;
    return bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    });
  }
}
