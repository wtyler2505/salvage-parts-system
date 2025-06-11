import React, { useState, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { MessageSquare, X, Edit, Trash2 } from 'lucide-react';
import { useViewerStore } from '../../stores/useViewerStore';
import * as THREE from 'three';

interface AnnotationProps {
  id: string;
  position: THREE.Vector3;
  text: string;
  author?: string;
  createdAt: Date;
  color?: string;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

const Annotation: React.FC<AnnotationProps> = ({
  id,
  position,
  text,
  author,
  createdAt,
  color = '#3B82F6',
  onEdit,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  
  const handleSave = () => {
    onEdit(id, editText);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };
  
  return (
    <Html position={position} distanceFactor={10} zIndexRange={[100, 0]}>
      <div className="relative group">
        {/* Annotation marker */}
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: color }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <MessageSquare className="w-3 h-3 text-white" />
        </div>
        
        {/* Pulse animation */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: color }}
        />
        
        {/* Annotation content */}
        {isExpanded && (
          <div className="absolute top-8 left-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {author || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => onDelete(id)}
                  className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="p-3">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {createdAt.toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};

export const AnnotationSystem: React.FC = () => {
  const { 
    annotations, 
    updateAnnotation, 
    deleteAnnotation 
  } = useViewerStore();
  
  return (
    <>
      {annotations.map((annotation) => (
        <Annotation
          key={annotation.id}
          id={annotation.id}
          position={annotation.position}
          text={annotation.text}
          author={annotation.author}
          createdAt={annotation.createdAt}
          color={annotation.color}
          onEdit={updateAnnotation}
          onDelete={deleteAnnotation}
        />
      ))}
    </>
  );
};