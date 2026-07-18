import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initTelegram, openLink, haptic, setMainButton, hideMainButton } from '../src/services/telegram.js';

function mockWebApp(overrides = {}) {
  return {
    colorScheme: 'dark',
    ready: vi.fn(),
    expand: vi.fn(),
    setHeaderColor: vi.fn(),
    openTelegramLink: vi.fn(),
    openLink: vi.fn(),
    HapticFeedback: {
      impactOccurred: vi.fn(),
      notificationOccurred: vi.fn(),
      selectionChanged: vi.fn()
    },
    MainButton: {
      setText: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
      show: vi.fn(),
      hide: vi.fn()
    },
    ...overrides
  };
}

describe('telegram service', () => {
  beforeEach(() => {
    delete window.Telegram;
  });

  it('без SDK возвращает недоступность и не падает', () => {
    expect(initTelegram()).toEqual({ available: false, colorScheme: 'light' });
    expect(() => haptic('success')).not.toThrow();
    expect(setMainButton({ text: 'x', onClick: () => {} })()).toBeUndefined();
  });

  it('инициализирует SDK', () => {
    const tg = mockWebApp();
    window.Telegram = { WebApp: tg };
    const res = initTelegram();
    expect(tg.ready).toHaveBeenCalled();
    expect(tg.expand).toHaveBeenCalled();
    expect(res).toEqual({ available: true, colorScheme: 'dark' });
  });

  it('открывает t.me ссылку через openTelegramLink', () => {
    const tg = mockWebApp();
    window.Telegram = { WebApp: tg };
    openLink('https://t.me/c/1/2');
    expect(tg.openTelegramLink).toHaveBeenCalledWith('https://t.me/c/1/2');
  });

  it('выбирает тип тактильного отклика', () => {
    const tg = mockWebApp();
    window.Telegram = { WebApp: tg };
    haptic('success');
    haptic('selection');
    haptic();
    expect(tg.HapticFeedback.notificationOccurred).toHaveBeenCalledWith('success');
    expect(tg.HapticFeedback.selectionChanged).toHaveBeenCalled();
    expect(tg.HapticFeedback.impactOccurred).toHaveBeenCalledWith('light');
  });

  it('настраивает главную кнопку и возвращает cleanup', () => {
    const tg = mockWebApp();
    window.Telegram = { WebApp: tg };
    const onClick = vi.fn();
    const cleanup = setMainButton({ text: 'Готово', onClick });
    expect(tg.MainButton.setText).toHaveBeenCalledWith('Готово');
    expect(tg.MainButton.show).toHaveBeenCalled();
    cleanup();
    expect(tg.MainButton.hide).toHaveBeenCalled();
    hideMainButton();
    expect(tg.MainButton.hide).toHaveBeenCalledTimes(2);
  });
});
