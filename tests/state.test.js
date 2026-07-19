import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setWorkout,
  updateExercise,
  updateWorkout,
  goTo,
  next,
  prev,
  getState,
  subscribe,
  reset,
  restore
} from '../src/app/state.js';
import { loadWorkout } from '../src/services/storage.js';

function sampleModel() {
  return {
    title: 'Тест',
    bodyweight: '',
    duration: '',
    exercises: [
      { number: 1, todaySets: [{ weight: '', reps: '' }], plannedSets: 3 },
      { number: 2, todaySets: [], plannedSets: 3 }
    ]
  };
}

describe('state', () => {
  beforeEach(() => {
    window.localStorage.clear();
    reset();
  });

  it('setWorkout переключает на экран тренировки и сохраняет', () => {
    setWorkout(sampleModel());
    expect(getState().view).toBe('workout');
    expect(getState().index).toBe(0);
    expect(loadWorkout().exercises).toHaveLength(2);
  });

  it('updateExercise без silent уведомляет подписчиков', () => {
    setWorkout(sampleModel());
    const spy = vi.fn();
    const off = subscribe(spy);
    updateExercise({ warmup: '20/10' });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(getState().workout.exercises[0].warmup).toBe('20/10');
    off();
  });

  it('updateExercise с silent сохраняет, но не перерисовывает', () => {
    setWorkout(sampleModel());
    const spy = vi.fn();
    const off = subscribe(spy);
    updateExercise({ warmup: '30/10' }, { silent: true });
    expect(spy).not.toHaveBeenCalled();
    expect(loadWorkout().exercises[0].warmup).toBe('30/10');
    off();
  });

  it('updateWorkout с silent не уведомляет, но пишет в хранилище', () => {
    setWorkout(sampleModel());
    const spy = vi.fn();
    const off = subscribe(spy);
    updateWorkout({ bodyweight: '82' }, { silent: true });
    expect(spy).not.toHaveBeenCalled();
    expect(loadWorkout().bodyweight).toBe('82');
    off();
  });

  it('навигация ограничена границами списка', () => {
    setWorkout(sampleModel());
    prev();
    expect(getState().index).toBe(0);
    next();
    expect(getState().index).toBe(1);
    next();
    expect(getState().index).toBe(1);
    goTo(0);
    expect(getState().index).toBe(0);
  });

  it('restore поднимает сохранённую тренировку', () => {
    setWorkout(sampleModel());
    reset();
    expect(getState().workout).toBeNull();
    // reset очищает хранилище, поэтому кладём заново
    setWorkout(sampleModel());
    getState().workout = null;
    expect(restore()).toBe(true);
    expect(getState().view).toBe('workout');
  });
});
