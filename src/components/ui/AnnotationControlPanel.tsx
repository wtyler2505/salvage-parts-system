import React from 'react';
import { MessageSquare, Plus, List, Eye, EyeOff } from 'lucide-react';
import { useViewerStore } from '../../stores/useViewerStore';

interface AnnotationControlPanelProps {
  className?: string;
}

const AnnotationControlPanel: React.FC<AnnotationControlPanelProps> = ({ className = '' }) => {
  const { 
    isAddingAnnotation, 
    setIsAddingAnnotation,
    annotations
  } = useViewerStore();
  
  const [showAnnotations, setShowAnnotations] = React.useState(true);
  const [showPanel, setShowPanel] = React.useState(false);
  
  return (
    <div className={`absolute top-4 right-4 z-10 ${className}`}>
      <div className="flex flex-col items-end space-y-2">
        {/* Main control button */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Annotation Controls"
        >
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </button>
        
        {/* Control panel */}
        {showPanel && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-64">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                Annotations
              </h3>
            </div>
            
            <div className="p-3 space-y-3">
              {/* Add annotation button */}
              <button
                onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${
                  isAddingAnnotation
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                }`}
              >
                {isAddingAnnotation ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel Annotation</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Annotation</span>
                  </>
                )}
              </button>
              
              {/* Show/Hide annotations */}
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {showAnnotations ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide Annotations</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Show Annotations</span>
                  </>
                )}
              </button>
              
              {/* Annotation count */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total Annotations</span>
                <span className="font-medium">{annotations.length}</span>
              </div>
            </div>
            
            {/* Annotation list */}
            {annotations.length > 0 && (
              <div className="max-h-60 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                <div className="p-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <List className="w-3 h-3" />
                  <span>Recent Annotations</span>
                </div>
                
                <div className="space-y-1 p-2">
                  {annotations
                    .slice()
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .slice(0, 5)
                    .map(annotation => (
                      <div 
                        key={annotation.id}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {annotation.text}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-500 dark:text-gray-400">
                            {annotation.author || 'Anonymous'}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">
                            {new Date(annotation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {/* Instructions */}
            {isAddingAnnotation && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded-b-lg">
                <p>Click anywhere on the 3D model to place your annotation.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationControlPanel;