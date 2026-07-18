// Работа с "keycap"-цифрами Telegram: 1️⃣ = '1' + U+FE0F + U+20E3.
// Тренер нумерует упражнения именно ими, поэтому нужно уметь читать и писать.

const VARIATION_SELECTOR = '️';
const COMBINING_KEYCAP = '⃣';

// Последовательность keycap-цифр в начале строки: "1️⃣0️⃣ Название"
const LEADING_KEYCAP = /^\s*((?:[0-9]️?⃣)+)/;

/**
 * Разбирает ведущие keycap-цифры строки.
 * @param {string} line
 * @returns {{number: number, display: string, rest: string} | null}
 */
export function parseLeadingNumber(line) {
  if (typeof line !== 'string') return null;
  const match = line.match(LEADING_KEYCAP);
  if (!match) return null;
  const display = match[1];
  const digits = display.replace(/[️⃣]/g, '');
  return {
    number: parseInt(digits, 10),
    display,
    rest: line.slice(match[0].length).trim()
  };
}

/**
 * Собирает число из keycap-цифр. 10 -> "1️⃣0️⃣".
 * @param {number|string} value
 * @returns {string}
 */
export function numberToKeycap(value) {
  const digits = String(value).replace(/[^0-9]/g, '');
  if (!digits) return '';
  return digits
    .split('')
    .map((d) => `${d}${VARIATION_SELECTOR}${COMBINING_KEYCAP}`)
    .join('');
}
