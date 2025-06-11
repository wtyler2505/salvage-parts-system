import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Plus, 
  Trash2,
  Copy,
  Scissors,
  Volume2,
  Eye,
  EyeOff
} from 'lucide-react';

interface Keyframe {
  id: string;
  time: number;
  property: string;
  value: any;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface AnimationTrack {
  id: string;
  name: string;
  partId: string;
  keyframes: Keyframe[];
  visible: boolean;
  muted: boolean;
  color: string;
}

interface TimelinePanelProps {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

const TimelinePanel: React.FC<TimelinePanelProps> = ({
  duration,
  currentTime,
  onTimeChange,
  onPlay,
  onPause,
  onStop
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<AnimationTrack[]>([]);
  const [selectedKeyframes, setSelectedKeyframes] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'playhead' | 'keyframe' | 'selection';
    startX: number;
    startTime: number;
  } | null>(null);

  const pixelsPerSecond = 100 * zoom;
  const timelineWidth = duration * pixelsPerSecond;

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
      setIsPlaying(false);
    } else {
      onPlay();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    onStop();
    setIsPlaying(false);
    onTimeChange(0);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = x / pixelsPerSecond;
    onTimeChange(Math.max(0, Math.min(duration, time)));
  };

  const handleKeyframeDrag = (keyframeId: string, startX: number, startTime: number) => {
    setDragState({
      isDragging: true,
      dragType: 'keyframe',
      startX,
      startTime
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left + scrollLeft;
    const deltaX = currentX - dragState.startX;
    const deltaTime = deltaX / pixelsPerSecond;

    if (dragState.dragType === 'playhead') {
      const newTime = Math.max(0, Math.min(duration, dragState.startTime + deltaTime));
      onTimeChange(newTime);
    } else if (dragState.dragType === 'keyframe') {
      // Update keyframe position
      // Implementation would update the keyframe time
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  const addKeyframe = (trackId: string, time: number, property: string, value: any) => {
    const newKeyframe: Keyframe = {
      id: `keyframe_${Date.now()}`,
      time,
      property,
      value,
      easing: 'ease-in-out'
    };

    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, keyframes: [...track.keyframes, newKeyframe].sort((a, b) => a.time - b.time) }
        : track
    ));
  };

  const deleteSelectedKeyframes = () => {
    setTracks(prev => prev.map(track => ({
      ...track,
      keyframes: track.keyframes.filter(kf => !selectedKeyframes.has(kf.id))
    })));
    setSelectedKeyframes(new Set());
  };

  const copySelectedKeyframes = () => {
    // Implementation for copying keyframes
  };

  const TimeRuler: React.FC = () => (
    <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative overflow-hidden">
      {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-gray-600"
          style={{ left: i * pixelsPerSecond - scrollLeft }}
        >
          <span className="absolute top-1 left-1 text-xs text-gray-600 dark:text-gray-400">
            {i}s
          </span>
        </div>
      ))}
      
      {/* Playhead */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 cursor-ew-resize z-10"
        style={{ left: currentTime * pixelsPerSecond - scrollLeft }}
        onMouseDown={(e) => {
          setDragState({
            isDragging: true,
            dragType: 'playhead',
            startX: e.clientX,
            startTime: currentTime
          });
        }}
      >
        <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 transform rotate-45" />
      </div>
    </div>
  );

  const TrackHeader: React.FC<{ track: AnimationTrack }> = ({ track }) => (
    <div className="w-48 h-12 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center px-3 space-x-2">
      <div 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: track.color }}
      />
      <span className="flex-1 text-sm font-medium truncate">{track.name}</span>
      <button
        onClick={() => setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, visible: !t.visible } : t
        ))}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
      >
        {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      </button>
      <button
        onClick={() => setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, muted: !t.muted } : t
        ))}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
      >
        <Volume2 className={`w-3 h-3 ${track.muted ? 'text-gray-400' : ''}`} />
      </button>
    </div>
  );

  const TrackContent: React.FC<{ track: AnimationTrack }> = ({ track }) => (
    <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative">
      {track.keyframes.map(keyframe => (
        <div
          key={keyframe.id}
          className={`absolute top-2 w-2 h-8 rounded cursor-pointer transform -translate-x-1 ${
            selectedKeyframes.has(keyframe.id) 
              ? 'bg-blue-500' 
              : 'bg-gray-400 hover:bg-gray-600'
          }`}
          style={{ left: keyframe.time * pixelsPerSecond - scrollLeft }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.ctrlKey || e.metaKey) {
              setSelectedKeyframes(prev => {
                const newSet = new Set(prev);
                if (newSet.has(keyframe.id)) {
                  newSet.delete(keyframe.id);
                } else {
                  newSet.add(keyframe.id);
                }
                return newSet;
              });
            } else {
              setSelectedKeyframes(new Set([keyframe.id]));
            }
          }}
          onMouseDown={(e) => {
            handleKeyframeDrag(keyframe.id, e.clientX, keyframe.time);
          }}
          title={`${keyframe.property}: ${keyframe.value} at ${keyframe.time.toFixed(2)}s`}
        />
      ))}
    </div>
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTimeChange(0)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleStop}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <Square className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onTimeChange(duration)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </span>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={copySelectedKeyframes}
              disabled={selectedKeyframes.size === 0}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={deleteSelectedKeyframes}
              disabled={selectedKeyframes.size === 0}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex">
          <div className="w-48 h-8 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center px-3">
            <span className="text-sm font-medium">Tracks</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <TimeRuler />
          </div>
        </div>

        <div 
          ref={timelineRef}
          className="flex-1 flex overflow-auto"
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div className="w-48 flex-shrink-0">
            {tracks.map(track => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
          
          <div className="flex-1 relative" style={{ width: timelineWidth }}>
            {tracks.map(track => (
              <TrackContent key={track.id} track={track} />
            ))}
          </div>
        </div>
      </div>

      {/* Add Track Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            const newTrack: AnimationTrack = {
              id: `track_${Date.now()}`,
              name: `Track ${tracks.length + 1}`,
              partId: '',
              keyframes: [],
              visible: true,
              muted: false,
              color: `hsl(${Math.random() * 360}, 70%, 50%)`
            };
            setTracks(prev => [...prev, newTrack]);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Track</span>
        </button>
      </div>
    </div>
  );
};

export default TimelinePanel;