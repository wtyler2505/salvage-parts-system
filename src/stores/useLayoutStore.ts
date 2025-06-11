import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Panel {
  id: string;
  title: string;
  component: string;
  position: { x: number; y: number; width: number; height: number };
  visible: boolean;
  docked: boolean;
  zIndex: number;
}

interface Workspace {
  id: string;
  name: string;
  layout: any;
  panels: Panel[];
  createdAt: Date;
}

interface LayoutStore {
  layout: any;
  theme: 'light' | 'dark';
  accentColor: string;
  shortcuts: Record<string, string>;
  workspaces: Workspace[];
  currentWorkspace: string;
  popoutWindows: Window[];
  
  // Actions
  updateLayout: (layout: any) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  updateShortcuts: (shortcuts: Record<string, string>) => void;
  saveWorkspace: (name: string) => void;
  loadWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => void;
  createPopoutWindow: (panel: any) => void;
  closePopoutWindow: (window: Window) => void;
  addPanel: (panel: Omit<Panel, 'id'>) => void;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
  resetLayout: () => void;
}

const defaultLayout = {
  type: 'row',
  content: [
    {
      type: 'column',
      width: 20,
      content: [
        {
          type: 'component',
          componentName: 'PartLibrary',
          title: 'Part Library'
        }
      ]
    },
    {
      type: 'column',
      width: 60,
      content: [
        {
          type: 'component',
          componentName: 'Viewer3D',
          title: '3D Viewer'
        }
      ]
    },
    {
      type: 'column',
      width: 20,
      content: [
        {
          type: 'stack',
          content: [
            {
              type: 'component',
              componentName: 'Properties',
              title: 'Properties'
            },
            {
              type: 'component',
              componentName: 'Timeline',
              title: 'Timeline'
            }
          ]
        }
      ]
    }
  ]
};

const defaultShortcuts = {
  'Ctrl+S': 'saveWorkspace',
  'Ctrl+Shift+S': 'saveWorkspaceAs',
  'Ctrl+O': 'openWorkspace',
  'Ctrl+N': 'newWorkspace',
  'Ctrl+T': 'toggleTheme',
  'Ctrl+R': 'resetLayout',
  'F11': 'toggleFullscreen',
  'Ctrl+1': 'focusPartLibrary',
  'Ctrl+2': 'focusViewer',
  'Ctrl+3': 'focusProperties',
  'Ctrl+Space': 'togglePlayPause',
  'Ctrl+Shift+A': 'addAnnotation',
  'Ctrl+Shift+M': 'addMeasurement',
  'Delete': 'deleteSelected',
  'Ctrl+Z': 'undo',
  'Ctrl+Y': 'redo',
  'Ctrl+C': 'copy',
  'Ctrl+V': 'paste',
  'Ctrl+X': 'cut'
};

