// Таймер отдыха между подходами. Автономный компонент с собственным интервалом.

import { el } from './dom.js';
import { haptic } from '../services/telegram.js';

const PRESETS = [60, 90, 120];

export function renderRestTimer() {
  let remaining = 0;
  let timer = null;

  const display = el('span', { class: 'timer-display', text: 'Отдых' });
  const wrap = el('div', { class: 'rest-timer' });

  function format(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    remaining = 0;
    display.textContent = 'Отдых';
    wrap.classList.remove('running');
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      stop();
      haptic('success');
      return;
    }
    display.textContent = format(remaining);
  }

  function start(sec) {
    if (timer) clearInterval(timer);
    remaining = sec;
    display.textContent = format(remaining);
    wrap.classList.add('running');
    haptic('impact');
    timer = setInterval(tick, 1000);
  }

  const buttons = PRESETS.map((sec) =>
    el('button', { class: 'btn btn-chip', onClick: () => start(sec) }, [`${sec}с`])
  );
  const stopBtn = el('button', { class: 'btn btn-chip btn-stop', onClick: stop }, ['Стоп']);

  wrap.append(display, ...buttons, stopBtn);
  wrap._dispose = stop; // остановить интервал при перерисовке
  return wrap;
}
