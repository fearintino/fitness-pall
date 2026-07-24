import { describe, it, expect } from 'vitest';
import {
  supersetIndices,
  isLastInSuperset,
  firstIndexOfSuperset,
  supersetComplete
} from '../src/core/superset.js';

// Упражнения 1,2 — обычные; 3,4 — суперсет (группа 1); 5 — обычное.
function makeExercises() {
  return [
    { supersetGroup: 0, plannedSets: 3, todaySets: [] },
    { supersetGroup: 0, plannedSets: 3, todaySets: [] },
    { supersetGroup: 1, plannedSets: 2, todaySets: [] },
    { supersetGroup: 1, plannedSets: 2, todaySets: [] },
    { supersetGroup: 0, plannedSets: 3, todaySets: [] }
  ];
}

describe('supersetIndices', () => {
  it('возвращает индексы упражнений группы', () => {
    expect(supersetIndices(makeExercises(), 1)).toEqual([2, 3]);
  });

  it('для нулевой группы — пусто', () => {
    expect(supersetIndices(makeExercises(), 0)).toEqual([]);
  });
});

describe('isLastInSuperset', () => {
  it('последнее упражнение суперсета', () => {
    expect(isLastInSuperset(makeExercises(), 3)).toBe(true);
  });

  it('первое упражнение суперсета — не последнее', () => {
    expect(isLastInSuperset(makeExercises(), 2)).toBe(false);
  });

  it('упражнение вне суперсета', () => {
    expect(isLastInSuperset(makeExercises(), 0)).toBe(false);
  });

  it('одиночное упражнение в группе не считается суперсетом', () => {
    const ex = [{ supersetGroup: 1, plannedSets: 1, todaySets: [] }];
    expect(isLastInSuperset(ex, 0)).toBe(false);
  });
});

describe('firstIndexOfSuperset', () => {
  it('возвращает индекс первого упражнения группы', () => {
    expect(firstIndexOfSuperset(makeExercises(), 3)).toBe(2);
  });

  it('вне суперсета — сам индекс', () => {
    expect(firstIndexOfSuperset(makeExercises(), 0)).toBe(0);
  });
});

describe('supersetComplete', () => {
  it('незаполненная группа — не завершена', () => {
    expect(supersetComplete(makeExercises(), 1)).toBe(false);
  });

  it('все подходы группы заполнены — завершена', () => {
    const ex = makeExercises();
    ex[2].todaySets = [{ weight: '20', reps: '10' }, { weight: '20', reps: '10' }];
    ex[3].todaySets = [{ weight: '30', reps: '8' }, { weight: '30', reps: '8' }];
    expect(supersetComplete(ex, 1)).toBe(true);
  });

  it('частично заполненная группа — не завершена', () => {
    const ex = makeExercises();
    ex[2].todaySets = [{ weight: '20', reps: '10' }, { weight: '20', reps: '10' }];
    ex[3].todaySets = [{ weight: '30', reps: '8' }]; // второй подход пуст
    expect(supersetComplete(ex, 1)).toBe(false);
  });

  it('пустая группа считается завершённой', () => {
    expect(supersetComplete(makeExercises(), 99)).toBe(true);
  });
});
