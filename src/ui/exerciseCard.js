// Карточка одного упражнения: подходы, разминка, видео, суперсет.

import { el } from './dom.js';
import { ensureSets } from '../core/sets.js';
import { updateExercise } from '../app/state.js';
import { openLink, haptic } from '../services/telegram.js';
import { renderRestTimer } from './restTimer.js';
import { refreshStatus } from './workoutView.js';

// silent: правки при вводе не перерисовывают карточку (иначе теряется фокус
// поля и на телефоне закрывается клавиатура). Данные всё равно сохраняются.
function commitSets(ex, sets, silent = true) {
  updateExercise({ todaySets: sets.map((s) => ({ ...s })) }, { silent });
}

// onValue — правка значения (тихо, без перерисовки).
// onCommit — обновить подсветку статуса (по blur и кнопкам степпера, когда
// фокус текстового поля не удерживается и клавиатуре ничего не грозит).
function stepper(value, onValue, onCommit) {
  const input = el('input', {
    class: 'set-input',
    type: 'text',
    inputmode: 'decimal',
    value: value ?? '',
    onInput: (e) => onValue(e.target.value),
    onBlur: () => onCommit && onCommit()
  });
  const step = (delta) => {
    const n = parseFloat(String(input.value).replace(',', '.')) || 0;
    input.value = Math.max(0, n + delta);
    onValue(input.value);
    if (onCommit) onCommit();
    haptic('selection');
  };
  const dec = el('button', { class: 'step-btn', text: '−', onClick: () => step(-1) });
  const inc = el('button', { class: 'step-btn', text: '+', onClick: () => step(1) });
  return el('div', { class: 'stepper' }, [dec, input, inc]);
}

function setRow(ex, sets, i, rerender) {
  const set = sets[i];
  const weight = stepper(
    set.weight,
    (v) => {
      sets[i].weight = v;
      commitSets(ex, sets);
    },
    refreshStatus
  );
  const reps = stepper(
    set.reps,
    (v) => {
      sets[i].reps = v;
      commitSets(ex, sets);
    },
    refreshStatus
  );
  const remove = el('button', {
    class: 'set-remove',
    text: '×',
    title: 'Убрать подход',
    onClick: () => {
      sets.splice(i, 1);
      commitSets(ex, sets);
      rerender();
      refreshStatus();
    }
  });
  return el('div', { class: 'set-row' }, [
    el('span', { class: 'set-index', text: `${i + 1}` }),
    el('div', { class: 'set-fields' }, [
      weight,
      el('span', { class: 'set-sep', text: 'кг ×' }),
      reps,
      el('span', { class: 'set-unit', text: 'повт' })
    ]),
    remove
  ]);
}

function setsBlock(ex, rerender) {
  const sets = ensureSets(ex.plannedSets, ex.todaySets || []);
  const rows = sets.map((_, i) => setRow(ex, sets, i, rerender));
  const add = el('button', {
    class: 'btn btn-ghost btn-block',
    onClick: () => {
      sets.push({ weight: '', reps: '' });
      commitSets(ex, sets);
      rerender();
      refreshStatus();
    }
  }, ['+ подход']);
  return el('div', { class: 'sets' }, [...rows, add]);
}

function videoButtons(ex) {
  if (!ex.links.length) return null;
  const buttons = ex.links.map((url, i) =>
    el('button', {
      class: 'btn btn-video',
      onClick: () => {
        haptic('impact');
        openLink(url);
      }
    }, [ex.links.length > 1 ? `▶ Видео ${i + 1}` : '▶ Видео упражнения'])
  );
  return el('div', { class: 'video-row' }, buttons);
}

/**
 * @param {object} ex упражнение
 * @param {Function} rerender перерисовать карточку
 */
export function renderExerciseCard(ex, rerender) {
  const children = [];

  if (ex.supersetSize) {
    children.push(
      el('div', { class: 'superset-badge', text: ex.supersetLabel || `Суперсет · ${ex.supersetSize} упр.` })
    );
  }

  children.push(el('h2', { class: 'ex-name' }, [`${ex.numberDisplay} ${ex.name}`]));

  const video = videoButtons(ex);
  if (video) children.push(video);

  if (ex.plannedSets || (ex.todaySets && ex.todaySets.length)) {
    if (ex.task) children.push(el('div', { class: 'ex-task', text: ex.task }));
    if (ex.record) children.push(el('div', { class: 'ex-record', text: `Рекорд: ${ex.record}` }));

    const warmup = el('input', {
      class: 'text-input',
      placeholder: 'Разминка (напр. 20/10 40/10)',
      value: ex.warmup || '',
      onInput: (e) => updateExercise({ warmup: e.target.value }, { silent: true })
    });
    children.push(el('label', { class: 'field' }, [el('span', { class: 'field-label', text: 'Разминка' }), warmup]));

    children.push(setsBlock(ex, rerender));
    children.push(renderRestTimer());
  } else {
    children.push(el('p', { class: 'ex-hint', text: 'Разминочное упражнение — заполнять подходы не нужно.' }));
  }

  return el('div', { class: 'card exercise-card' }, children);
}
