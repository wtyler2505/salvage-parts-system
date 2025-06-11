import React, { useEffect, useState, useCallback } from 'react';
import { Package, Eye, Settings, Layout, Save, Undo, Redo } from 'lucide-react';
import DockableLayout from './components/layout/DockableLayout';
import { usePartStore } from './stores/usePartStore';
import { useSalvagePartStore } from './stores/useSalvagePartStore';
import { useSupabasePartStore } from './stores/useSupabasePartStore';
import { initializeSampleData } from './lib/database';
import { salvageDb } from './lib/salvageDatabase';
import PartsManager from './components/parts/PartsManager';
import EnhancedScene from './components/enhanced/EnhancedScene';
import PropertyPanel from './components/panels/PropertyPanel';
import PartLibraryPanel from './components/panels/PartLibraryPanel';

function App() {
  const { loadParts } = usePartStore();
  const { loadParts: loadSalvageParts } = useSalvagePartStore();
  const { loadParts: loadSupabaseParts } = useSupabasePartStore();
  const [currentView, setCurrentView] = useState<'viewer' | 'parts'>('viewer');
  
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
    }
  ];
  
  const defaultLayout = {
    type: 'row',
    content: [
      {
        type: 'column',
        width: 25,
        content: [
          {
            type: 'stack',
            content: [
              {
                type: 'component',
                componentName: 'part-library',
                title: 'Part Library',
                isClosable: false
              }
            ]
          }
        ]
      },
      {
        type: 'column',
        width: 50,
        content: [
          {
            type: 'component',
            componentName: 'enhanced-scene',
            title: '3D Viewer',
            isClosable: false
          }
        ]
      },
      {
        type: 'column',
        width: 25,
        content: [
          {
            type: 'stack',
            content: [
              {
                type: 'component',
                componentName: 'property-panel',
                title: 'Properties',
                isClosable: false
              },
              {
                type: 'component',
                componentName: 'parts-manager',
                title: 'Parts Manager',
                isClosable: false
              }
            ]
          }
        ]
      }
    ]
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize legacy parts data
        await initializeSampleData();
        await loadParts();
        
        // Initialize salvage parts data
        await loadSalvageParts();
        
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
  }, [loadParts, loadSalvageParts, loadSupabaseParts]);
  
  const navigationItems = [
    { id: 'parts', name: 'Parts Manager', icon: Package },
    { id: 'viewer', name: '3D Viewer', icon: Eye },
    { id: 'layout', name: 'Layout', icon: Layout },
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
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Save className="w-4 h-4" />
              </button>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <DockableLayout 
          panels={panels}
          defaultLayout={defaultLayout}
          fallbackToCustomLayout={true}
        />
      </div>
    </div>
  );
}

export default App;