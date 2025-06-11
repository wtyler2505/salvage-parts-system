import React, { useEffect, useState } from 'react';
import { Plus, BarChart3, Settings, RefreshCw } from 'lucide-react';
import { useSalvagePartStore } from '../../stores/useSalvagePartStore';
import { SearchFilters } from '../../types/salvagePart';
import PartSearch from './PartSearch';
import PartsList from './PartsList';
import PartEditor from './PartEditor';
import PartsStatistics from './PartsStatistics';

const PartsManager: React.FC = () => {
  const { 
    filteredParts, 
    loading, 
    error, 
    loadParts, 
    loadStatistics,
    searchParts 
  } = useSalvagePartStore();
  
  const [showEditor, setShowEditor] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  useEffect(() => {
    const initializeData = async () => {
      await loadParts();
      await loadStatistics();
    };
    
    initializeData();
  }, [loadParts, loadStatistics]);

  const handleFiltersChange = (filters: SearchFilters) => {
    setCurrentFilters(filters);
  };

  const handleRefresh = async () => {
    await loadParts();
    await loadStatistics();
    if (Object.keys(currentFilters).length > 0) {
      await searchParts(currentFilters);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Parts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parts Management</h1>
            <p className="text-gray-600">Manage your salvage parts inventory</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStatistics(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Part</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <PartSearch onFiltersChange={handleFiltersChange} />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading parts...</p>
            </div>
          </div>
        ) : (
          <PartsList parts={filteredParts} />
        )}
      </div>

      {/* Modals */}
      <PartEditor
        isOpen={showEditor}
        mode="create"
        onClose={() => setShowEditor(false)}
      />

      <PartsStatistics
        isOpen={showStatistics}
        onClose={() => setShowStatistics(false)}
      />
    </div>
  );
};

export default PartsManager;