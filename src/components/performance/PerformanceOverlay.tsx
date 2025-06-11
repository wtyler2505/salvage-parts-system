import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Cpu, HardDrive, Zap, Eye, Settings } from 'lucide-react';
import { PerformanceManager, PerformanceMetrics } from '../../lib/performance/PerformanceManager';

interface PerformanceOverlayProps {
  performanceManager: PerformanceManager;
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
  performanceManager,
  visible = true,
  position = 'top-right'
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<{ fps: number[]; memory: number[]; drawCalls: number[] }>({
    fps: [],
    memory: [],
    drawCalls: []
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      const currentMetrics = performanceManager.getMetrics();
      setMetrics(currentMetrics);

      // Update history for graphs
      setHistory(prev => ({
        fps: [...prev.fps.slice(-59), currentMetrics.fps],
        memory: [...prev.memory.slice(-59), currentMetrics.memoryUsage],
        drawCalls: [...prev.drawCalls.slice(-59), currentMetrics.drawCalls]
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [performanceManager, visible]);

  useEffect(() => {
    if (expanded && canvasRef.current && history.fps.length > 0) {
      drawGraphs();
    }
  }, [history, expanded]);

  const drawGraphs = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw FPS graph
    drawGraph(ctx, history.fps, 0, height / 3, width, height / 3, '#00ff00', 60);
    
    // Draw Memory graph
    drawGraph(ctx, history.memory, 0, height / 3, width, height / 3, '#ff9900', Math.max(...history.memory) || 100);
    
    // Draw Draw Calls graph
    drawGraph(ctx, history.drawCalls, 0, (height / 3) * 2, width, height / 3, '#0099ff', Math.max(...history.drawCalls) || 1000);

    // Draw labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText('FPS', 5, 15);
    ctx.fillText('Memory (MB)', 5, height / 3 + 15);
    ctx.fillText('Draw Calls', 5, (height / 3) * 2 + 15);
  };

  const drawGraph = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    maxValue: number
  ) => {
    if (data.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();

    const stepX = width / (data.length - 1);
    
    data.forEach((value, index) => {
      const px = x + index * stepX;
      const py = y + height - (value / maxValue) * height;
      
      if (index === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });

    ctx.stroke();

    // Draw current value
    ctx.fillStyle = color;
    ctx.font = '10px monospace';
    const currentValue = data[data.length - 1];
    ctx.fillText(currentValue.toFixed(1), width - 40, y + 15);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 right-4';
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 100) return 'text-green-500';
    if (memory < 200) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!visible || !metrics) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg border border-gray-600 font-mono text-xs">
        {/* Compact View */}
        <div className="p-2 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="w-3 h-3" />
              <span>Performance</span>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-white"
            >
              {expanded ? <Eye className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className={getFPSColor(metrics.fps)}>
                {metrics.fps.toFixed(0)} FPS
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <HardDrive className="w-3 h-3 text-purple-400" />
              <span className={getMemoryColor(metrics.memoryUsage)}>
                {metrics.memoryUsage.toFixed(0)}MB
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-orange-400" />
              <span>{metrics.drawCalls} calls</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span>△ {(metrics.triangles / 1000).toFixed(0)}k</span>
            </div>
          </div>
        </div>

        {/* Expanded View */}
        {expanded && (
          <div className="border-t border-gray-600 p-2 space-y-2">
            {/* Graphs */}
            <canvas
              ref={canvasRef}
              width={200}
              height={120}
              className="w-full h-30 bg-gray-900 rounded"
            />

            {/* Detailed Metrics */}
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">Frame Time:</span>
                  <span className="ml-1">{metrics.frameTime.toFixed(1)}ms</span>
                </div>
                <div>
                  <span className="text-gray-400">GPU Memory:</span>
                  <span className="ml-1">{metrics.gpuMemory.toFixed(0)}MB</span>
                </div>
                <div>
                  <span className="text-gray-400">Geometries:</span>
                  <span className="ml-1">{metrics.geometries}</span>
                </div>
                <div>
                  <span className="text-gray-400">Textures:</span>
                  <span className="ml-1">{metrics.textures}</span>
                </div>
                <div>
                  <span className="text-gray-400">Programs:</span>
                  <span className="ml-1">{metrics.programs}</span>
                </div>
                <div>
                  <span className="text-gray-400">Quality:</span>
                  <span className="ml-1">{(performanceManager.getQualityLevel() * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Performance Warnings */}
              {metrics.fps < 30 && (
                <div className="text-red-400 text-xs">
                  ⚠ Low FPS detected
                </div>
              )}
              
              {metrics.memoryUsage > 200 && (
                <div className="text-yellow-400 text-xs">
                  ⚠ High memory usage
                </div>
              )}
              
              {metrics.drawCalls > 1000 && (
                <div className="text-orange-400 text-xs">
                  ⚠ High draw calls
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceOverlay;