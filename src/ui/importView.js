// Экран импорта: вставка текста тренировки от тренера.

import { el } from './dom.js';
import { parseWorkout } from '../core/parser.js';
import { setWorkout } from '../app/state.js';
import { haptic } from '../services/telegram.js';

export function renderImport() {
  const textarea = el('textarea', {
    class: 'import-area',
    placeholder: 'Вставьте сюда сообщение с тренировкой от тренера…',
    rows: '12'
  });

  const error = el('div', { class: 'import-error' });

  const load = () => {
    const model = parseWorkout(textarea.value);
    if (!model.exercises.length) {
      error.textContent = 'Не удалось распознать упражнения. Проверьте, что текст скопирован полностью.';
      haptic('error');
      return;
    }
    haptic('success');
    setWorkout(model);
  };

  const button = el('button', { class: 'btn btn-primary btn-block', onClick: load }, [
    'Загрузить тренировку'
  ]);

  return el('div', { class: 'view view-import' }, [
    el('div', { class: 'hero' }, [
      el('h1', { class: 'hero-title', text: 'Дневник тренировки' }),
      el('p', {
        class: 'hero-sub',
        text: 'Вставьте план от тренера — заполняйте подходы в удобной форме и отправляйте обратно тем же текстом.'
      })
    ]),
    textarea,
    error,
    button
  ]);
}
