import { beforeEach, describe, expect, it } from 'vitest';
import { enableMapSet } from 'immer';
import { usePartStore } from '../usePartStore';

// Helper to reset store state between tests
enableMapSet();

function resetStore() {
  usePartStore.setState({
    favorites: new Set(),
    recentPartIds: [],
  });
}

describe('usePartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('toggles favorite status for a part', () => {
    const { toggleFavorite } = usePartStore.getState();
    toggleFavorite('part1');
    expect(usePartStore.getState().favorites.has('part1')).toBe(true);
    toggleFavorite('part1');
    expect(usePartStore.getState().favorites.has('part1')).toBe(false);
  });

  it('adds recent parts and limits list to 10 items', () => {
    const { addRecentPart } = usePartStore.getState();
    for (let i = 0; i < 12; i++) {
      addRecentPart(`id${i}`);
    }
    const state = usePartStore.getState();
    expect(state.recentPartIds[0]).toBe('id11');
    expect(state.recentPartIds.length).toBe(10);
  });
});
