import { jest } from '@jest/globals';
jest.mock('nanoid', () => ({ nanoid: () => 'test-id' }));
import { useLayoutStore } from '../useLayoutStore';

beforeEach(() => {
  localStorage.clear();
  useLayoutStore.setState({
    layout: useLayoutStore.getState().layout,
    currentLayoutState: useLayoutStore.getState().currentLayoutState,
    theme: 'light',
    accentColor: '#3B82F6',
    shortcuts: useLayoutStore.getState().shortcuts,
    workspaces: [
      { id: 'default', name: 'Default', layout: useLayoutStore.getState().layout, panels: [], createdAt: Date.now() }
    ],
    currentWorkspaceId: 'default',
    popoutWindows: []
  });
});

describe('useLayoutStore workspace management', () => {
  it('saves and loads workspaces', () => {
    useLayoutStore.getState().saveWorkspace('Test');
    const saved = useLayoutStore.getState().workspaces.find(w => w.name === 'Test');
    expect(saved).toBeTruthy();
    expect(useLayoutStore.getState().currentWorkspaceId).toBe(saved!.id);

    useLayoutStore.getState().updateLayout({ foo: 'bar' } as any);
    useLayoutStore.getState().loadWorkspace('default');
    expect(useLayoutStore.getState().currentWorkspaceId).toBe('default');
  });
});

describe('useLayoutStore layout changes', () => {
  it('updates layout state', () => {
    useLayoutStore.getState().updateLayout({ foo: 'bar' } as any);
    expect(useLayoutStore.getState().layout).toEqual({ foo: 'bar' });
  });
});
