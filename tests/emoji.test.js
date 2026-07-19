import { describe, it, expect } from 'vitest';
import { parseLeadingNumber, numberToKeycap } from '../src/core/emoji.js';

describe('parseLeadingNumber', () => {
  it('читает однозначный номер', () => {
    const r = parseLeadingNumber('1️⃣ Жим лёжа');
    expect(r).toEqual({ number: 1, display: '1️⃣', rest: 'Жим лёжа' });
  });

  it('читает двузначный номер', () => {
    const r = parseLeadingNumber('1️⃣0️⃣ Сгибания ног');
    expect(r.number).toBe(10);
    expect(r.rest).toBe('Сгибания ног');
  });

  it('читает нулевой номер разминки', () => {
    const r = parseLeadingNumber('0️⃣0️⃣ Суставная разминка');
    expect(r.number).toBe(0);
    expect(r.rest).toBe('Суставная разминка');
  });

  it('читает десятку единым эмодзи 🔟', () => {
    const r = parseLeadingNumber('🔟 Гиперэкстензии');
    expect(r.number).toBe(10);
    expect(r.display).toBe('🔟');
    expect(r.rest).toBe('Гиперэкстензии');
  });

  it('возвращает null без keycap-цифр', () => {
    expect(parseLeadingNumber('Собственный вес:')).toBeNull();
    expect(parseLeadingNumber(null)).toBeNull();
  });
});

describe('numberToKeycap', () => {
  it('собирает keycap-строку', () => {
    expect(numberToKeycap(1)).toBe('1️⃣');
    expect(numberToKeycap(10)).toBe('1️⃣0️⃣');
  });

  it('делает round-trip с parseLeadingNumber', () => {
    const kc = numberToKeycap(7);
    expect(parseLeadingNumber(`${kc} Тест`).number).toBe(7);
  });

  it('пустая строка для мусора', () => {
    expect(numberToKeycap('')).toBe('');
  });
});
