// Состояние приложения: текущая тренировка, активное упражнение, автосохранение.

import { saveWorkout, loadWorkout, clearWorkout } from '../services/storage.js';

const listeners = new Set();
const state = {
  workout: null, // модель тренировки
  index: 0, // индекс активного упражнения
  view: 'import' // 'import' | 'workout' | 'summary'
};

function emit() {
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function setWorkout(workout) {
  state.workout = workout;
  state.index = 0;
  state.view = 'workout';
  persist();
  emit();
}

export function setView(view) {
  state.view = view;
  emit();
}

export function goTo(index) {
  const total = state.workout?.exercises.length || 0;
  state.index = Math.max(0, Math.min(index, total - 1));
  emit();
}

export function next() {
  goTo(state.index + 1);
}

export function prev() {
  goTo(state.index - 1);
}

/**
 * Обновляет текущее упражнение (мутация полей) и сохраняет.
 * silent=true — не перерисовывать (для ввода текста, чтобы не терять фокус).
 */
export function updateExercise(patch, { silent = false } = {}) {
  const ex = state.workout?.exercises[state.index];
  if (!ex) return;
  Object.assign(ex, patch);
  persist();
  if (!silent) emit();
}

export function updateWorkout(patch, { silent = false } = {}) {
  if (!state.workout) return;
  Object.assign(state.workout, patch);
  persist();
  if (!silent) emit();
}

export function reset() {
  state.workout = null;
  state.index = 0;
  state.view = 'import';
  clearWorkout();
  emit();
}

export function restore() {
  const saved = loadWorkout();
  if (saved && Array.isArray(saved.exercises) && saved.exercises.length) {
    state.workout = saved;
    state.view = 'workout';
    return true;
  }
  return false;
}

function persist() {
  if (state.workout) saveWorkout(state.workout);
}
