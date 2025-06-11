import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  TreePine, 
  Star, 
  Clock, 
  Package, 
  Tag,
  ChevronRight,
  ChevronDown,
  Heart,
  Download
} from 'lucide-react';
import { usePartStore } from '../../stores/usePartStore';
import { useViewerStore } from '../../stores/useViewerStore';

interface PartLibraryPanelProps {
  onPartSelect?: (partId: string) => void;
  onPartDrag?: (partId: string) => void;
}

const PartLibraryPanel: React.FC<PartLibraryPanelProps> = ({ onPartSelect, onPartDrag }) => {
  const { parts, filteredParts, searchParts, loadParts } = usePartStore();
  const { selectPart } = useViewerStore();
  
  const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentParts, setRecentParts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category' | 'manufacturer'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Build category tree
  const categoryTree = useMemo(() => {
    const tree: any = {};
    parts.forEach(part => {
      part.metadata.categories.forEach(category => {
        const parts = category.split('/');
        let current = tree;
        parts.forEach(part => {
          if (!current[part]) {
            current[part] = { children: {}, parts: [] };
          }
          current = current[part].children;
        });
        tree[parts[0]].parts.push(part);
      });
    });
    return tree;
  }, [parts]);

  // Sorted and filtered parts
  const sortedParts = useMemo(() => {
    let sorted = [...filteredParts];
    
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.metadata.name.toLowerCase();
          bValue = b.metadata.name.toLowerCase();
          break;
        case 'date':
          aValue = a.metadata.dateAdded;
          bValue = b.metadata.dateAdded;
          break;
        case 'category':
          aValue = a.metadata.categories[0] || '';
          bValue = b.metadata.categories[0] || '';
          break;
        case 'manufacturer':
          aValue = a.metadata.manufacturer.toLowerCase();
          bValue = b.metadata.manufacturer.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredParts, sortBy, sortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchParts({ text: query });
  };

  const handlePartClick = (partId: string) => {
    setRecentParts(prev => [partId, ...prev.filter(id => id !== partId)].slice(0, 10));
    selectPart(partId);
    onPartSelect?.(partId);
  };

  const handlePartDragStart = (partId: string, e: React.DragEvent) => {
    e.dataTransfer.setData('application/part-id', partId);
    e.dataTransfer.effectAllowed = 'copy';
    onPartDrag?.(partId);
  };

  const toggleFavorite = (partId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(partId)) {
        newFavorites.delete(partId);
      } else {
        newFavorites.add(partId);
      }
      return newFavorites;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      return newExpanded;
    });
  };

  const TreeView: React.FC = () => (
    <div className="space-y-1">
      {Object.entries(categoryTree).map(([category, data]: [string, any]) => (
        <div key={category}>
          <button
            onClick={() => toggleCategory(category)}
            className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            {expandedCategories.has(category) ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Package className="w-4 h-4" />
            <span className="text-sm">{category}</span>
            <span className="text-xs text-gray-500">({data.parts.length})</span>
          </button>
          
          {expandedCategories.has(category) && (
            <div className="ml-6 space-y-1">
              {data.parts.map((part: any) => (
                <div
                  key={part.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => handlePartClick(part.id)}
                  draggable
                  onDragStart={(e) => handlePartDragStart(part.id, e)}
                >
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{part.metadata.name}</div>
                    <div className="text-xs text-gray-500 truncate">{part.metadata.manufacturer}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(part.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Heart className={`w-3 h-3 ${favorites.has(part.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const GridView: React.FC = () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedParts.map(part => (
        <div
          key={part.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => handlePartClick(part.id)}
          draggable
          onDragStart={(e) => handlePartDragStart(part.id, e)}
        >
          {/* 3D Thumbnail */}
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-t-lg flex items-center justify-center relative">
            <Package className="w-12 h-12 text-gray-400" />
            
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(part.id);
              }}
              className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className={`w-3 h-3 ${favorites.has(part.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            
            {/* Recent indicator */}
            {recentParts.includes(part.id) && (
              <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
          
          <div className="p-3">
            <h3 className="font-medium text-sm truncate">{part.metadata.name}</h3>
            <p className="text-xs text-gray-500 truncate">{part.metadata.manufacturer}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {part.metadata.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-1 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded"
                >
                  {tag}
                </span>
              ))}
              {part.metadata.tags.length > 2 && (
                <span className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  +{part.metadata.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView: React.FC = () => (
    <div className="space-y-2">
      {sortedParts.map(part => (
        <div
          key={part.id}
          className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => handlePartClick(part.id)}
          draggable
          onDragStart={(e) => handlePartDragStart(part.id, e)}
        >
          {/* Thumbnail */}
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{part.metadata.name}</h3>
              <div className="flex items-center space-x-2">
                {recentParts.includes(part.id) && <Clock className="w-4 h-4 text-blue-500" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(part.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className={`w-4 h-4 ${favorites.has(part.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{part.metadata.manufacturer}</span>
              <span>•</span>
              <span>{part.metadata.condition}</span>
              <span>•</span>
              <span>Qty: {part.metadata.quantity}</span>
            </div>
            
            {/* Inline specs */}
            <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
              {Object.entries(part.specifications.custom).slice(0, 3).map(([key, value]) => (
                <span key={key}>{key}: {String(value)}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Part Library</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded ${viewMode === 'tree' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <TreePine className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search parts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex items-center space-x-2 mb-4">
          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
            <Star className="w-3 h-3" />
            <span>Favorites</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
            <Clock className="w-3 h-3" />
            <span>Recent</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
            <Filter className="w-3 h-3" />
            <span>Filter</span>
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          >
            <option value="name">Name</option>
            <option value="date">Date Added</option>
            <option value="category">Category</option>
            <option value="manufacturer">Manufacturer</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'tree' && <TreeView />}
        {viewMode === 'grid' && <GridView />}
        {viewMode === 'list' && <ListView />}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
        {filteredParts.length} of {parts.length} parts
      </div>
    </div>
  );
};

export default PartLibraryPanel;