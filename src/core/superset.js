// Логика суперсетов: границы группы и проверка завершённости круга.

import { ensureSets } from './sets.js';

function isSetComplete(s) {
  return String(s?.weight ?? '').trim() !== '' && String(s?.reps ?? '').trim() !== '';
}

function exerciseSetsComplete(ex) {
  const sets = ensureSets(ex.plannedSets, ex.todaySets || []);
  return sets.every(isSetComplete);
}

/**
 * Индексы упражнений одного суперсета (по supersetGroup).
 * @param {Array} exercises
 * @param {number} group
 * @returns {number[]}
 */
export function supersetIndices(exercises, group) {
  if (!group) return [];
  return exercises.reduce((acc, ex, i) => {
    if (ex.supersetGroup === group) acc.push(i);
    return acc;
  }, []);
}

/**
 * Является ли упражнение последним в своём суперсете (в группе больше одного).
 * @param {Array} exercises
 * @param {number} index
 * @returns {boolean}
 */
export function isLastInSuperset(exercises, index) {
  const ex = exercises[index];
  if (!ex || !ex.supersetGroup) return false;
  const idx = supersetIndices(exercises, ex.supersetGroup);
  return idx.length > 1 && idx[idx.length - 1] === index;
}

/**
 * Индекс первого упражнения суперсета текущего упражнения.
 * @param {Array} exercises
 * @param {number} index
 * @returns {number}
 */
export function firstIndexOfSuperset(exercises, index) {
  const ex = exercises[index];
  if (!ex || !ex.supersetGroup) return index;
  const idx = supersetIndices(exercises, ex.supersetGroup);
  return idx.length ? idx[0] : index;
}

/**
 * Завершён ли круг суперсета: все подходы всех упражнений группы заполнены.
 * @param {Array} exercises
 * @param {number} group
 * @returns {boolean}
 */
export function supersetComplete(exercises, group) {
  const idx = supersetIndices(exercises, group);
  if (!idx.length) return true;
  return idx.every((i) => exerciseSetsComplete(exercises[i]));
}
