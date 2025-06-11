import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Pin, 
  Camera, 
  Share2, 
  Users, 
  Clock,
  Check,
  X,
  Edit3,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import * as THREE from 'three';

interface Annotation {
  id: string;
  position: THREE.Vector3;
  screenPosition: { x: number; y: number };
  content: string;
  author: string;
  timestamp: Date;
  type: 'comment' | 'measurement' | 'issue' | 'suggestion';
  status: 'open' | 'resolved' | 'in-progress';
  attachments: string[];
  replies: AnnotationReply[];
  visible: boolean;
}

interface AnnotationReply {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

interface AnnotationSystemProps {
  annotations: Annotation[];
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  currentUser: string;
  camera: THREE.Camera;
  scene: THREE.Scene;
}

const AnnotationSystem: React.FC<AnnotationSystemProps> = ({
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  currentUser,
  camera,
  scene
}) => {
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [newAnnotationContent, setNewAnnotationContent] = useState('');
  const [newAnnotationType, setNewAnnotationType] = useState<Annotation['type']>('comment');
  const [showAllAnnotations, setShowAllAnnotations] = useState(true);
  const [filterByType, setFilterByType] = useState<Annotation['type'] | 'all'>('all');
  const [filterByStatus, setFilterByStatus] = useState<Annotation['status'] | 'all'>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingAnnotation || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast to find 3D position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const position = intersects[0].point;
      const screenPosition = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      onAddAnnotation({
        position,
        screenPosition,
        content: newAnnotationContent,
        author: currentUser,
        type: newAnnotationType,
        status: 'open',
        attachments: [],
        replies: [],
        visible: true
      });

      setIsAddingAnnotation(false);
      setNewAnnotationContent('');
    }
  };

  const takeScreenshot = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annotation_screenshot_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const shareViewport = () => {
    const viewportData = {
      camera: {
        position: camera.position.toArray(),
        rotation: camera.rotation.toArray(),
        zoom: (camera as any).zoom || 1
      },
      annotations: annotations.filter(a => a.visible),
      timestamp: new Date().toISOString()
    };

    navigator.clipboard.writeText(JSON.stringify(viewportData, null, 2));
    // Show toast notification
  };

  const filteredAnnotations = annotations.filter(annotation => {
    if (!showAllAnnotations && !annotation.visible) return false;
    if (filterByType !== 'all' && annotation.type !== filterByType) return false;
    if (filterByStatus !== 'all' && annotation.status !== filterByStatus) return false;
    return true;
  });

  const getAnnotationIcon = (type: Annotation['type']) => {
    switch (type) {
      case 'comment': return MessageCircle;
      case 'measurement': return Pin;
      case 'issue': return X;
      case 'suggestion': return Edit3;
      default: return MessageCircle;
    }
  };

  const getStatusColor = (status: Annotation['status']) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AnnotationMarker: React.FC<{ annotation: Annotation }> = ({ annotation }) => {
    const Icon = getAnnotationIcon(annotation.type);
    const isSelected = selectedAnnotation === annotation.id;

    return (
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 ${
          isSelected ? 'scale-125' : ''
        }`}
        style={{
          left: annotation.screenPosition.x,
          top: annotation.screenPosition.y
        }}
        onClick={() => setSelectedAnnotation(annotation.id)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          annotation.type === 'issue' ? 'bg-red-500' :
          annotation.type === 'suggestion' ? 'bg-blue-500' :
          annotation.type === 'measurement' ? 'bg-purple-500' :
          'bg-green-500'
        } text-white`}>
          <Icon className="w-4 h-4" />
        </div>
        
        {/* Pulse animation for new annotations */}
        <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20" />
      </div>
    );
  };

  const AnnotationPanel: React.FC<{ annotation: Annotation }> = ({ annotation }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(annotation.content);
    const [replyContent, setReplyContent] = useState('');

    const handleSave = () => {
      onUpdateAnnotation(annotation.id, { content: editContent });
      setIsEditing(false);
    };

    const handleAddReply = () => {
      const newReply: AnnotationReply = {
        id: `reply_${Date.now()}`,
        content: replyContent,
        author: currentUser,
        timestamp: new Date()
      };

      onUpdateAnnotation(annotation.id, {
        replies: [...annotation.replies, newReply]
      });
      setReplyContent('');
    };

    return (
      <div className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 z-20"
           style={{
             left: Math.min(annotation.screenPosition.x + 20, window.innerWidth - 320),
             top: Math.min(annotation.screenPosition.y, window.innerHeight - 200)
           }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(annotation.status)}`}>
              {annotation.status}
            </span>
            <span className="text-xs text-gray-500">
              {annotation.type}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onUpdateAnnotation(annotation.id, { visible: !annotation.visible })}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {annotation.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            
            <button
              onClick={() => onDeleteAnnotation(annotation.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => setSelectedAnnotation(null)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">{annotation.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{annotation.author}</span>
                <span>{annotation.timestamp.toLocaleDateString()}</span>
                {annotation.author === currentUser && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Status Controls */}
          <div className="flex space-x-2">
            <select
              value={annotation.status}
              onChange={(e) => onUpdateAnnotation(annotation.id, { status: e.target.value as Annotation['status'] })}
              className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Replies */}
          {annotation.replies.length > 0 && (
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
              <h4 className="text-sm font-medium">Replies</h4>
              {annotation.replies.map(reply => (
                <div key={reply.id} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <p className="text-sm">{reply.content}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{reply.author}</span>
                    <span>{reply.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Reply */}
          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Add a reply..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded resize-none text-sm"
              rows={2}
            />
            <button
              onClick={handleAddReply}
              disabled={!replyContent.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Canvas overlay for annotations */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto z-10"
        onClick={handleCanvasClick}
        style={{ cursor: isAddingAnnotation ? 'crosshair' : 'default' }}
      />

      {/* Annotation markers */}
      {filteredAnnotations.map(annotation => (
        <AnnotationMarker key={annotation.id} annotation={annotation} />
      ))}

      {/* Selected annotation panel */}
      {selectedAnnotation && (
        <AnnotationPanel 
          annotation={annotations.find(a => a.id === selectedAnnotation)!} 
        />
      )}

      {/* Controls panel */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 space-y-4 z-20">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Annotations</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={takeScreenshot}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Take Screenshot"
            >
              <Camera className="w-4 h-4" />
            </button>
            
            <button
              onClick={shareViewport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Share Viewport"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add annotation controls */}
        <div className="space-y-2">
          <select
            value={newAnnotationType}
            onChange={(e) => setNewAnnotationType(e.target.value as Annotation['type'])}
            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="comment">Comment</option>
            <option value="measurement">Measurement</option>
            <option value="issue">Issue</option>
            <option value="suggestion">Suggestion</option>
          </select>
          
          <textarea
            value={newAnnotationContent}
            onChange={(e) => setNewAnnotationContent(e.target.value)}
            placeholder="Enter annotation content..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded resize-none text-sm"
            rows={2}
          />
          
          <button
            onClick={() => setIsAddingAnnotation(true)}
            disabled={!newAnnotationContent.trim()}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
          >
            {isAddingAnnotation ? 'Click on 3D model to place' : 'Add Annotation'}
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showAllAnnotations}
              onChange={(e) => setShowAllAnnotations(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show all annotations</span>
          </div>
          
          <select
            value={filterByType}
            onChange={(e) => setFilterByType(e.target.value as any)}
            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="all">All types</option>
            <option value="comment">Comments</option>
            <option value="measurement">Measurements</option>
            <option value="issue">Issues</option>
            <option value="suggestion">Suggestions</option>
          </select>
          
          <select
            value={filterByStatus}
            onChange={(e) => setFilterByStatus(e.target.value as any)}
            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Annotation list */}
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 max-h-40 overflow-y-auto">
          {filteredAnnotations.map(annotation => {
            const Icon = getAnnotationIcon(annotation.type);
            return (
              <div
                key={annotation.id}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedAnnotation === annotation.id ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
                onClick={() => setSelectedAnnotation(annotation.id)}
              >
                <Icon className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{annotation.content}</p>
                  <p className="text-xs text-gray-500">{annotation.author}</p>
                </div>
                <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(annotation.status)}`}>
                  {annotation.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnnotationSystem;