import { describe, it, expect } from 'vitest';
import { mapCondition, mapConditionReverse } from '../src/stores/usePartStore';

describe('mapCondition', () => {
  it('maps known conditions', () => {
    expect(mapCondition('new')).toBe('new');
    expect(mapCondition('refurbished')).toBe('used');
    expect(mapCondition('used')).toBe('used');
    expect(mapCondition('damaged')).toBe('broken');
  });

  it('defaults to "used" for unknown input', () => {
    expect(mapCondition('other')).toBe('used');
  });
});

describe('mapConditionReverse', () => {
  it('maps unified conditions to db conditions', () => {
    expect(mapConditionReverse('new')).toBe('new');
    expect(mapConditionReverse('used')).toBe('used');
    expect(mapConditionReverse('salvaged')).toBe('used');
    expect(mapConditionReverse('broken')).toBe('damaged');
  });

  it('defaults to "used" for unknown input', () => {
    expect(mapConditionReverse('other')).toBe('used');
  });
});
