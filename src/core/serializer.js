// Сборка заполненной модели обратно в текст формата тренера.
// Выход визуально повторяет исходное сообщение, чтобы тренеру было привычно читать.

import { formatSets } from './sets.js';

const BULLET = '▪️';
const SEPARATOR = '--------------------------------';

function line(bullet, label, value) {
  const tail = value ? ` ${value}` : '';
  return `${bullet} ${label}:${tail}`;
}

function serializeExercise(ex) {
  const rows = [`${ex.numberDisplay} ${ex.name}`.trim()];
  if (ex.links.length) rows.push(ex.links.join(' или '));
  if (ex.task) rows.push(`${BULLET} ${ex.task}`);
  // Записанные подходы имеют приоритет над исходной строкой "Сегодня".
  const today = ex.todaySets && ex.todaySets.length ? formatSets(ex.todaySets) : ex.today;
  if (ex.task || ex.warmup || ex.record || today) {
    rows.push(line(BULLET, 'Разминка', ex.warmup));
    rows.push(line(BULLET, 'Рекорд', ex.record));
    rows.push(line(BULLET, 'Сегодня', today));
  }
  return rows.join('\n');
}

/**
 * Собирает модель тренировки в текст.
 * @param {object} model
 * @returns {string}
 */
export function serializeWorkout(model) {
  if (!model) return '';
  const out = [];

  if (model.title) {
    out.push(model.title);
  } else {
    const left = model.headerLeft ? `${model.headerLeft} ` : '';
    const right = model.headerRight || '';
    out.push(`${left}ТРЕНИРОВКА${right ? ` ${right}` : ''}`.trim());
  }
  out.push(`Собственный вес:${model.bodyweight ? ` ${model.bodyweight}` : ''}`);
  out.push('');

  (model.exercises || []).forEach((ex, index) => {
    if (ex.supersetLabel) {
      if (index > 0) out.push(SEPARATOR);
      out.push('');
      out.push(ex.supersetLabel);
      out.push('');
    } else if (index > 0) {
      out.push(SEPARATOR);
    }
    out.push(serializeExercise(ex));
  });

  out.push(SEPARATOR);
  out.push(`Время тренировки:${model.duration ? ` ${model.duration}` : ' ? ч ? мин'}`);

  return out.join('\n');
}
