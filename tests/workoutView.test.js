import { describe, it, expect, beforeEach } from 'vitest';
import { setWorkout, getState, goTo, reset } from '../src/app/state.js';
import { renderWorkout } from '../src/ui/workoutView.js';

// Суперсет из двух упражнений (группа 1) + одно обычное.
function supersetWorkout(todayA, todayB) {
  return {
    title: 'Тест',
    exercises: [
      { name: 'A', numberDisplay: '1', links: [], plannedSets: 1, todaySets: todayA, supersetGroup: 1, supersetSize: 2 },
      { name: 'B', numberDisplay: '2', links: [], plannedSets: 1, todaySets: todayB, supersetGroup: 1, supersetSize: 2 }
    ]
  };
}

const card = () => document.createElement('div');

// jsdom не реализует scrollIntoView, который вызывается в микрозадаче рендера.
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

describe('renderWorkout: кнопка «Новый круг»', () => {
  beforeEach(() => reset());

  it('на последнем упражнении суперсета с незаполненными подходами показывает кнопку', () => {
    setWorkout(supersetWorkout([{ weight: '20', reps: '10' }], [{ weight: '', reps: '' }]));
    goTo(1);
    const view = renderWorkout(card);
    expect(view.querySelector('.btn-loop')).not.toBeNull();
  });

  it('клик по кнопке возвращает к первому упражнению суперсета', () => {
    setWorkout(supersetWorkout([{ weight: '20', reps: '10' }], [{ weight: '', reps: '' }]));
    goTo(1);
    renderWorkout(card).querySelector('.btn-loop').click();
    expect(getState().index).toBe(0);
  });

  it('когда все подходы суперсета заполнены — кнопки нет', () => {
    setWorkout(supersetWorkout([{ weight: '20', reps: '10' }], [{ weight: '30', reps: '8' }]));
    goTo(1);
    expect(renderWorkout(card).querySelector('.btn-loop')).toBeNull();
  });

  it('на первом упражнении суперсета кнопки нет', () => {
    setWorkout(supersetWorkout([{ weight: '', reps: '' }], [{ weight: '', reps: '' }]));
    goTo(0);
    expect(renderWorkout(card).querySelector('.btn-loop')).toBeNull();
  });
});
