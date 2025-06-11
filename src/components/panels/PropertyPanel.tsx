import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Palette,
  Layers,
  Settings,
  Zap,
  Thermometer,
  Wrench,
  Magnet
} from 'lucide-react';
import { SalvagePart } from '../../types/salvagePart';
import { useSalvagePartStore } from '../../stores/useSalvagePartStore';
import { useViewerStore } from '../../stores/useViewerStore';

interface PropertyPanelProps {
  part: SalvagePart | null;
  onPartUpdate?: (updates: Partial<SalvagePart>) => void;
}

interface Section {
  id: string;
  title: string;
  icon?: React.ComponentType<any>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ part, onPartUpdate }) => {
  const { updatePart } = useSalvagePartStore();
  const { simulationSettings, updateSimulationSettings } = useViewerStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general']));
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: any; type: string }>>([]);

  const sections: Section[] = [
    { id: 'general', title: 'General', defaultExpanded: true },
    { id: 'specifications', title: 'Specifications', icon: Settings, collapsible: true },
    { id: 'model', title: '3D Model', icon: Layers, collapsible: true },
    { id: 'physics', title: 'Physics', icon: Wrench, collapsible: true },
    { id: 'simulation', title: 'Simulation', icon: Magnet, collapsible: true },
    { id: 'electrical', title: 'Electrical', icon: Zap, collapsible: true }, 
    { id: 'thermal', title: 'Thermal', icon: Thermometer, collapsible: true }
  ];

  useEffect(() => {
    if (part) {
      setLocalValues({
        name: part.metadata.name,
        manufacturer: part.metadata.manufacturer,
        model: part.metadata.model,
        // Physics properties
        mass: part.simulation?.physics?.mass || 1,
        friction: part.simulation?.physics?.friction || 0.5,
        restitution: part.simulation?.physics?.restitution || 0.2,
        density: part.simulation?.physics?.density || 1000,
        collisionShape: part.simulation?.physics?.collisionShape || 'box',
        // Other properties
        ...part.specifications.custom
      });
      
      // Load custom fields
      const custom = Object.entries(part.specifications.custom).map(([key, value]) => ({
        key,
        value,
        type: typeof value
      }));
      setCustomFields(custom);
    }
  }, [part]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  };

  const handleFieldEdit = (fieldId: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const saveField = async (fieldId: string) => {
    if (!part) return;

    const value = localValues[fieldId];
    const updates: Partial<SalvagePart> = {};

    console.log(`Saving field ${fieldId} with value ${value}`);
    // Map field to part structure
    switch (fieldId) {
      case 'name':
        updates.metadata = { ...part.metadata, name: value };
        break;
      case 'manufacturer':
        updates.metadata = { ...part.metadata, manufacturer: value };
        break;
      case 'model':
        updates.metadata = { ...part.metadata, model: value };
        break;
      case 'mass':
        updates.simulation = {
          ...part.simulation,
          physics: { ...part.simulation.physics, mass: parseFloat(value) }
        };
        break;
      case 'friction':
        updates.simulation = {
          ...part.simulation,
          physics: { ...part.simulation.physics, friction: parseFloat(value) }
        };
        break;
      case 'restitution':
        updates.simulation = {
          ...part.simulation,
          physics: { ...part.simulation.physics, restitution: parseFloat(value) }
        };
        break;
      case 'density':
        updates.simulation = {
          ...part.simulation,
          physics: { ...part.simulation.physics, density: parseFloat(value) }
        };
        break;
      case 'collisionShape':
        updates.simulation = {
          ...part.simulation,
          physics: { ...part.simulation.physics, collisionShape: value }
        };
        break;
        
      default:
        // Custom specification field
        updates.specifications = {
          ...part.specifications,
          custom: { ...part.specifications.custom, [fieldId]: value }
        };
    }

    console.log('Updates:', updates);
    try {
      await updatePart(part.id, updates);
      setEditingField(null);
      onPartUpdate?.(updates);
    } catch (error) {
      console.error('Failed to update part:', error);
    }
  };
  
  const handleSimulationToggle = (type: 'physics' | 'electrical' | 'thermal', enabled: boolean) => {
    updateSimulationSettings({
      [type]: {
        ...simulationSettings[type],
        enabled
      }
    });
    
    console.log(`${type} simulation ${enabled ? 'enabled' : 'disabled'}`);
  };

  const addCustomField = () => {
    const newField = { key: 'new_field', value: '', type: 'string' };
    setCustomFields(prev => [...prev, newField]);
    setEditingField(`custom_${customFields.length}`);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const SelectInput: React.FC<{ 
    field: string; 
    label: string; 
    value: any; 
    options: Array<{ value: string; label: string }>;
    onChange?: (value: string) => void;
  }> = ({ field, label, value, options, onChange }) => {
    const isEditing = editingField === field;
    
  const TextInput: React.FC<{ 
    field: string; 
    label: string; 
    value: any; 
    type?: string;
    placeholder?: string;
  }> = ({ field, label, value, type = 'text', placeholder }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type={type}
              value={localValues[field] || ''}
              onChange={(e) => handleFieldEdit(field, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={() => saveField(field)}
              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingField(null)}
              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between group"
            onClick={() => setEditingField(field)}
          >
            <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
              {value || placeholder || 'Click to edit'}
            </span>
            <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    );
  };

  const SelectInputOld: React.FC<{ 
    field: string; 
    label: string; 
    value: any; 
    options: Array<{ value: string; label: string }>;
  }> = ({ field, label, value, options }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <select
            value={localValues[field] || ''}
            onChange={(e) => {
              handleFieldEdit(field, e.target.value);
              onChange?.(e.target.value);
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => saveField(field)}
            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingField(null)}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between group"
          onClick={() => setEditingField(field)}
        >
          <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
            {value ? options.find(o => o.value === value)?.label || value : 'Click to select'}
          </span>
          <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );

  const ToggleInput: React.FC<{ 
    label: string; 
    checked: boolean;
    onChange: (checked: boolean) => void;
  }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-10 items-center rounded-full ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectInputOld2: React.FC<{ 
    field: string; 
    label: string; 
    value: any; 
    options: Array<{ value: string; label: string }>;
  }> = ({ field, label, value, options }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => handleFieldEdit(field, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const TagInput: React.FC<{ field: string; label: string; value: string[] }> = ({ 
    field, 
    label, 
    value = [] 
  }) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = () => {
      if (inputValue.trim() && !value.includes(inputValue.trim())) {
        const newTags = [...value, inputValue.trim()];
        handleFieldEdit(field, newTags);
        setInputValue('');
      }
    };

    const removeTag = (tagToRemove: string) => {
      const newTags = value.filter(tag => tag !== tagToRemove);
      handleFieldEdit(field, newTags);
    };

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add tag..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addTag}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const SectionHeader: React.FC<{ section: Section }> = ({ section }) => {
    const isExpanded = expandedSections.has(section.id);
    const Icon = section.icon;

    return (
      <button
        onClick={() => section.collapsible && toggleSection(section.id)}
        className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4" />}
          <span className="font-medium">{section.title}</span>
        </div>
        {section.collapsible && (
          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
      </button>
    );
  };

  if (!part) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a part to view properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-auto">
      <div className="p-4 space-y-4">
        {sections.map(section => (
          <div key={section.id} className="space-y-2">
            <SectionHeader section={section} />
            
            {(!section.collapsible || expandedSections.has(section.id)) && (
              <div className="space-y-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                {section.id === 'general' && (
                  <>
                    <TextInput
                      field="name"
                      label="Name"
                      value={part.metadata.name}
                      placeholder="Enter part name"
                    />
                    <SelectInput
                      field="manufacturer"
                      label="Manufacturer"
                      value={part.metadata.manufacturer}
                      options={[
                        { value: 'Ford', label: 'Ford' },
                        { value: 'GM', label: 'General Motors' },
                        { value: 'Toyota', label: 'Toyota' },
                        { value: 'BMW', label: 'BMW' }
                      ]}
                    />
                    <TextInput
                      field="model"
                      label="Model"
                      value={part.metadata.model}
                      placeholder="Enter model number"
                    />
                    <TagInput
                      field="tags"
                      label="Tags"
                      value={part.metadata.tags}
                    />
                  </>
                )}

                {section.id === 'specifications' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Custom Fields</h4>
                      <button
                        onClick={addCustomField}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Field</span>
                      </button>
                    </div>
                    
                    {customFields.map((field, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => {
                            const newFields = [...customFields];
                            newFields[index].key = e.target.value;
                            setCustomFields(newFields);
                          }}
                          placeholder="Field name"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => {
                            const newFields = [...customFields];
                            newFields[index].value = e.target.value;
                            setCustomFields(newFields);
                          }}
                          placeholder="Value"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                        <button
                          onClick={() => removeCustomField(index)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'model' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      3D model settings and transformations
                    </div>
                    {/* Transform controls would go here */}
                  </div>
                )}

                {/* Physics Properties */}
                {section.id === 'physics' && (
                  <div className="space-y-4">
                    <TextInput
                      field="mass"
                      label="Mass (kg)"
                      value={part.simulation.physics.mass}
                      type="number"
                    />
                    <SelectInput
                      field="collisionShape"
                      label="Collision Shape"
                      value={part.simulation.physics.collisionShape}
                      options={[{ value: 'box', label: 'Box' }, { value: 'sphere', label: 'Sphere' }, { value: 'cylinder', label: 'Cylinder' }, { value: 'mesh', label: 'Mesh' }]}
                    />
                    <TextInput
                      field="density"
                      label="Density (kg/m³)"
                      value={part.simulation.physics.density}
                      type="number"
                    />
                    <TextInput
                      field="friction"
                      label="Friction Coefficient"
                      value={part.simulation.physics.friction}
                      type="number"
                    />
                    <TextInput
                      field="restitution"
                      label="Restitution (Bounciness)"
                      value={part.simulation.physics.restitution || 0.2}
                      type="number"
                    />
                  </div>
                )}
                
                {/* Simulation Controls */}
                {section.id === 'simulation' && (
                  <div className="space-y-4">
                    <ToggleInput
                      label="Physics Simulation"
                      checked={simulationSettings.physics.enabled}
                      onChange={(checked) => handleSimulationToggle('physics', checked)}
                    />
                    <ToggleInput
                      label="Electrical Simulation"
                      checked={simulationSettings.electrical.enabled}
                      onChange={(checked) => handleSimulationToggle('electrical', checked)}
                    />
                    <ToggleInput
                      label="Thermal Simulation"
                      checked={simulationSettings.thermal.enabled}
                      onChange={(checked) => handleSimulationToggle('thermal', checked)}
                    />
                  </div>
                )}

                {section.id === 'electrical' && (
                  <div className="space-y-4">
                    <TextInput
                      field="conductivity"
                      label="Conductivity (S/m)"
                      value={part.simulation.electrical.conductivity}
                      type="number"
                    />
                    <TextInput
                      field="resistivity"
                      label="Resistivity (Ω⋅m)"
                      value={part.simulation.electrical.resistivity}
                      type="number"
                    />
                  </div>
                )}

                {section.id === 'thermal' && (
                  <div className="space-y-4">
                    <TextInput
                      field="thermalConductivity"
                      label="Thermal Conductivity (W/mK)"
                      value={part.simulation.thermal.conductivity}
                      type="number"
                    />
                    <TextInput
                      field="heatCapacity"
                      label="Heat Capacity (J/kgK)"
                      value={part.simulation.thermal.capacity}
                      type="number"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyPanel;