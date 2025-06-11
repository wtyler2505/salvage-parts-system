import React, { useEffect, useState } from 'react';
import { Search, Filter, Grid3X3, List, Package } from 'lucide-react';
import { usePartStore } from '../../stores/usePartStore';
import { Part, SearchFilters } from '../../types';

const PartLibrary: React.FC = () => {
  const {
    parts,
    filteredParts,
    loading,
    searchParts,
    clearFilters
  } = usePartStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const categories = Array.from(new Set(parts.flatMap(p => p.metadata.categories)));
  const manufacturers = Array.from(new Set(parts.map(p => p.metadata.manufacturer).filter(Boolean)));
  const conditions = ['new', 'used', 'salvaged', 'broken'];

  useEffect(() => {
    searchParts(filters);
  }, [filters, searchParts]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleClear = () => {
    setFilters({});
    clearFilters();
  };

  const getConditionColor = (condition: Part['condition']) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'refurbished': return 'bg-blue-100 text-blue-800';
      case 'used': return 'bg-yellow-100 text-yellow-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: Part['availability']) => {
    switch (availability) {
      case 'in-stock': return 'bg-green-500';
      case 'low-stock': return 'bg-yellow-500';
      case 'out-of-stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const PartCard: React.FC<{ part: Part }> = ({ part }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <Package className="w-12 h-12 text-gray-400" />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
            {part.name}
          </h3>
          <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(part.availability)}`} />
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{part.category}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(part.condition)}`}>
            {part.condition}
          </span>
          {part.price && (
            <span className="font-semibold text-lg text-gray-900">
              ${part.price.toLocaleString()}
            </span>
          )}
        </div>
        
        {part.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {part.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {part.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{part.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const PartListItem: React.FC<{ part: Part }> = ({ part }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{part.name}</h3>
            <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(part.availability)}`} />
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{part.category} • {part.subcategory}</p>
          
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(part.condition)}`}>
              {part.condition}
            </span>
            
            {part.price && (
              <span className="font-semibold text-gray-900">
                ${part.price.toLocaleString()}
              </span>
            )}
            
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>{part.dimensions.weight}kg</span>
              <span>•</span>
              <span>{part.dimensions.length}×{part.dimensions.width}×{part.dimensions.height}mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Parts Library</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search parts..."
            value={filters.text || ''}
            onChange={(e) => updateFilters({ text: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.categories?.[0] || ''}
                onChange={(e) => updateFilters({ categories: e.target.value ? [e.target.value] : undefined })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <select
                value={filters.manufacturer?.[0] || ''}
                onChange={(e) => updateFilters({ manufacturer: e.target.value ? [e.target.value] : undefined })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={filters.condition?.[0] || ''}
                onChange={(e) => updateFilters({ condition: e.target.value ? [e.target.value] : undefined })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Conditions</option>
                {conditions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {Object.keys(filters).length > 0 && (
              <button
                onClick={handleClear}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No parts found</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' : 'space-y-3'}>
            {filteredParts.map(part => (
              viewMode === 'grid' ? (
                <PartCard key={part.id} part={part} />
              ) : (
                <PartListItem key={part.id} part={part} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartLibrary;