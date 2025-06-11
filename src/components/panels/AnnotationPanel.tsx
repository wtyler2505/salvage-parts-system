import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit, Save, X, Plus, Filter } from 'lucide-react';
import { useViewerStore } from '../../stores/useViewerStore';

const AnnotationPanel: React.FC = () => {
  const { 
    annotations, 
    updateAnnotation, 
    deleteAnnotation, 
    setIsAddingAnnotation 
  } = useViewerStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('');
  
  const handleEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };
  
  const handleSave = () => {
    if (editingId) {
      updateAnnotation(editingId, editText);
      setEditingId(null);
      setEditText('');
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      deleteAnnotation(id);
    }
  };
  
  // Filter and sort annotations
  const filteredAnnotations = annotations
    .filter(annotation => 
      filter ? 
        annotation.text.toLowerCase().includes(filter.toLowerCase()) || 
        (annotation.author && annotation.author.toLowerCase().includes(filter.toLowerCase()))
      : true
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            Annotations
          </h2>
          <button
            onClick={() => setIsAddingAnnotation(true)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add</span>
          </button>
        </div>
        
        {/* Search/Filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filter annotations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {/* Annotation List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filteredAnnotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No annotations found</p>
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          filteredAnnotations.map(annotation => (
            <div 
              key={annotation.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
            >
              {editingId === annotation.id ? (
                <div className="p-3 space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center space-x-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: annotation.color || '#3B82F6' }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {annotation.author || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(annotation.id, annotation.text)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(annotation.id)}
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{annotation.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {annotation.createdAt.toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
        {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default AnnotationPanel;