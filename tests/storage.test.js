import { describe, it, expect, beforeEach } from 'vitest';
import { saveWorkout, loadWorkout, clearWorkout } from '../src/services/storage.js';

describe('storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('сохраняет и читает модель', () => {
    const model = { title: 'T', exercises: [{ number: 1 }] };
    expect(saveWorkout(model)).toBe(true);
    expect(loadWorkout()).toEqual(model);
  });

  it('возвращает null при отсутствии данных', () => {
    expect(loadWorkout()).toBeNull();
  });

  it('очищает сохранённое', () => {
    saveWorkout({ a: 1 });
    clearWorkout();
    expect(loadWorkout()).toBeNull();
  });

  it('устойчив к битому JSON', () => {
    window.localStorage.setItem('fitness-assistant:workout', '{неверно');
    expect(loadWorkout()).toBeNull();
  });
});
