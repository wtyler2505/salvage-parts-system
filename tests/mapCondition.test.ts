import { describe, expect, it } from 'vitest';
import { mapCondition, mapConditionReverse } from '../src/stores/conditionMapping';

describe('mapCondition', () => {
  it('maps known conditions correctly', () => {
    expect(mapCondition('new')).toBe('new');
    expect(mapCondition('refurbished')).toBe('used');
    expect(mapCondition('used')).toBe('used');
    expect(mapCondition('damaged')).toBe('broken');
  });

  it('defaults to used for unknown conditions', () => {
    expect(mapCondition('unexpected')).toBe('used');
  });
});

describe('mapConditionReverse', () => {
  it('maps known conditions correctly', () => {
    expect(mapConditionReverse('new')).toBe('new');
    expect(mapConditionReverse('used')).toBe('used');
    expect(mapConditionReverse('salvaged')).toBe('used');
    expect(mapConditionReverse('broken')).toBe('damaged');
  });

  it('defaults to used for unknown conditions', () => {
    expect(mapConditionReverse('unexpected')).toBe('used');
  });
});
