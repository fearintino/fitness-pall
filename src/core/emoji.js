// Работа с "keycap"-цифрами Telegram: 1️⃣ = '1' + U+FE0F + U+20E3.
// Тренер нумерует упражнения именно ими, поэтому нужно уметь читать и писать.

const VARIATION_SELECTOR = '️';
const COMBINING_KEYCAP = '⃣';
// Десятка у тренера часто идёт единым эмодзи 🔟 (U+1F51F), а не парой 1️⃣0️⃣.
const TEN = '🔟';

// Начало строки: либо 🔟, либо последовательность keycap-цифр "1️⃣0️⃣ Название".
const LEADING_KEYCAP = /^\s*(🔟|(?:[0-9]️?⃣)+)/;

/**
 * Разбирает ведущий номер упражнения (keycap-цифры или 🔟).
 * @param {string} line
 * @returns {{number: number, display: string, rest: string} | null}
 */
export function parseLeadingNumber(line) {
  if (typeof line !== 'string') return null;
  const match = line.match(LEADING_KEYCAP);
  if (!match) return null;
  const display = match[1];
  const number = display === TEN ? 10 : parseInt(display.replace(/[️⃣]/g, ''), 10);
  return {
    number,
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
