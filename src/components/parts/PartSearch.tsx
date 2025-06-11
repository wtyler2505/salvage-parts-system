import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, DollarSign, Mic, QrCode, Download, Upload } from 'lucide-react';
import { SearchFilters } from '../../types/salvagePart';
import { useSalvagePartStore } from '../../stores/useSalvagePartStore';

interface PartSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
}

const PartSearch: React.FC<PartSearchProps> = ({ onFiltersChange }) => {
  const { parts, searchParts, exportParts, importParts } = useSalvagePartStore();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [parametricQuery, setParametricQuery] = useState('');

  // Voice search setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        updateFilters({ text: transcript });
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
    searchParts(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setParametricQuery('');
    onFiltersChange({});
    searchParts({});
  };

  const startVoiceSearch = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const parseParametricQuery = (query: string) => {
    // Parse queries like "voltage > 12 AND current < 5"
    const conditions: Record<string, any> = {};
    
    const patterns = [
      /(\w+(?:\.\w+)*)\s*(>|<|>=|<=|=|!=)\s*([^\s]+)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(query)) !== null) {
        const [, field, operator, value] = match;
        conditions[field] = {
          operator,
          value: isNaN(Number(value)) ? value : Number(value)
        };
      }
    });

    return conditions;
  };

  const handleParametricSearch = () => {
    if (parametricQuery.trim()) {
      const specifications = parseParametricQuery(parametricQuery);
      updateFilters({ specifications });
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'xlsx') => {
    try {
      const blob = await exportParts(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salvage-parts.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = file.name.endsWith('.csv') ? 
            parseCSV(content) : 
            JSON.parse(content);
          
          const result = await importParts(data, file.name.endsWith('.csv') ? 'csv' : 'json');
          alert(`Import completed: ${result.imported} parts imported, ${result.failed} failed`);
        } catch (error) {
          console.error('Import failed:', error);
          alert('Import failed. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  // Get unique values for filter dropdowns
  const uniqueCategories = Array.from(new Set(parts.flatMap(p => p.metadata.categories)));
  const uniqueManufacturers = Array.from(new Set(parts.map(p => p.metadata.manufacturer).filter(Boolean)));
  const uniqueConditions = ['new', 'used', 'salvaged', 'broken'];

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Main Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search parts by name, manufacturer, tags..."
            value={filters.text || ''}
            onChange={(e) => updateFilters({ text: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {recognition && (
            <button
              onClick={startVoiceSearch}
              disabled={isListening}
              className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Voice Search"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
              showAdvanced ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Advanced Filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 hidden group-hover:block">
              <button
                onClick={() => handleExport('json')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export Excel
              </button>
            </div>
          </div>

          <label className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer">
            <Upload className="w-5 h-5" />
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <QrCode className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <select
                multiple
                value={filters.categories || []}
                onChange={(e) => updateFilters({ 
                  categories: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                size={4}
              >
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Manufacturers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturers</label>
              <select
                multiple
                value={filters.manufacturer || []}
                onChange={(e) => updateFilters({ 
                  manufacturer: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                size={4}
              >
                {uniqueManufacturers.map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <div className="space-y-2">
                {uniqueConditions.map(condition => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.condition || []).includes(condition)}
                      onChange={(e) => {
                        const currentConditions = filters.condition || [];
                        const newConditions = e.target.checked
                          ? [...currentConditions, condition]
                          : currentConditions.filter(c => c !== condition);
                        updateFilters({ condition: newConditions });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value Range ($)</label>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min value"
                  value={filters.valueRange?.min || ''}
                  onChange={(e) => updateFilters({
                    valueRange: {
                      ...filters.valueRange,
                      min: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max value"
                  value={filters.valueRange?.max || ''}
                  onChange={(e) => updateFilters({
                    valueRange: {
                      ...filters.valueRange,
                      max: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date Added - From</span>
              </label>
              <input
                type="date"
                value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilters({
                  dateRange: {
                    ...filters.dateRange,
                    start: new Date(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="date"
                value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilters({
                  dateRange: {
                    ...filters.dateRange,
                    end: new Date(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Parametric Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parametric Search
              <span className="text-xs text-gray-500 ml-2">
                {'(e.g., "voltage > 12 AND current < 5")'}
              </span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter parametric query..."
                value={parametricQuery}
                onChange={(e) => setParametricQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleParametricSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {filters.text && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Text: {filters.text}
                  <button
                    onClick={() => updateFilters({ text: undefined })}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.categories?.map(category => (
                <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  {category}
                  <button
                    onClick={() => updateFilters({ 
                      categories: filters.categories?.filter(c => c !== category) 
                    })}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.condition?.map(condition => (
                <span key={condition} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  {condition}
                  <button
                    onClick={() => updateFilters({ 
                      condition: filters.condition?.filter(c => c !== condition) 
                    })}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartSearch;