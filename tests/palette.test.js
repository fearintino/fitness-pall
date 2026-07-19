import { describe, it, expect } from 'vitest';
import { supersetColor, SUPERSET_COLORS } from '../src/core/palette.js';

describe('supersetColor', () => {
  it('возвращает разные цвета для разных групп', () => {
    expect(supersetColor(1)).toBe(SUPERSET_COLORS[0]);
    expect(supersetColor(2)).toBe(SUPERSET_COLORS[1]);
    expect(supersetColor(1)).not.toBe(supersetColor(2));
  });

  it('циклит палитру при большом числе групп', () => {
    const len = SUPERSET_COLORS.length;
    expect(supersetColor(len + 1)).toBe(SUPERSET_COLORS[0]);
  });

  it('возвращает null вне суперсета', () => {
    expect(supersetColor(0)).toBeNull();
    expect(supersetColor(null)).toBeNull();
    expect(supersetColor(undefined)).toBeNull();
  });
});
