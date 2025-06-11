import React from 'react';
import { Package, Heart, Clock, Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { Part } from '../../types';
import { usePartStore } from '../../stores/usePartStore';

interface PartCardProps {
  part: Part;
  selected?: boolean;
  isFavorite?: boolean;
  isRecent?: boolean;
  onClick?: () => void;
  onFavorite?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const PartCard: React.FC<PartCardProps> = ({
  part,
  selected = false,
  isFavorite = false,
  isRecent = false,
  onClick,
  onFavorite,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  size = 'md'
}) => {
  const getConditionColor = (condition: Part['metadata']['condition']) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'salvaged': return 'bg-yellow-100 text-yellow-800';
      case 'broken': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sizeClasses = {
    sm: {
      card: 'max-w-[150px]',
      image: 'h-24',
      title: 'text-xs',
      subtitle: 'text-xs',
      tag: 'text-[10px] px-1'
    },
    md: {
      card: 'max-w-[200px]',
      image: 'h-32',
      title: 'text-sm',
      subtitle: 'text-xs',
      tag: 'text-xs px-1.5'
    },
    lg: {
      card: 'max-w-[250px]',
      image: 'h-40',
      title: 'text-base',
      subtitle: 'text-sm',
      tag: 'text-xs px-2'
    }
  };

  return (
    <div
      className={`${sizeClasses[size].card} bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className={`${sizeClasses[size].image} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-t-lg flex items-center justify-center relative`}>
        <Package className="w-10 h-10 text-gray-400" />
        
        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.();
          }}
          className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        
        {/* Recent indicator */}
        {isRecent && (
          <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
      
      <div className="p-3">
        <h3 className={`font-medium ${sizeClasses[size].title} truncate`}>{part.metadata.name}</h3>
        <p className={`${sizeClasses[size].subtitle} text-gray-500 truncate`}>{part.metadata.manufacturer}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className={`${sizeClasses[size].tag} py-0.5 rounded-full ${getConditionColor(part.metadata.condition)}`}>
            {part.metadata.condition}
          </span>
          
          {part.metadata.value > 0 && (
            <span className="text-xs font-medium">
              ${part.metadata.value.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Action buttons - visible on hover */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-4 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.();
            }}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            title="View"
          >
            <Eye className="w-3 h-3 mx-auto" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
            title="Edit"
          >
            <Edit className="w-3 h-3 mx-auto" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.();
            }}
            className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
            title="Duplicate"
          >
            <Copy className="w-3 h-3 mx-auto" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Delete"
          >
            <Trash2 className="w-3 h-3 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartCard;