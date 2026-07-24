import { describe, it, expect, beforeEach } from 'vitest';
import { setWorkout, getState, reset } from '../src/app/state.js';
import { renderExerciseCard } from '../src/ui/exerciseCard.js';

function workoutWith(todaySets) {
  return {
    title: 'Тест',
    exercises: [
      {
        name: 'Жим',
        numberDisplay: '1',
        links: [],
        plannedSets: 2,
        todaySets,
        warmup: '',
        supersetGroup: 0,
        supersetSize: 0
      }
    ]
  };
}

describe('renderExerciseCard: копирование подхода', () => {
  beforeEach(() => reset());

  it('у первого подхода нет кнопки копирования, у второго — есть', () => {
    setWorkout(workoutWith([{ weight: '60', reps: '10' }, { weight: '', reps: '' }]));
    const card = renderExerciseCard(getState().workout.exercises[0], () => {});
    const rows = card.querySelectorAll('.set-row');
    expect(rows[0].querySelector('.set-copy')).toBeNull();
    expect(rows[1].querySelector('.set-copy')).not.toBeNull();
  });

  it('клик по кнопке копирует вес и повторения из предыдущего подхода', () => {
    setWorkout(workoutWith([{ weight: '60', reps: '10' }, { weight: '', reps: '' }]));
    const card = renderExerciseCard(getState().workout.exercises[0], () => {});
    card.querySelectorAll('.set-row')[1].querySelector('.set-copy').click();
    expect(getState().workout.exercises[0].todaySets[1]).toEqual({ weight: '60', reps: '10' });
  });
});
