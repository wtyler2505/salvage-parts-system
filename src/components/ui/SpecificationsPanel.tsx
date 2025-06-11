import React from 'react';
import { X, Package, Ruler, Zap, Thermometer, DollarSign, Calendar, Tag } from 'lucide-react';
import { usePartStore } from '../../stores/usePartStore';
import { useViewerStore } from '../../stores/useViewerStore';
import { Part } from '../../types';

const SpecificationsPanel: React.FC = () => {
  const { parts } = usePartStore();
  const { selectionState, clearSelection } = useViewerStore();

  const selectedPart = parts.find(part => 
    selectionState.selectedParts.includes(part.id!)
  );

  if (!selectedPart) {
    return (
      <div className="bg-white border-l border-gray-200 p-6 flex flex-col items-center justify-center text-gray-500">
        <Package className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-center">Select a part to view specifications</p>
      </div>
    );
  }

  const getConditionColor = (condition: Part['condition']) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'refurbished': return 'bg-blue-100 text-blue-800';
      case 'used': return 'bg-yellow-100 text-yellow-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: Part['availability']) => {
    switch (availability) {
      case 'in-stock': return 'text-green-600';
      case 'low-stock': return 'text-yellow-600';
      case 'out-of-stock': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const SpecRow: React.FC<{ label: string; value: any; icon?: any }> = ({ 
    label, 
    value, 
    icon: Icon 
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
          <button
            onClick={clearSelection}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-600">Selected Part</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">{selectedPart.name}</h3>
          <div className="space-y-1">
            <SpecRow label="Category" value={selectedPart.category} />
            <SpecRow label="Subcategory" value={selectedPart.subcategory} />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Condition</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(selectedPart.condition)}`}>
                {selectedPart.condition}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Availability</span>
              <span className={`text-sm font-medium ${getAvailabilityColor(selectedPart.availability)}`}>
                {selectedPart.availability.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        {selectedPart.price && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              Pricing
            </h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                ${selectedPart.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Current market price</div>
            </div>
          </div>
        )}

        {/* Dimensions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Ruler className="w-4 h-4 mr-2 text-gray-400" />
            Dimensions
          </h4>
          <div className="space-y-1">
            <SpecRow label="Length" value={`${selectedPart.dimensions.length} mm`} />
            <SpecRow label="Width" value={`${selectedPart.dimensions.width} mm`} />
            <SpecRow label="Height" value={`${selectedPart.dimensions.height} mm`} />
            <SpecRow label="Weight" value={`${selectedPart.dimensions.weight} kg`} />
          </div>
        </div>

        {/* Materials */}
        {selectedPart.materials.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Materials</h4>
            <div className="flex flex-wrap gap-2">
              {selectedPart.materials.map(material => (
                <span
                  key={material}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                >
                  {material}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Electrical Properties */}
        {selectedPart.electricalProperties && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-gray-400" />
              Electrical Properties
            </h4>
            <div className="space-y-1">
              {selectedPart.electricalProperties.voltage && (
                <SpecRow label="Voltage\" value={`${selectedPart.electricalProperties.voltage} V`} />
              )}
              {selectedPart.electricalProperties.current && (
                <SpecRow label="Current" value={`${selectedPart.electricalProperties.current} A`} />
              )}
              {selectedPart.electricalProperties.power && (
                <SpecRow label="Power\" value={`${selectedPart.electricalProperties.power} W`} />
              )}
            </div>
          </div>
        )}

        {/* Thermal Properties */}
        {selectedPart.thermalProperties && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Thermometer className="w-4 h-4 mr-2 text-gray-400" />
              Thermal Properties
            </h4>
            <div className="space-y-1">
              {selectedPart.thermalProperties.maxTemperature && (
                <SpecRow label="Max Temperature\" value={`${selectedPart.thermalProperties.maxTemperature}°C`} />
              )}
              {selectedPart.thermalProperties.thermalConductivity && (
                <SpecRow label="Thermal Conductivity" value={`${selectedPart.thermalProperties.thermalConductivity} W/mK`} />
              )}
            </div>
          </div>
        )}

        {/* Custom Specifications */}
        {Object.keys(selectedPart.specifications).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Technical Specifications</h4>
            <div className="space-y-1">
              {Object.entries(selectedPart.specifications).map(([key, value]) => (
                <SpecRow key={key} label={key} value={String(value)} />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {selectedPart.tags.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedPart.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            History
          </h4>
          <div className="space-y-1">
            <SpecRow 
              label="Added" 
              value={selectedPart.createdAt.toLocaleDateString()} 
            />
            <SpecRow 
              label="Updated" 
              value={selectedPart.updatedAt.toLocaleDateString()} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationsPanel;