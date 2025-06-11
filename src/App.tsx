import React, { useEffect, useState } from 'react';
import { Package, Eye, Settings } from 'lucide-react';
import Scene from './components/viewer3d/Scene';
import SpecificationsPanel from './components/ui/SpecificationsPanel';
import ViewModeSelector from './components/ui/ViewModeSelector';
import MeasurementTools from './components/ui/MeasurementTools';
import PartsManager from './components/parts/PartsManager';
import { usePartStore } from './stores/usePartStore';
import { useSalvagePartStore } from './stores/useSalvagePartStore';
import { initializeSampleData } from './lib/database';
import { salvageDb } from './lib/salvageDatabase';

function App() {
  const { loadParts } = usePartStore();
  const { loadParts: loadSalvageParts } = useSalvagePartStore();
  const [currentView, setCurrentView] = useState<'viewer' | 'parts'>('parts');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize legacy parts data
        await initializeSampleData();
        await loadParts();
        
        // Initialize salvage parts data
        await loadSalvageParts();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [loadParts, loadSalvageParts]);

  const navigationItems = [
    { id: 'parts', name: 'Parts Manager', icon: Package },
    { id: 'viewer', name: '3D Viewer', icon: Eye },
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
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'parts' ? (
          <PartsManager />
        ) : (
          <div className="h-full flex">
            {/* Main Viewer Area */}
            <div className="flex-1 relative">
              <Scene />
              
              {/* Floating UI Controls */}
              <ViewModeSelector />
              <MeasurementTools />
              
              {/* Status Bar */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>WebGL</span>
                  <span>•</span>
                  <span>3D Salvage Parts Viewer</span>
                  <span>•</span>
                  <span className="text-green-600">Ready</span>
                </div>
              </div>
            </div>

            {/* Specifications Panel */}
            <div className="w-80 flex-shrink-0">
              <SpecificationsPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;