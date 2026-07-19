// Экран итога: собранный текст для тренера, копирование и отправка.

import { el } from './dom.js';
import { getState, updateWorkout, setView, reset } from '../app/state.js';
import { serializeWorkout } from '../core/serializer.js';
import { openLink, haptic } from '../services/telegram.js';

async function copyText(text, feedback) {
  try {
    await navigator.clipboard.writeText(text);
    feedback('Скопировано в буфер');
    haptic('success');
  } catch (_) {
    feedback('Выделите текст и скопируйте вручную');
    haptic('error');
  }
}

export function renderSummary() {
  const { workout } = getState();
  const text = serializeWorkout(workout);

  const output = el('textarea', { class: 'summary-area', rows: '16', readonly: '' });
  output.value = text;

  const status = el('div', { class: 'summary-status' });
  const setStatus = (msg) => {
    status.textContent = msg;
  };

  const duration = el('input', {
    class: 'text-input',
    placeholder: '? ч ? мин',
    value: workout.duration || '',
    onInput: (e) => {
      updateWorkout({ duration: e.target.value }, { silent: true });
      output.value = serializeWorkout(getState().workout);
    }
  });

  const copyBtn = el('button', {
    class: 'btn btn-primary btn-block',
    onClick: () => copyText(output.value, setStatus)
  }, ['Скопировать текст']);

  const shareBtn = el('button', {
    class: 'btn btn-block',
    onClick: () => {
      haptic('impact');
      openLink(`https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encodeURIComponent(output.value)}`);
    }
  }, ['Отправить через Telegram']);

  const backBtn = el('button', {
    class: 'btn btn-ghost btn-block',
    onClick: () => setView('workout')
  }, ['← Вернуться к тренировке']);

  const newBtn = el('button', {
    class: 'btn btn-ghost btn-block btn-danger',
    onClick: () => {
      if (confirm('Начать новую тренировку? Текущие записи удалятся.')) reset();
    }
  }, ['Новая тренировка']);

  return el('div', { class: 'view view-summary' }, [
    el('h2', { class: 'summary-title', text: 'Готово к отправке' }),
    el('label', { class: 'field' }, [
      el('span', { class: 'field-label', text: 'Время тренировки' }),
      duration
    ]),
    output,
    status,
    copyBtn,
    shareBtn,
    backBtn,
    newBtn
  ]);
}
