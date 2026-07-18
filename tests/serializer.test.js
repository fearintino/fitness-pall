import { describe, it, expect } from 'vitest';
import { parseWorkout } from '../src/core/parser.js';
import { serializeWorkout } from '../src/core/serializer.js';
import { SAMPLE } from './fixtures/workout.js';

describe('serializeWorkout', () => {
  it('восстанавливает заголовок и рамку', () => {
    const model = parseWorkout(SAMPLE);
    const text = serializeWorkout(model);
    expect(text).toContain('🟨 ТРЕНИРОВКА 01.07.2026 (ср)🟨');
    expect(text).toContain('Собственный вес:');
  });

  it('вписывает заполненные подходы в строку "Сегодня"', () => {
    const model = parseWorkout(SAMPLE);
    model.exercises[1].todaySets = [
      { weight: '60', reps: '10' },
      { weight: '60', reps: '8' },
      { weight: '55', reps: '10' }
    ];
    const text = serializeWorkout(model);
    expect(text).toContain('▪️ Сегодня: 60/10 60/8 55/10');
  });

  it('сохраняет метку суперсета', () => {
    const model = parseWorkout(SAMPLE);
    expect(serializeWorkout(model)).toContain('Суперсет 2 упражнения:');
  });

  it('сохраняет несколько ссылок через "или"', () => {
    const model = parseWorkout(SAMPLE);
    expect(serializeWorkout(model)).toContain(' или ');
  });

  it('round-trip сохраняет число упражнений', () => {
    const model = parseWorkout(SAMPLE);
    const reparsed = parseWorkout(serializeWorkout(model));
    expect(reparsed.exercises).toHaveLength(model.exercises.length);
  });

  it('подставляет длительность и собственный вес', () => {
    const model = parseWorkout(SAMPLE);
    model.bodyweight = '80';
    model.duration = '1 ч 20 мин';
    const text = serializeWorkout(model);
    expect(text).toContain('Собственный вес: 80');
    expect(text).toContain('Время тренировки: 1 ч 20 мин');
  });

  it('пустая модель не роняет сериализатор', () => {
    expect(serializeWorkout(null)).toBe('');
  });
});
