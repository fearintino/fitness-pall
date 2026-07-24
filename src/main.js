// Точка входа: инициализация Telegram, восстановление прогресса, роутинг экранов.

import { mount } from './ui/dom.js';
import { getState, subscribe, restore } from './app/state.js';
import { renderImport } from './ui/importView.js';
import { renderWorkout } from './ui/workoutView.js';
import { renderExerciseCard } from './ui/exerciseCard.js';
import { renderSummary } from './ui/summaryView.js';
import { initTelegram, onThemeChanged } from './services/telegram.js';

const root = document.getElementById('app');

function renderCurrentCard() {
  const { workout, index } = getState();
  const ex = workout.exercises[index];
  // rerender перерисовывает карточку локально при добавлении/удалении подхода.
  const slotRender = () => {
    const slot = root.querySelector('.card-slot');
    if (slot) mount(slot, renderExerciseCard(ex, slotRender));
  };
  return renderExerciseCard(ex, slotRender);
}

function render() {
  const { view } = getState();
  // Текущий экран на body — для CSS: на тренировке навигация закреплена внизу,
  // а прокручивается только карточка.
  document.body.dataset.view = view;
  if (view === 'workout') {
    mount(root, renderWorkout(renderCurrentCard));
  } else if (view === 'summary') {
    mount(root, renderSummary());
  } else {
    mount(root, renderImport());
  }
}

function applyScheme(scheme) {
  document.documentElement.dataset.scheme = scheme;
}

function boot() {
  const tg = initTelegram();
  applyScheme(tg.colorScheme);
  onThemeChanged(applyScheme);
  restore();
  subscribe(render);
  render();
}

boot();
