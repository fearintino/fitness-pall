import { describe, it, expect } from 'vitest';
import { parseWorkout } from '../src/core/parser.js';
import { SAMPLE } from './fixtures/workout.js';

describe('parseWorkout', () => {
  const model = parseWorkout(SAMPLE);

  it('читает заголовок и эмодзи-рамку', () => {
    expect(model.title).toContain('ТРЕНИРОВКА 01.07.2026');
    expect(model.headerLeft).toBe('🟨');
    expect(model.headerRight).toBe('🟨');
  });

  it('находит все упражнения', () => {
    expect(model.exercises).toHaveLength(6);
  });

  it('первое — разминка по ссылке без подходов', () => {
    const warmup = model.exercises[0];
    expect(warmup.number).toBe(0);
    expect(warmup.name).toBe('Суставная разминка');
    expect(warmup.links).toEqual(['https://t.me/c/2414299872/3']);
    expect(warmup.todaySets).toEqual([]);
  });

  it('разбирает подходы и рекорд упражнения', () => {
    const bench = model.exercises[1];
    expect(bench.name).toContain('Жим гантелей');
    expect(bench.plannedSets).toBe(3);
    expect(bench.repRange).toBe('8-10');
    expect(bench.record).toBe('0/0*0');
    expect(bench.todaySets).toHaveLength(3);
  });

  it('переносит уже заполненный рекорд с дробным весом', () => {
    expect(model.exercises[2].record).toBe('7,5/10 10/10 10/10');
  });

  it('размечает суперсет', () => {
    const first = model.exercises[3];
    const second = model.exercises[4];
    expect(first.supersetLabel).toMatch(/Суперсет 2/);
    expect(first.supersetSize).toBe(2);
    expect(second.supersetLabel).toBeNull();
    expect(second.supersetSize).toBe(2);
    expect(model.exercises[5].supersetSize).toBe(0);
  });

  it('собирает несколько ссылок упражнения', () => {
    expect(model.exercises[5].links).toHaveLength(2);
  });

  it('двузначный номер упражнения', () => {
    expect(model.exercises[5].numberDisplay).toBe('1️⃣0️⃣');
    expect(model.exercises[5].number).toBe(10);
  });

  it('читает строку длительности', () => {
    expect(model.duration).toContain('?');
  });

  it('размечает первую группу суперсета номером 1', () => {
    expect(model.exercises[3].supersetGroup).toBe(1);
    expect(model.exercises[4].supersetGroup).toBe(1);
    expect(model.exercises[1].supersetGroup).toBe(0);
  });

  it('нумерует разные суперсеты разными группами', () => {
    const text = [
      'Суперсет 2 упражнения:',
      '1️⃣ A',
      '▪️ 3 подхода по 10 повторений',
      '2️⃣ B',
      '▪️ 3 подхода по 10 повторений',
      'Суперсет 2 упражнения:',
      '3️⃣ C',
      '▪️ 3 подхода по 10 повторений',
      '4️⃣ D',
      '▪️ 3 подхода по 10 повторений'
    ].join('\n');
    const groups = parseWorkout(text).exercises.map((e) => e.supersetGroup);
    expect(groups).toEqual([1, 1, 2, 2]);
  });

  it('устойчив к пустому вводу', () => {
    const empty = parseWorkout('');
    expect(empty.exercises).toEqual([]);
  });
});
