import { describe, it, expect } from 'vitest';
import { parseTask, parseSets, formatSets, ensureSets } from '../src/core/sets.js';

describe('parseTask', () => {
  it('разбирает подходы и диапазон', () => {
    expect(parseTask('3 подхода по 8-10 повторений')).toEqual({ plannedSets: 3, repRange: '8-10' });
  });

  it('разбирает одиночное число повторений', () => {
    expect(parseTask('3 подхода по 15 повторений')).toEqual({ plannedSets: 3, repRange: '15' });
  });

  it('разбирает 4 подхода', () => {
    expect(parseTask('4 подхода по 10-12 повторений').plannedSets).toBe(4);
  });

  it('пустое задание', () => {
    expect(parseTask('')).toEqual({ plannedSets: 0, repRange: '' });
  });
});

describe('parseSets', () => {
  it('разбирает пары вес/повторы', () => {
    expect(parseSets('60/10 60/8 55/10')).toEqual([
      { weight: '60', reps: '10' },
      { weight: '60', reps: '8' },
      { weight: '55', reps: '10' }
    ]);
  });

  it('поддерживает дробный вес', () => {
    expect(parseSets('7,5/10')).toEqual([{ weight: '7,5', reps: '10' }]);
  });

  it('заглушка 0/0*0 считается пустой', () => {
    expect(parseSets('0/0*0')).toEqual([]);
  });

  it('пустая строка', () => {
    expect(parseSets('')).toEqual([]);
  });
});

describe('formatSets', () => {
  it('собирает строку', () => {
    expect(formatSets([{ weight: '60', reps: '10' }, { weight: '55', reps: '8' }])).toBe('60/10 55/8');
  });

  it('отбрасывает пустые хвостовые подходы', () => {
    expect(formatSets([{ weight: '60', reps: '10' }, { weight: '', reps: '' }])).toBe('60/10');
  });

  it('пустой массив -> пустая строка', () => {
    expect(formatSets([])).toBe('');
  });
});

describe('ensureSets', () => {
  it('создаёт нужное число пустых подходов', () => {
    expect(ensureSets(3)).toHaveLength(3);
  });

  it('переносит существующие значения', () => {
    const r = ensureSets(3, [{ weight: '60', reps: '10' }]);
    expect(r[0]).toEqual({ weight: '60', reps: '10' });
    expect(r[2]).toEqual({ weight: '', reps: '' });
  });

  it('расширяется под лишние существующие', () => {
    expect(ensureSets(1, [{ weight: '1', reps: '1' }, { weight: '2', reps: '2' }])).toHaveLength(2);
  });
});
