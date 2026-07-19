// Разбор текста тренировки от тренера в структурированную модель.
// Формат гибкий, поэтому распознаём блоки по ключевым словам, а не по позиции.

import { parseLeadingNumber } from './emoji.js';
import { parseTask, parseSets, ensureSets } from './sets.js';

const SEPARATOR = /^[-–—_]{3,}$/;
const SUPERSET = /^суперсет\s+(\d+)\s+упражнени/i;
const HEADER = /тренировк/i;
const BODYWEIGHT = /собственн(ый|ого)\s+вес/i;
const DURATION = /время\s+тренировки/i;
const LINK = /https?:\/\/\S+/gi;

// Строки-атрибуты упражнения распознаём по ведущему слову.
const ATTR = [
  { key: 'task', test: /подход/i },
  { key: 'warmup', test: /разминк/i },
  { key: 'record', test: /рекорд/i },
  { key: 'today', test: /сегодн/i }
];

function stripBullet(line) {
  return line.replace(/^[\s▪️•·*\-]+/, '').trim();
}

function valueAfterColon(line) {
  const idx = line.indexOf(':');
  return idx === -1 ? '' : line.slice(idx + 1).trim();
}

function classifyAttr(line) {
  const clean = stripBullet(line);
  for (const attr of ATTR) {
    if (attr.test.test(clean)) {
      // "Разминка:"/"Рекорд:"/"Сегодня:" несут значение после двоеточия,
      // а задание ("3 подхода по 8-10") двоеточия не имеет — берём строку целиком.
      const value = clean.includes(':') ? valueAfterColon(clean) : clean;
      return { key: attr.key, value, raw: clean };
    }
  }
  return null;
}

function extractLinks(line) {
  const matches = line.match(LINK);
  return matches ? matches.map((l) => l.replace(/[)\].,]+$/, '')) : [];
}

function newExercise(parsedNumber) {
  return {
    number: parsedNumber.number,
    numberDisplay: parsedNumber.display,
    name: parsedNumber.rest,
    links: [],
    task: '',
    warmup: '',
    record: '',
    today: '',
    todaySets: [],
    plannedSets: 0,
    repRange: '',
    supersetLabel: null,
    supersetSize: 0,
    supersetGroup: 0
  };
}

function finalizeExercise(ex) {
  const { plannedSets, repRange } = parseTask(ex.task);
  ex.plannedSets = plannedSets;
  ex.repRange = repRange;
  const existing = parseSets(ex.today);
  // Упражнения без подходов (разминка по ссылке) не получают полей ввода.
  ex.todaySets = plannedSets > 0 || existing.length ? ensureSets(plannedSets, existing) : [];
  return ex;
}

/**
 * Разбирает вставленный текст в модель тренировки.
 * @param {string} text
 * @returns {{title:string, headerLeft:string, headerRight:string, bodyweight:string,
 *   duration:string, exercises:Array}}
 */
export function parseWorkout(text) {
  const lines = String(text || '').split(/\r?\n/);
  const model = {
    title: '',
    headerLeft: '',
    headerRight: '',
    bodyweight: '',
    duration: '',
    exercises: []
  };

  let current = null;
  let pendingSuperset = null; // {label, size, remaining, group}
  let supersetCount = 0; // сквозной номер группы суперсета для раскраски

  const push = () => {
    if (current) {
      model.exercises.push(finalizeExercise(current));
      current = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (SEPARATOR.test(line)) continue;

    if (!model.title && HEADER.test(line) && !parseLeadingNumber(line)) {
      parseHeader(line, model);
      continue;
    }

    if (BODYWEIGHT.test(line) && !parseLeadingNumber(line)) {
      model.bodyweight = valueAfterColon(line);
      continue;
    }

    if (DURATION.test(line)) {
      push();
      model.duration = valueAfterColon(line) || line;
      continue;
    }

    const superset = line.match(SUPERSET);
    if (superset) {
      push();
      const size = parseInt(superset[1], 10);
      supersetCount += 1;
      pendingSuperset = { label: line, size, remaining: size, group: supersetCount };
      continue;
    }

    const parsedNumber = parseLeadingNumber(line);
    if (parsedNumber) {
      push();
      current = newExercise(parsedNumber);
      if (pendingSuperset && pendingSuperset.remaining > 0) {
        current.supersetSize = pendingSuperset.size;
        current.supersetGroup = pendingSuperset.group;
        if (pendingSuperset.remaining === pendingSuperset.size) {
          current.supersetLabel = pendingSuperset.label;
        }
        pendingSuperset.remaining -= 1;
        if (pendingSuperset.remaining === 0) pendingSuperset = null;
      }
      const links = extractLinks(line);
      if (links.length) current.links.push(...links);
      continue;
    }

    if (!current) continue;

    const links = extractLinks(line);
    if (links.length && !classifyAttr(line)) {
      current.links.push(...links);
      continue;
    }

    const attr = classifyAttr(line);
    if (attr) {
      current[attr.key] = attr.value;
    }
  }

  push();
  return model;
}

function parseHeader(line, model) {
  model.title = line;
  // Эмодзи-рамка по краям (🟨 ... 🟨), сохраняем для восстановления.
  const emoji = line.match(/^(\P{L}*?)\s*ТРЕНИРОВК/iu);
  if (emoji && /\p{Emoji}/u.test(emoji[1] || '')) {
    model.headerLeft = emoji[1].trim();
  }
  const tail = line.match(/([^\s\w).,:а-яё]+)\s*$/iu);
  if (tail && /\p{Emoji}/u.test(tail[1] || '')) {
    model.headerRight = tail[1].trim();
  }
}
