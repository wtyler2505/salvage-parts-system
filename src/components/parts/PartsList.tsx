import React, { useState } from 'react';
import { Grid3X3, List, Edit, Eye, Trash2, Copy, Package, MoreVertical } from 'lucide-react';
import { SalvagePart } from '../../types/salvagePart';
import { useSalvagePartStore } from '../../stores/useSalvagePartStore';
import PartEditor from './PartEditor';

interface PartsListProps {
  parts: SalvagePart[];
}

const PartsList: React.FC<PartsListProps> = ({ parts }) => {
  const { deletePart, duplicatePart, setSelectedPart } = useSalvagePartStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    part?: SalvagePart;
    mode: 'create' | 'edit' | 'view';
  }>({ isOpen: false, mode: 'create' });

  const handleSelectPart = (partId: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedParts(prev => 
        prev.includes(partId) 
          ? prev.filter(id => id !== partId)
          : [...prev, partId]
      );
    } else {
      setSelectedParts([partId]);
    }
  };

  const handleEditPart = (part: SalvagePart) => {
    setEditorState({ isOpen: true, part, mode: 'edit' });
  };

  const handleViewPart = (part: SalvagePart) => {
    setEditorState({ isOpen: true, part, mode: 'view' });
    setSelectedPart(part);
  };

  const handleDeletePart = async (partId: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      await deletePart(partId);
    }
  };

  const handleDuplicatePart = async (partId: string) => {
    await duplicatePart(partId);
  };

  const getConditionColor = (condition: SalvagePart['metadata']['condition']) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'salvaged': return 'bg-yellow-100 text-yellow-800';
      case 'broken': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PartCard: React.FC<{ part: SalvagePart }> = ({ part }) => {
    const [showMenu, setShowMenu] = useState(false);
    const isSelected = selectedParts.includes(part.id);

    return (
      <div 
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={(e) => handleSelectPart(part.id, e.ctrlKey || e.metaKey)}
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          <Package className="w-12 h-12 text-gray-400" />
          
          {/* Actions Menu */}
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewPart(part);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPart(part);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicatePart(part.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePart(part.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
              {part.metadata.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(part.metadata.condition)}`}>
              {part.metadata.condition}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {part.metadata.manufacturer} • {part.metadata.model}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500">
              Qty: {part.metadata.quantity}
            </div>
            {part.metadata.value > 0 && (
              <span className="font-semibold text-lg text-gray-900">
                ${part.metadata.value.toLocaleString()}
              </span>
            )}
          </div>
          
          {part.metadata.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {part.metadata.categories.slice(0, 2).map(category => (
                <span
                  key={category}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded"
                >
                  {category}
                </span>
              ))}
              {part.metadata.categories.length > 2 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{part.metadata.categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const PartListItem: React.FC<{ part: SalvagePart }> = ({ part }) => {
    const isSelected = selectedParts.includes(part.id);

    return (
      <div 
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={(e) => handleSelectPart(part.id, e.ctrlKey || e.metaKey)}
      >
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{part.metadata.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(part.metadata.condition)}`}>
                {part.metadata.condition}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {part.metadata.manufacturer} • {part.metadata.model}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Qty: {part.metadata.quantity}</span>
                <span>•</span>
                <span>{part.metadata.location || 'No location'}</span>
                {part.metadata.value > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-gray-900">
                      ${part.metadata.value.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewPart(part);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPart(part);
                  }}
                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicatePart(part.id);
                  }}
                  className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePart(part.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Parts ({parts.length})
          </h2>
          {selectedParts.length > 0 && (
            <span className="text-sm text-blue-600">
              {selectedParts.length} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {parts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No parts found</p>
            <p>Try adjusting your search filters or add some parts to get started.</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }>
            {parts.map(part => (
              viewMode === 'grid' ? (
                <PartCard key={part.id} part={part} />
              ) : (
                <PartListItem key={part.id} part={part} />
              )
            ))}
          </div>
        )}
      </div>

      {/* Part Editor Modal */}
      <PartEditor
        part={editorState.part}
        isOpen={editorState.isOpen}
        mode={editorState.mode}
        onClose={() => setEditorState({ isOpen: false, mode: 'create' })}
      />
    </div>
  );
};

export default PartsList;