import React, { useEffect, useState, useCallback } from 'react';
import { Package, Eye, Settings, Layout as LayoutIcon, Save, Undo, Redo, MessageSquare } from 'lucide-react';
import DockableLayout from './components/layout/DockableLayout';
import PartLibraryPanel from './components/panels/PartLibraryPanel';
import PropertyPanel from './components/panels/PropertyPanel';
import TimelinePanel from './components/timeline/TimelinePanel';
import { usePartStore } from './stores/usePartStore';
import { useSupabasePartStore } from './stores/useSupabasePartStore';
import SceneControlsPanel from './components/panels/SceneControlsPanel';
import AnnotationPanel from './components/panels/AnnotationPanel';
import { initializeSampleData } from './lib/database';
import { salvageDb } from './lib/salvageDatabase';
import PartsManager from './components/parts/PartsManager';
import EnhancedScene from './components/enhanced/EnhancedScene';
import WorkspaceManager from './components/layout/WorkspaceManager';
import { useLayoutStore } from './stores/useLayoutStore';

function App() {
  const { loadParts } = usePartStore();
  const { loadParts: loadSupabaseParts } = useSupabasePartStore();
  const [currentView, setCurrentView] = useState<'viewer' | 'parts'>('viewer');
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  
  const { 
    saveWorkspace, 
    setCurrentLayoutState 
  } = useLayoutStore();
  
  // Register components with the layout manager
  const componentMap = new Map();
  componentMap.set('PartsManager', PartsManager);
  componentMap.set('EnhancedScene', EnhancedScene);
  componentMap.set('PartLibraryPanel', PartLibraryPanel);
  componentMap.set('PropertyPanel', PropertyPanel);
  componentMap.set('TimelinePanel', TimelinePanel);
  componentMap.set('SceneControlsPanel', SceneControlsPanel);
  componentMap.set('AnnotationPanel', AnnotationPanel);
  
  const panels = [
    { 
      id: 'parts-manager', 
      title: 'Parts Manager', 
      component: PartsManager,
      icon: Package,
      closable: false,
      resizable: true,
      minWidth: 300,
      minHeight: 200
    },
    { 
      id: 'enhanced-scene', 
      title: '3D Viewer', 
      component: EnhancedScene,
      icon: Eye,
      closable: false,
      resizable: true,
      minWidth: 400,
      minHeight: 300
    },
    { 
      id: 'property-panel', 
      title: 'Properties', 
      component: PropertyPanel,
      icon: Settings,
      closable: true,
      resizable: true,
      minWidth: 250,
      minHeight: 200
    },
    { 
      id: 'part-library', 
      title: 'Part Library', 
      component: PartLibraryPanel,
      icon: Package,
      closable: true,
      resizable: true,
      minWidth: 250,
      minHeight: 200
    },
    { 
      id: 'timeline-panel', 
      title: 'Timeline', 
      component: TimelinePanel,
      icon: LayoutIcon,
      closable: true,
      resizable: true,
      minWidth: 250,
      minHeight: 200
    },
    { 
      id: 'scene-controls', 
      title: 'Scene Controls', 
      component: SceneControlsPanel,
      icon: Settings,
      closable: true,
      resizable: true,
      minWidth: 250,
      minHeight: 200
    },
    { 
      id: 'annotation-panel', 
      title: 'Annotations', 
      component: AnnotationPanel,
      icon: MessageSquare,
      closable: true,
      resizable: true,
      minWidth: 250,
      minHeight: 200
    }
  ];
  
  // Define the three-column workspace layout configuration
  const layoutConfig = {
    root: {
      type: 'row',
      content: [
        {
          type: 'column',
          width: 20,
          content: [{
            type: 'stack',
            content: [{
              type: 'component',
              componentName: 'PartLibraryPanel'
            }]
          }]
        },
        {
          type: 'column',
          width: 60,
          content: [{
            type: 'stack',
            content: [{
              type: 'component',
              componentName: 'EnhancedScene'
            }]
          }]
        },
        {
          type: 'column',
          width: 20,
          content: [{
            type: 'stack',
            content: [
              {
                type: 'component',
                componentName: 'SceneControlsPanel'
              },
              {
                type: 'component',
                componentName: 'PropertyPanel'
              },
              {
                type: 'component',
                componentName: 'TimelinePanel'
              },
              {
                type: 'component',
                componentName: 'AnnotationPanel'
              }
            ]
          }]
        }
      ]
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize legacy parts data
        await initializeSampleData();
        await loadParts();
        
        // Initialize Supabase parts data
        try {
          await loadSupabaseParts();
        } catch (error) {
          console.warn('Failed to load Supabase parts:', error);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [loadParts, loadSupabaseParts]);
  
  const navigationItems = [
    { id: 'parts', name: 'Parts Manager', icon: Package },
    { id: 'viewer', name: '3D Viewer', icon: Eye },
    { id: 'layout', name: 'Layout', icon: LayoutIcon },
  ];

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Salvage Parts System</h1>
            </div>
            
            <nav className="flex space-x-1">
              {navigationItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Undo className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Redo className="w-4 h-4" />
              </button>
              <button 
                onClick={() => saveWorkspace()} 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Save current workspace"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button 
              onClick={() => setShowWorkspaceManager(!showWorkspaceManager)}
              className={`p-2 rounded-lg ${
                showWorkspaceManager 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Workspace Manager"
            >
              <LayoutIcon className="w-5 h-5" />
            </button>
            
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Workspace Manager Sidebar */}
        {showWorkspaceManager && (
          <div className="absolute top-0 right-0 bottom-0 w-64 z-10 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700">
            <WorkspaceManager />
          </div>
        )}
        
        <DockableLayout 
          panels={panels}
          defaultLayout={layoutConfig}
          componentMap={componentMap}
          fallbackToCustomLayout={true}
          onLayoutChange={setCurrentLayoutState}
        />
      </div>
    </div>
  );
}

export default App;