// Цвета для визуального различения суперсетов.
// Подобраны читаемыми и на светлой, и на тёмной теме; при большем числе
// групп палитра циклится.

export const SUPERSET_COLORS = [
  '#2dd4bf', // бирюзовый
  '#f59e0b', // янтарный
  '#a78bfa', // фиолетовый
  '#f472b6', // розовый
  '#34d399', // зелёный
  '#60a5fa' // голубой
];

/**
 * Цвет группы суперсета по её номеру (1-based).
 * @param {number} group
 * @returns {string|null} null для упражнений вне суперсета
 */
export function supersetColor(group) {
  const g = Number(group);
  if (!Number.isFinite(g) || g < 1) return null;
  return SUPERSET_COLORS[(g - 1) % SUPERSET_COLORS.length];
}
