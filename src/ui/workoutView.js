// Экран тренировки: шапка, лента упражнений, карточка, навигация.

import { el } from './dom.js';
import { getState, goTo, next, prev, updateWorkout, setView } from '../app/state.js';
import { haptic } from '../services/telegram.js';

function isFilled(ex) {
  return (ex.todaySets || []).some((s) => String(s.weight).trim() && String(s.reps).trim());
}

function needsInput(ex) {
  return ex.plannedSets > 0 || (ex.todaySets && ex.todaySets.length);
}

function progressText(workout) {
  const done = workout.exercises.filter((e) => needsInput(e) && isFilled(e)).length;
  const total = workout.exercises.filter(needsInput).length;
  return `Заполнено ${done}/${total}`;
}

/**
 * Точечно обновляет подсветку чипов и счётчик прогресса на уже отрисованном
 * экране — без пересборки полей ввода, чтобы не терять фокус при вводе.
 */
export function refreshStatus() {
  const { workout } = getState();
  if (!workout) return;
  const chipEls = document.querySelectorAll('.chip');
  workout.exercises.forEach((ex, i) => {
    if (chipEls[i]) chipEls[i].classList.toggle('chip-done', needsInput(ex) && isFilled(ex));
  });
  const progress = document.querySelector('.wk-progress');
  if (progress) progress.textContent = progressText(workout);
}

function header(workout) {
  const bodyweight = el('input', {
    class: 'text-input bw-input',
    placeholder: '—',
    value: workout.bodyweight || '',
    onInput: (e) => updateWorkout({ bodyweight: e.target.value }, { silent: true })
  });

  return el('div', { class: 'wk-header' }, [
    el('div', { class: 'wk-title', text: workout.title || 'Тренировка' }),
    el('div', { class: 'wk-meta' }, [
      el('label', { class: 'bw-field' }, [el('span', { text: 'Собств. вес' }), bodyweight]),
      el('span', { class: 'wk-progress', text: progressText(workout) })
    ])
  ]);
}

function chips(workout, index) {
  const items = workout.exercises.map((ex, i) => {
    const cls = ['chip'];
    if (i === index) cls.push('chip-active');
    if (ex.supersetSize) cls.push('chip-superset');
    if (needsInput(ex) && isFilled(ex)) cls.push('chip-done');
    if (!needsInput(ex)) cls.push('chip-warmup');
    return el('button', {
      class: cls.join(' '),
      dataset: { index: String(i) },
      onClick: () => {
        haptic('selection');
        goTo(i);
      }
    }, [ex.numberDisplay || String(i + 1)]);
  });
  return el('div', { class: 'chips' }, items);
}

function navButtons(index, total) {
  const back = el('button', {
    class: 'btn btn-nav',
    disabled: index === 0 ? '' : null,
    onClick: () => {
      haptic('selection');
      prev();
    }
  }, ['← Назад']);

  const isLast = index === total - 1;
  const forward = el('button', {
    class: 'btn btn-nav btn-primary',
    onClick: () => {
      haptic('selection');
      if (isLast) setView('summary');
      else next();
    }
  }, [isLast ? 'К отправке →' : 'Дальше →']);

  return el('div', { class: 'wk-nav' }, [back, forward]);
}

/**
 * @param {Function} renderCard функция отрисовки карточки текущего упражнения
 */
export function renderWorkout(renderCard) {
  const { workout, index } = getState();
  const total = workout.exercises.length;

  const chipStrip = chips(workout, index);
  const card = el('div', { class: 'card-slot' }, [renderCard()]);

  const view = el('div', { class: 'view view-workout' }, [
    header(workout),
    chipStrip,
    card,
    navButtons(index, total)
  ]);

  // Проскроллить активный чип в зону видимости.
  queueMicrotask(() => {
    const active = chipStrip.querySelector('.chip-active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
  });

  return view;
}
