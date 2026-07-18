// Изоляция Telegram WebApp SDK от бизнес-логики.
// Вне Telegram (в обычном браузере) работают безопасные заглушки.

function getWebApp() {
  return typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;
}

export function initTelegram() {
  const tg = getWebApp();
  if (!tg) return { available: false, colorScheme: 'light' };
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('secondary_bg_color');
  } catch (_) {
    /* старые версии Bot API */
  }
  return { available: true, colorScheme: tg.colorScheme || 'light' };
}

export function onThemeChanged(handler) {
  const tg = getWebApp();
  if (!tg || !tg.onEvent) return;
  tg.onEvent('themeChanged', () => handler(tg.colorScheme || 'light'));
}

/** Открыть t.me ссылку (видео упражнения) внутри Telegram. */
export function openLink(url) {
  const tg = getWebApp();
  if (tg && /t\.me\//.test(url) && tg.openTelegramLink) {
    tg.openTelegramLink(url);
  } else if (tg && tg.openLink) {
    tg.openLink(url);
  } else if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener');
  }
}

/** Тактильный отклик. type: 'impact' | 'success' | 'warning' | 'error' | 'selection'. */
export function haptic(type = 'impact') {
  const tg = getWebApp();
  const hf = tg && tg.HapticFeedback;
  if (!hf) return;
  try {
    if (type === 'selection') hf.selectionChanged();
    else if (['success', 'warning', 'error'].includes(type)) hf.notificationOccurred(type);
    else hf.impactOccurred('light');
  } catch (_) {
    /* не поддерживается */
  }
}

/**
 * Управление главной кнопкой Telegram.
 * @param {{text:string, onClick:Function, visible?:boolean}} opts
 */
export function setMainButton({ text, onClick, visible = true }) {
  const tg = getWebApp();
  if (!tg || !tg.MainButton) return () => {};
  const mb = tg.MainButton;
  mb.setText(text);
  mb.offClick && mb.offClick();
  const handler = () => onClick();
  mb.onClick(handler);
  if (visible) mb.show();
  else mb.hide();
  return () => {
    mb.offClick && mb.offClick(handler);
    mb.hide();
  };
}

export function hideMainButton() {
  const tg = getWebApp();
  if (tg && tg.MainButton) tg.MainButton.hide();
}
