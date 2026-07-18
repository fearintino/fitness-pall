// Разбор и сборка подходов.
// Задание тренера: "3 подхода по 8-10 повторений".
// Запись выполнения: "60/10 60/8 55/10" — пары вес/повторения через пробел.
// Заглушка тренера "0/0*0" означает пустой рекорд.

const PLACEHOLDER = /^0\/0\*0$/;

/**
 * Разбирает строку задания на число подходов и диапазон повторений.
 * @param {string} task
 * @returns {{plannedSets: number, repRange: string}}
 */
export function parseTask(task) {
  const text = String(task || '');
  const setsMatch = text.match(/(\d+)\s*подход/i);
  const repsMatch = text.match(/по\s*([\d\s––—-]+?)\s*повтор/i);
  return {
    plannedSets: setsMatch ? parseInt(setsMatch[1], 10) : 0,
    repRange: repsMatch ? repsMatch[1].trim() : ''
  };
}

/**
 * Разбирает строку записи подходов в массив {weight, reps}.
 * "60/10 60/8" -> [{weight:'60',reps:'10'},{weight:'60',reps:'8'}]
 * @param {string} value
 * @returns {Array<{weight: string, reps: string}>}
 */
export function parseSets(value) {
  const text = String(value || '').trim();
  if (!text || PLACEHOLDER.test(text)) return [];
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((chunk) => {
      const [weight = '', reps = ''] = chunk.split('/');
      return { weight: weight.trim(), reps: reps.trim() };
    });
}

/**
 * Собирает массив подходов обратно в строку "60/10 60/8".
 * Пустые в конце отбрасываются; частично заполненные сохраняются.
 * @param {Array<{weight: string, reps: string}>} sets
 * @returns {string}
 */
export function formatSets(sets) {
  if (!Array.isArray(sets)) return '';
  const cleaned = sets.map((s) => ({
    weight: String(s?.weight ?? '').trim(),
    reps: String(s?.reps ?? '').trim()
  }));
  while (cleaned.length && !cleaned[cleaned.length - 1].weight && !cleaned[cleaned.length - 1].reps) {
    cleaned.pop();
  }
  return cleaned.map((s) => `${s.weight}/${s.reps}`).join(' ');
}

/**
 * Создаёт массив пустых подходов заданной длины,
 * при наличии готовых значений переносит их.
 * @param {number} count
 * @param {Array<{weight: string, reps: string}>} [existing]
 * @returns {Array<{weight: string, reps: string}>}
 */
export function ensureSets(count, existing = []) {
  const total = Math.max(count, existing.length, 1);
  return Array.from({ length: total }, (_, i) => ({
    weight: existing[i]?.weight ?? '',
    reps: existing[i]?.reps ?? ''
  }));
}
