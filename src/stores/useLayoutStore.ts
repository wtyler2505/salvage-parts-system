import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import { LayoutConfig } from 'golden-layout';

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
  layout: LayoutConfig;
  panels: Panel[];
  createdAt: number;
}

interface LayoutStore {
  layout: any;
  currentLayoutState: LayoutConfig;
  theme: 'light' | 'dark';
  accentColor: string;
  shortcuts: Record<string, string>;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  presetLayouts: { id: string; name: string; layout: LayoutConfig }[];
  popoutWindows: Window[];
  
  // Actions
  updateLayout: (layout: any) => void;
  setCurrentLayoutState: (layoutState: LayoutConfig) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  updateShortcuts: (shortcuts: Record<string, string>) => void;
  saveWorkspace: (name?: string) => void;
  loadWorkspace: (workspaceId: string) => void;
  deleteWorkspace: (id: string) => void;
  loadPresetLayout: (id: string) => void;
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

const modelingLayout = defaultLayout;

const simulationLayout: LayoutConfig = {
  root: {
    type: 'column',
    content: [
      {
        type: 'row',
        height: 70,
        content: [
          {
            type: 'component',
            componentName: 'EnhancedScene',
            title: '3D Viewer'
          },
          {
            type: 'component',
            componentName: 'PropertyPanel',
            title: 'Properties'
          }
        ]
      },
      {
        type: 'component',
        componentName: 'TimelinePanel',
        title: 'Timeline',
        height: 30
      }
    ]
  }
};

export const presetLayouts = [
  { id: 'modeling', name: 'Modeling', layout: modelingLayout },
  { id: 'simulation', name: 'Simulation', layout: simulationLayout }
];

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
    currentLayoutState: defaultLayout,
    theme: 'light',
    accentColor: '#3B82F6',
    shortcuts: defaultShortcuts,
    workspaces: [
      {
        id: 'default',
        name: 'Default',
        layout: defaultLayout,
        panels: [],
        createdAt: Date.now()
      }
    ],
    currentWorkspaceId: 'default',
    presetLayouts,
    popoutWindows: [],

    updateLayout: (layout) => {
      set(state => {
        state.layout = layout;
      });
    },

    setCurrentLayoutState: (layoutState) => {
      set(state => {
        state.currentLayoutState = layoutState;
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
      // If no name provided, prompt the user
      const workspaceName = name || window.prompt('Enter workspace name:');
      if (!workspaceName) return;
      
      const { currentLayoutState } = get();
      
      const newWorkspace: Workspace = {
        id: nanoid(),
        name: workspaceName,
        layout: currentLayoutState,
        panels: [],
        createdAt: Date.now()
      };

      set(state => {
        const existingIndex = state.workspaces.findIndex(w => w.name === workspaceName);
        if (existingIndex >= 0) {
          state.workspaces[existingIndex] = newWorkspace;
        } else {
          state.workspaces.push(newWorkspace);
        }
        state.currentWorkspaceId = newWorkspace.id;
      });

      localStorage.setItem('workspaces', JSON.stringify(get().workspaces));
    },

    loadWorkspace: (workspaceId) => {
      const workspace = get().workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        set(state => {
          state.layout = workspace.layout;
          state.currentWorkspaceId = workspaceId;
        });
      }
    },

    loadPresetLayout: (presetId) => {
      const preset = presetLayouts.find(p => p.id === presetId);
      if (preset) {
        set(state => {
          state.layout = preset.layout;
          state.currentLayoutState = preset.layout;
        });
      }
    },

    deleteWorkspace: (workspaceId) => {
      if (workspaceId === 'default') return; // Can't delete default workspace

      set(state => {
        state.workspaces = state.workspaces.filter(w => w.id !== workspaceId);
        if (state.currentWorkspaceId === workspaceId) {
          state.currentWorkspaceId = 'default';
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
        const workspace = state.workspaces.find(w => w.id === state.currentWorkspaceId);
        if (workspace) {
          workspace.panels.push(newPanel);
        }
      });
    },

    removePanel: (id) => {
      set(state => {
        const workspace = state.workspaces.find(w => w.id === state.currentWorkspaceId);
        if (workspace) {
          workspace.panels = workspace.panels.filter(p => p.id !== id);
        }
      });
    },

    updatePanel: (id, updates) => {
      set(state => {
        const workspace = state.workspaces.find(w => w.id === state.currentWorkspaceId);
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

try {
  if (savedWorkspaces) {
    const parsedWorkspaces = JSON.parse(savedWorkspaces);
    useLayoutStore.setState({ workspaces: parsedWorkspaces });
  }
} catch (error) {
  console.error('Failed to load saved workspaces:', error);
  localStorage.removeItem('workspaces');
}

// Save on changes
useLayoutStore.subscribe(
  (state) => state.workspaces,
  (workspaces) => {
    try {
      localStorage.setItem('workspaces', JSON.stringify(workspaces));
    } catch (error) {
      console.error('Failed to save workspaces:', error);
    }
  }
);