export const useLayoutStore = create<LayoutStore>()(
  immer((set, get) => ({
    layout: defaultLayout,
    theme: 'light',
    accentColor: '#3B82F6',
    shortcuts: defaultShortcuts,
    workspaces: [
      {
        id: 'default',
        name: 'Default',
        layout: defaultLayout,
        panels: [],
        createdAt: new Date()
      }
    ],
    currentWorkspace: 'default',
    popoutWindows: [],

    updateLayout: (layout) => {
      set(state => {
        state.layout = layout;
      });
    },

    setTheme: (theme) => {
      set(state => {
        state.theme = theme;
      });
      
      // Apply theme to document
      document.documentElement.classList.toggle('dark', theme === 'dark');
      
      // Save to localStorage
      localStorage.setItem('theme', theme);
    },

    setAccentColor: (color) => {
      set(state => {
        state.accentColor = color;
      });
      
      // Apply accent color CSS variables
      document.documentElement.style.setProperty('--accent-color', color);
      localStorage.setItem('accentColor', color);
    },

    updateShortcuts: (shortcuts) => {
      set(state => {
        state.shortcuts = { ...state.shortcuts, ...shortcuts };
      });
      
      localStorage.setItem('shortcuts', JSON.stringify(get().shortcuts));
    },

    saveWorkspace: (name) => {
      const { layout, currentWorkspace } = get();
      const workspace: Workspace = {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        layout,
        panels: [],
        createdAt: new Date()
      };

      set(state => {
        const existingIndex = state.workspaces.findIndex(w => w.id === workspace.id);
        if (existingIndex >= 0) {
          state.workspaces[existingIndex] = workspace;
        } else {
          state.workspaces.push(workspace);
        }
        state.currentWorkspace = workspace.id;
      });

      localStorage.setItem('workspaces', JSON.stringify(get().workspaces));
    },

    loadWorkspace: (id) => {
      const workspace = get().workspaces.find(w => w.id === id);
      if (workspace) {
        set(state => {
          state.layout = workspace.layout;
          state.currentWorkspace = id;
        });
      }
    },

    deleteWorkspace: (id) => {
      if (id === 'default') return; // Can't delete default workspace

      set(state => {
        state.workspaces = state.workspaces.filter(w => w.id !== id);
        if (state.currentWorkspace === id) {
          state.currentWorkspace = 'default';
          state.layout = defaultLayout;
        }
      });

      localStorage.setItem('workspaces', JSON.stringify(get().workspaces));
    },

    createPopoutWindow: (panel) => {
      const popoutWindow = window.open(
        '',
        `popout_${panel.id}`,
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (popoutWindow) {
        // Set up the popout window content
        popoutWindow.document.title = panel.title;
        popoutWindow.document.body.innerHTML = `
          <div id="popout-root" style="width: 100%; height: 100vh;"></div>
        `;

        // Add styles
        const link = popoutWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/index.css';
        popoutWindow.document.head.appendChild(link);

        set(state => {
          state.popoutWindows.push(popoutWindow);
        });

        // Handle window close
        popoutWindow.addEventListener('beforeunload', () => {
          get().closePopoutWindow(popoutWindow);
        });
      }
    },

    closePopoutWindow: (window) => {
      set(state => {
        state.popoutWindows = state.popoutWindows.filter(w => w !== window);
      });
      
      if (!window.closed) {
        window.close();
      }
    },

    addPanel: (panel) => {
      const newPanel: Panel = {
        ...panel,
        id: `panel_${Date.now()}`,
      };

      set(state => {
        // Add to current workspace
        const workspace = state.workspaces.find(w => w.id === state.currentWorkspace);
        if (workspace) {
          workspace.panels.push(newPanel);
        }
      });
    },

    removePanel: (id) => {
      set(state => {
        const workspace = state.workspaces.find(w => w.id === state.currentWorkspace);
        if (workspace) {
          workspace.panels = workspace.panels.filter(p => p.id !== id);
        }
      });
    },

    updatePanel: (id, updates) => {
      set(state => {
        const workspace = state.workspaces.find(w => w.id === state.currentWorkspace);
        if (workspace) {
          const panel = workspace.panels.find(p => p.id === id);
          if (panel) {
            Object.assign(panel, updates);
          }
        }
      });
    },

    resetLayout: () => {
      set(state => {
        state.layout = defaultLayout;
      });
    }
  }))
);

// Initialize from localStorage
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
const savedAccentColor = localStorage.getItem('accentColor');
const savedShortcuts = localStorage.getItem('shortcuts');
const savedWorkspaces = localStorage.getItem('workspaces');

if (savedTheme) {
  useLayoutStore.getState().setTheme(savedTheme);
}

if (savedAccentColor) {
  useLayoutStore.getState().setAccentColor(savedAccentColor);
}

if (savedShortcuts) {
  useLayoutStore.getState().updateShortcuts(JSON.parse(savedShortcuts));
}

if (savedWorkspaces) {
  useLayoutStore.setState(state => ({
    ...state,
    workspaces: JSON.parse(savedWorkspaces)
  }));
}