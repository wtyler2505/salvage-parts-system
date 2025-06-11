import React, { useState } from 'react';
import { Save, Trash2, Edit, Check, X, Plus, LayoutGrid } from 'lucide-react';
import { useLayoutStore } from '../../stores/useLayoutStore';

interface WorkspaceManagerProps {
  className?: string;
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ className = '' }) => {
  const {
    workspaces,
    currentWorkspaceId,
    saveWorkspace,
    loadWorkspace,
    deleteWorkspace,
    presetLayouts,
    loadPresetLayout
  } = useLayoutStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  const handleSaveWorkspace = () => {
    if (newWorkspaceName.trim()) {
      saveWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
      setIsCreating(false);
    }
  };
  
  const handleUpdateWorkspaceName = () => {
    if (editingId && editingName.trim()) {
      const workspace = workspaces.find(w => w.id === editingId);
      if (workspace) {
        // Create a new workspace with the updated name but same layout
        saveWorkspace(editingName);
        // Delete the old workspace
        deleteWorkspace(editingId);
        setEditingId(null);
        setEditingName('');
      }
    }
  };
  
  const handleDeleteWorkspace = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      deleteWorkspace(id);
    }
  };
  
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LayoutGrid className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Workspaces</h3>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          title="Create new workspace"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* Create new workspace form */}
      {isCreating && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              autoFocus
            />
            <button
              onClick={handleSaveWorkspace}
              className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
              title="Save workspace"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Current workspace indicator */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Current Workspace</div>
            <div className="font-medium text-blue-800 dark:text-blue-300">{currentWorkspace?.name || 'Default'}</div>
          </div>
          <button
            onClick={() => saveWorkspace()}
            className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Save current layout"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset layouts */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Presets</div>
        <div className="flex flex-wrap gap-2">
          {presetLayouts.map(preset => (
            <button
              key={preset.id}
              onClick={() => loadPresetLayout(preset.id)}
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace list */}
      <div className="overflow-auto max-h-64">
        {workspaces.map(workspace => (
          <div 
            key={workspace.id}
            className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 ${
              workspace.id === currentWorkspaceId ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            {editingId === workspace.id ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={handleUpdateWorkspaceName}
                  className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => loadWorkspace(workspace.id)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-gray-800 dark:text-gray-200">{workspace.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </div>
                </button>
                
                <div className="flex items-center space-x-1">
                  {workspace.id !== 'default' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(workspace.id);
                          setEditingName(workspace.name);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Rename workspace"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                        title="Delete workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Empty state */}
      {workspaces.length === 0 && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <p>No workspaces saved yet.</p>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManager;