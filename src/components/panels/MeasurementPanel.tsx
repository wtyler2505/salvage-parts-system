import React, { useState } from 'react';
import { Ruler, Trash2, X, Filter, ArrowDownUp } from 'lucide-react';
import { useViewerStore } from '../../stores/useViewerStore';

const MeasurementPanel: React.FC = () => {
  const { 
    measurements, 
    deleteMeasurement, 
    clearMeasurements,
    showMeasurements,
    toggleMeasurements,
    isMeasuring,
    setIsMeasuring
  } = useViewerStore();
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('');
  
  // Sort and filter measurements
  const sortedMeasurements = [...measurements]
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.distance - b.distance;
      } else {
        return b.distance - a.distance;
      }
    });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Ruler className="w-5 h-5 mr-2 text-blue-500" />
            Measurements
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMeasuring(!isMeasuring)}
              className={`p-2 rounded-lg ${
                isMeasuring 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              title={isMeasuring ? 'Cancel Measurement' : 'Start Measuring'}
            >
              <Ruler className="w-4 h-4" />
            </button>
            
            <button
              onClick={clearMeasurements}
              className="p-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Clear All Measurements"
              disabled={measurements.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show Measurements</span>
            <button
              onClick={toggleMeasurements}
              className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                showMeasurements ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  showMeasurements ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <button
            onClick={toggleSortOrder}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <span>Distance</span>
            <ArrowDownUp className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Measurement List */}
      <div className="flex-1 overflow-auto p-4">
        {measurements.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Ruler className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No measurements yet</p>
            <button
              onClick={() => setIsMeasuring(true)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Start Measuring
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMeasurements.map((measurement) => (
              <div 
                key={measurement.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Ruler className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {measurement.distance.toFixed(2)} m
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Measurement #{measurements.indexOf(measurement) + 1}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeasurement(measurement.id)}
                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-gray-500 dark:text-gray-400">Start Point</div>
                    <div className="font-mono">
                      X: {measurement.startPoint.x.toFixed(2)}<br />
                      Y: {measurement.startPoint.y.toFixed(2)}<br />
                      Z: {measurement.startPoint.z.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-gray-500 dark:text-gray-400">End Point</div>
                    <div className="font-mono">
                      X: {measurement.endPoint.x.toFixed(2)}<br />
                      Y: {measurement.endPoint.y.toFixed(2)}<br />
                      Z: {measurement.endPoint.z.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      {measurements.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
          {measurements.length} measurement{measurements.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default MeasurementPanel;