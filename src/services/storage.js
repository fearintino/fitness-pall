// Изоляция localStorage: автосохранение прогресса тренировки.

const KEY = 'fitness-assistant:workout';

function getStore() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch (_) {
    return null; // приватный режим/недоступно
  }
}

/** @param {object} model */
export function saveWorkout(model) {
  const store = getStore();
  if (!store) return false;
  try {
    store.setItem(KEY, JSON.stringify(model));
    return true;
  } catch (_) {
    return false;
  }
}

/** @returns {object|null} */
export function loadWorkout() {
  const store = getStore();
  if (!store) return null;
  try {
    const raw = store.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function clearWorkout() {
  const store = getStore();
  if (!store) return;
  try {
    store.removeItem(KEY);
  } catch (_) {
    /* игнорируем */
  }
}
