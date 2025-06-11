import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Upload, Download, Copy } from 'lucide-react';
import { SalvagePart } from '../../types/salvagePart';
import { usePartStore } from '../../stores/usePartStore';

interface PartEditorProps {
  part?: SalvagePart;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const PartEditor: React.FC<PartEditorProps> = ({ part, isOpen, onClose, mode }) => {
  const { createPart, updatePart, duplicatePart } = usePartStore();
  const [formData, setFormData] = useState<Partial<SalvagePart>>({});
  const [activeTab, setActiveTab] = useState('metadata');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData(part);
    } else {
      setFormData({
        metadata: {
          name: '',
          manufacturer: '',
          model: '',
          partNumbers: [],
          categories: [],
          tags: [],
          dateAdded: new Date(),
          lastModified: new Date(),
          notes: '',
          condition: 'used',
          quantity: 1,
          location: '',
          value: 0,
          source: ''
        },
        specifications: { custom: {} },
        models: {
          primary: { id: '', url: '', format: 'gltf', size: 0, checksum: '', metadata: { vertices: 0, faces: 0, materials: [], animations: [] } },
          lods: [],
          collision: { id: '', url: '', format: 'gltf', size: 0, checksum: '', metadata: { vertices: 0, faces: 0, materials: [], animations: [] } }
        },
        components: [],
        documentation: { datasheets: [], manuals: [], schematics: [], images: [], videos: [] },
        simulation: {
          physics: { mass: 1, density: 1, friction: 0.5, restitution: 0.3, collisionShape: 'box' },
          electrical: { conductivity: 0, resistivity: 0, dielectric: 1, breakdown: 0 },
          thermal: { conductivity: 0, capacity: 0, expansion: 0, emissivity: 0 }
        }
      });
    }
  }, [part]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === 'create') {
        await createPart(formData as Omit<SalvagePart, 'id'>);
      } else if (mode === 'edit' && part) {
        await updatePart(part.id, formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save part:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (part) {
      try {
        await duplicatePart(part.id);
        onClose();
      } catch (error) {
        console.error('Failed to duplicate part:', error);
      }
    }
  };

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (path: string, item: any) => {
    const currentArray = path.split('.').reduce((obj, key) => obj?.[key], formData) || [];
    updateFormData(path, [...currentArray, item]);
  };

  const removeArrayItem = (path: string, index: number) => {
    const currentArray = path.split('.').reduce((obj, key) => obj?.[key], formData) || [];
    updateFormData(path, currentArray.filter((_: any, i: number) => i !== index));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'metadata', name: 'Metadata', icon: '📋' },
    { id: 'specifications', name: 'Specifications', icon: '⚙️' },
    { id: 'models', name: '3D Models', icon: '🎯' },
    { id: 'documentation', name: 'Documentation', icon: '📚' },
    { id: 'simulation', name: 'Simulation', icon: '🔬' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create New Part' : 
               mode === 'edit' ? 'Edit Part' : 'View Part'}
            </h2>
            {formData.metadata?.name && (
              <span className="text-gray-500">- {formData.metadata.name}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {mode !== 'create' && (
              <button
                onClick={handleDuplicate}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate</span>
              </button>
            )}
            
            {mode !== 'view' && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'metadata' && (
              <MetadataTab 
                data={formData.metadata || {}} 
                onChange={(data) => updateFormData('metadata', data)}
                readOnly={mode === 'view'}
              />
            )}
            
            {activeTab === 'specifications' && (
              <SpecificationsTab 
                data={formData.specifications || {}} 
                onChange={(data) => updateFormData('specifications', data)}
                readOnly={mode === 'view'}
              />
            )}
            
            {activeTab === 'models' && (
              <ModelsTab 
                data={formData.models || {}} 
                onChange={(data) => updateFormData('models', data)}
                readOnly={mode === 'view'}
              />
            )}
            
            {activeTab === 'documentation' && (
              <DocumentationTab 
                data={formData.documentation || {}} 
                onChange={(data) => updateFormData('documentation', data)}
                readOnly={mode === 'view'}
              />
            )}
            
            {activeTab === 'simulation' && (
              <SimulationTab 
                data={formData.simulation || {}} 
                onChange={(data) => updateFormData('simulation', data)}
                readOnly={mode === 'view'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Metadata Tab Component
const MetadataTab: React.FC<{ data: any; onChange: (data: any) => void; readOnly: boolean }> = ({ 
  data, onChange, readOnly 
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addToArray = (field: string, value: string) => {
    if (value.trim()) {
      const currentArray = data[field] || [];
      onChange({ ...data, [field]: [...currentArray, value.trim()] });
    }
  };

  const removeFromArray = (field: string, index: number) => {
    const currentArray = data[field] || [];
    onChange({ ...data, [field]: currentArray.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="Enter part name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
          <input
            type="text"
            value={data.manufacturer || ''}
            onChange={(e) => updateField('manufacturer', e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="Enter manufacturer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
          <input
            type="text"
            value={data.model || ''}
            onChange={(e) => updateField('model', e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="Enter model"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
          <select
            value={data.condition || 'used'}
            onChange={(e) => updateField('condition', e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="salvaged">Salvaged</option>
            <option value="broken">Broken</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={data.quantity || 1}
            onChange={(e) => updateField('quantity', parseInt(e.target.value) || 1)}
            disabled={readOnly}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Value ($)</label>
          <input
            type="number"
            value={data.value || 0}
            onChange={(e) => updateField('value', parseFloat(e.target.value) || 0)}
            disabled={readOnly}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="Storage location"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
          <input
            type="text"
            value={data.source || ''}
            onChange={(e) => updateField('source', e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="Where did this part come from?"
          />
        </div>
      </div>

      {/* Part Numbers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Part Numbers</label>
        <div className="space-y-2">
          {(data.partNumbers || []).map((partNumber: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={partNumber}
                onChange={(e) => {
                  const newPartNumbers = [...(data.partNumbers || [])];
                  newPartNumbers[index] = e.target.value;
                  updateField('partNumbers', newPartNumbers);
                }}
                disabled={readOnly}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
              {!readOnly && (
                <button
                  onClick={() => removeFromArray('partNumbers', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              onClick={() => addToArray('partNumbers', '')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              <span>Add Part Number</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(data.categories || []).map((category: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {category}
              {!readOnly && (
                <button
                  onClick={() => removeFromArray('categories', index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {!readOnly && (
          <input
            type="text"
            placeholder="Add category and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('categories', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(data.tags || []).map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
            >
              {tag}
              {!readOnly && (
                <button
                  onClick={() => removeFromArray('tags', index)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {!readOnly && (
          <input
            type="text"
            placeholder="Add tag and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('tags', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          disabled={readOnly}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          placeholder="Additional notes about this part..."
        />
      </div>
    </div>
  );
};

// Specifications Tab Component
const SpecificationsTab: React.FC<{ data: any; onChange: (data: any) => void; readOnly: boolean }> = ({ 
  data, onChange, readOnly 
}) => {
  const [activeSpecType, setActiveSpecType] = useState('electrical');

  const updateSpec = (type: string, field: string, value: any) => {
    onChange({
      ...data,
      [type]: {
        ...data[type],
        [field]: value
      }
    });
  };

  const specTypes = [
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'mechanical', name: 'Mechanical', icon: '⚙️' },
    { id: 'thermal', name: 'Thermal', icon: '🌡️' },
    { id: 'custom', name: 'Custom', icon: '🔧' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        {specTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveSpecType(type.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
              activeSpecType === type.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.name}</span>
          </button>
        ))}
      </div>

      {activeSpecType === 'electrical' && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Voltage</label>
            <input
              type="text"
              value={data.electrical?.voltage || ''}
              onChange={(e) => updateSpec('electrical', 'voltage', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="e.g., 12V DC"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current</label>
            <input
              type="text"
              value={data.electrical?.current || ''}
              onChange={(e) => updateSpec('electrical', 'current', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="e.g., 2.5A"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Power</label>
            <input
              type="text"
              value={data.electrical?.power || ''}
              onChange={(e) => updateSpec('electrical', 'power', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="e.g., 30W"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resistance (Ω)</label>
            <input
              type="number"
              value={data.electrical?.resistance || ''}
              onChange={(e) => updateSpec('electrical', 'resistance', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacitance (F)</label>
            <input
              type="number"
              value={data.electrical?.capacitance || ''}
              onChange={(e) => updateSpec('electrical', 'capacitance', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <input
              type="text"
              value={data.electrical?.frequency || ''}
              onChange={(e) => updateSpec('electrical', 'frequency', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="e.g., 50Hz"
            />
          </div>
        </div>
      )}

      {activeSpecType === 'mechanical' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (mm)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Length (X)</label>
                <input
                  type="number"
                  value={data.mechanical?.dimensions?.x || ''}
                  onChange={(e) => updateSpec('mechanical', 'dimensions', { 
                    ...data.mechanical?.dimensions, 
                    x: parseFloat(e.target.value) || 0 
                  })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Width (Y)</label>
                <input
                  type="number"
                  value={data.mechanical?.dimensions?.y || ''}
                  onChange={(e) => updateSpec('mechanical', 'dimensions', { 
                    ...data.mechanical?.dimensions, 
                    y: parseFloat(e.target.value) || 0 
                  })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Height (Z)</label>
                <input
                  type="number"
                  value={data.mechanical?.dimensions?.z || ''}
                  onChange={(e) => updateSpec('mechanical', 'dimensions', { 
                    ...data.mechanical?.dimensions, 
                    z: parseFloat(e.target.value) || 0 
                  })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={data.mechanical?.weight || ''}
                onChange={(e) => updateSpec('mechanical', 'weight', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
              <input
                type="text"
                value={data.mechanical?.material || ''}
                onChange={(e) => updateSpec('mechanical', 'material', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., Aluminum, Steel, Plastic"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Torque</label>
              <input
                type="text"
                value={data.mechanical?.torque || ''}
                onChange={(e) => updateSpec('mechanical', 'torque', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., 50 Nm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RPM</label>
              <input
                type="number"
                value={data.mechanical?.rpm || ''}
                onChange={(e) => updateSpec('mechanical', 'rpm', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
      )}

      {activeSpecType === 'thermal' && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operating Temperature Range (°C)</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  value={data.thermal?.operatingTemp?.min || ''}
                  onChange={(e) => updateSpec('thermal', 'operatingTemp', { 
                    ...data.thermal?.operatingTemp, 
                    min: parseFloat(e.target.value) || 0 
                  })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  value={data.thermal?.operatingTemp?.max || ''}
                  onChange={(e) => updateSpec('thermal', 'operatingTemp', { 
                    ...data.thermal?.operatingTemp, 
                    max: parseFloat(e.target.value) || 0 
                  })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thermal Resistance (K/W)</label>
            <input
              type="number"
              value={data.thermal?.thermalResistance || ''}
              onChange={(e) => updateSpec('thermal', 'thermalResistance', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heat Dissipation (W)</label>
            <input
              type="number"
              value={data.thermal?.heatDissipation || ''}
              onChange={(e) => updateSpec('thermal', 'heatDissipation', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      )}

      {activeSpecType === 'custom' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Custom Specifications</h3>
            {!readOnly && (
              <button
                onClick={() => {
                  const key = prompt('Enter specification name:');
                  if (key) {
                    updateSpec('custom', key, '');
                  }
                }}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>Add Specification</span>
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {Object.entries(data.custom || {}).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                  <input
                    type="text"
                    value={String(value)}
                    onChange={(e) => updateSpec('custom', key, e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                {!readOnly && (
                  <button
                    onClick={() => {
                      const newCustom = { ...data.custom };
                      delete newCustom[key];
                      onChange({ ...data, custom: newCustom });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Models Tab Component
const ModelsTab: React.FC<{ data: any; onChange: (data: any) => void; readOnly: boolean }> = ({ 
  data, onChange, readOnly 
}) => {
  const handleFileUpload = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload the file and return a URL
      const mockUrl = URL.createObjectURL(file);
      const modelData = {
        id: crypto.randomUUID(),
        url: mockUrl,
        format: file.name.split('.').pop()?.toLowerCase() as any,
        size: file.size,
        checksum: 'mock-checksum',
        metadata: {
          vertices: 0,
          faces: 0,
          materials: [],
          animations: []
        }
      };
      
      onChange({
        ...data,
        [type]: modelData
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Primary Model */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Primary Model</h3>
            {!readOnly && (
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Model</span>
                <input
                  type="file"
                  accept=".gltf,.glb,.obj,.stl,.step"
                  onChange={(e) => handleFileUpload('primary', e)}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          {data.primary?.url ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Model Loaded</p>
                  <p className="text-sm text-gray-600">Format: {data.primary.format?.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Size: {(data.primary.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">
                <Upload className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No primary model uploaded</p>
              <p className="text-sm text-gray-500">Supported formats: GLTF, OBJ, STL, STEP</p>
            </div>
          )}
        </div>

        {/* LOD Models */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Level of Detail (LOD) Models</h3>
            {!readOnly && (
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add LOD Level</span>
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {(data.lods || []).map((lod: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">LOD Level {index + 1}</p>
                  <p className="text-sm text-gray-600">Format: {lod.format?.toUpperCase()}</p>
                </div>
                {!readOnly && (
                  <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            {(data.lods || []).length === 0 && (
              <p className="text-gray-500 text-center py-4">No LOD models configured</p>
            )}
          </div>
        </div>

        {/* Collision Model */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Collision Model</h3>
            {!readOnly && (
              <label className="cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Collision</span>
                <input
                  type="file"
                  accept=".gltf,.glb,.obj,.stl"
                  onChange={(e) => handleFileUpload('collision', e)}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          {data.collision?.url ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">Collision Model Loaded</p>
              <p className="text-sm text-gray-600">Format: {data.collision.format?.toUpperCase()}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No collision model uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Documentation Tab Component
const DocumentationTab: React.FC<{ data: any; onChange: (data: any) => void; readOnly: boolean }> = ({ 
  data, onChange, readOnly 
}) => {
  const documentTypes = [
    { key: 'datasheets', name: 'Datasheets', icon: '📊' },
    { key: 'manuals', name: 'Manuals', icon: '📖' },
    { key: 'schematics', name: 'Schematics', icon: '🔌' },
    { key: 'images', name: 'Images', icon: '🖼️' },
    { key: 'videos', name: 'Videos', icon: '🎥' }
  ];

  const addDocument = (type: string, file: File) => {
    const newDoc = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'text',
      url: URL.createObjectURL(file),
      size: file.size,
      uploadDate: new Date(),
      tags: []
    };

    onChange({
      ...data,
      [type]: [...(data[type] || []), newDoc]
    });
  };

  const removeDocument = (type: string, index: number) => {
    const newDocs = [...(data[type] || [])];
    newDocs.splice(index, 1);
    onChange({
      ...data,
      [type]: newDocs
    });
  };

  return (
    <div className="space-y-6">
      {documentTypes.map(docType => (
        <div key={docType.key} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <span className="text-xl">{docType.icon}</span>
              <span>{docType.name}</span>
            </h3>
            {!readOnly && (
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  multiple
                  accept={docType.key === 'images' ? 'image/*' : docType.key === 'videos' ? 'video/*' : '.pdf,.doc,.docx,.txt'}
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(file => {
                      addDocument(docType.key, file);
                    });
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {(data[docType.key] || []).map((doc: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{docType.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-sm text-gray-600">{(doc.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => removeDocument(docType.key, index)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {(data[docType.key] || []).length === 0 && (
            <p className="text-gray-500 text-center py-4">No {docType.name.toLowerCase()} uploaded</p>
          )}
        </div>
      ))}
    </div>
  );
};

// Simulation Tab Component
const SimulationTab: React.FC<{ data: any; onChange: (data: any) => void; readOnly: boolean }> = ({ 
  data, onChange, readOnly 
}) => {
  const updateSimulation = (type: string, field: string, value: any) => {
    onChange({
      ...data,
      [type]: {
        ...data[type],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Physics Properties */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <span className="text-xl">⚛️</span>
          <span>Physics Properties</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mass (kg)</label>
            <input
              type="number"
              value={data.physics?.mass || ''}
              onChange={(e) => updateSimulation('physics', 'mass', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Density (kg/m³)</label>
            <input
              type="number"
              value={data.physics?.density || ''}
              onChange={(e) => updateSimulation('physics', 'density', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Friction Coefficient</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={data.physics?.friction || ''}
              onChange={(e) => updateSimulation('physics', 'friction', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restitution</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={data.physics?.restitution || ''}
              onChange={(e) => updateSimulation('physics', 'restitution', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Collision Shape</label>
            <select
              value={data.physics?.collisionShape || 'box'}
              onChange={(e) => updateSimulation('physics', 'collisionShape', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            >
              <option value="box">Box</option>
              <option value="sphere">Sphere</option>
              <option value="cylinder">Cylinder</option>
              <option value="mesh">Mesh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Electrical Properties */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <span className="text-xl">⚡</span>
          <span>Electrical Properties</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conductivity (S/m)</label>
            <input
              type="number"
              value={data.electrical?.conductivity || ''}
              onChange={(e) => updateSimulation('electrical', 'conductivity', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resistivity (Ω⋅m)</label>
            <input
              type="number"
              value={data.electrical?.resistivity || ''}
              onChange={(e) => updateSimulation('electrical', 'resistivity', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dielectric Constant</label>
            <input
              type="number"
              value={data.electrical?.dielectric || ''}
              onChange={(e) => updateSimulation('electrical', 'dielectric', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Breakdown Voltage (V)</label>
            <input
              type="number"
              value={data.electrical?.breakdown || ''}
              onChange={(e) => updateSimulation('electrical', 'breakdown', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Thermal Properties */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <span className="text-xl">🌡️</span>
          <span>Thermal Properties</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thermal Conductivity (W/mK)</label>
            <input
              type="number"
              value={data.thermal?.conductivity || ''}
              onChange={(e) => updateSimulation('thermal', 'conductivity', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heat Capacity (J/kgK)</label>
            <input
              type="number"
              value={data.thermal?.capacity || ''}
              onChange={(e) => updateSimulation('thermal', 'capacity', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thermal Expansion (1/K)</label>
            <input
              type="number"
              value={data.thermal?.expansion || ''}
              onChange={(e) => updateSimulation('thermal', 'expansion', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emissivity</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={data.thermal?.emissivity || ''}
              onChange={(e) => updateSimulation('thermal', 'emissivity', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartEditor;

export default PartEditor