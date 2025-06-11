import React, { useEffect } from 'react';
import { X, TrendingUp, Package, DollarSign, PieChart } from 'lucide-react';
import { useSalvagePartStore } from '../../stores/useSalvagePartStore';

interface PartsStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
}

const PartsStatistics: React.FC<PartsStatisticsProps> = ({ isOpen, onClose }) => {
  const { statistics, loadStatistics } = useSalvagePartStore();

  useEffect(() => {
    if (isOpen && !statistics) {
      loadStatistics();
    }
  }, [isOpen, statistics, loadStatistics]);

  if (!isOpen) return null;

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ChartBar: React.FC<{ 
    label: string; 
    value: number; 
    maxValue: number; 
    color: string;
  }> = ({ label, value, maxValue, color }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-3">
        <div className="w-20 text-sm text-gray-600 truncate">{label}</div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="w-12 text-sm text-gray-900 text-right">{value}</div>
      </div>
    );
  };

  if (!statistics) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const maxCategoryValue = Math.max(...Object.values(statistics.partsByCategory));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Parts Statistics</h2>
            <p className="text-gray-600">Overview of your salvage parts inventory</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Parts"
              value={statistics.totalParts.toLocaleString()}
              icon={<Package className="w-6 h-6 text-white" />}
              color="bg-blue-500"
            />
            
            <StatCard
              title="Total Value"
              value={`$${statistics.totalValue.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6 text-white" />}
              color="bg-green-500"
              subtitle="Estimated inventory value"
            />
            
            <StatCard
              title="Categories"
              value={Object.keys(statistics.partsByCategory).length}
              icon={<PieChart className="w-6 h-6 text-white" />}
              color="bg-purple-500"
            />
            
            <StatCard
              title="Avg. Value"
              value={`$${Math.round(statistics.totalValue / statistics.totalParts).toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              color="bg-orange-500"
              subtitle="Per part"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Parts by Condition */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Parts by Condition
              </h3>
              
              <div className="space-y-4">
                {Object.entries(statistics.partsByCondition).map(([condition, count]) => {
                  const colors = {
                    new: 'bg-green-500',
                    used: 'bg-blue-500',
                    salvaged: 'bg-yellow-500',
                    broken: 'bg-red-500'
                  };
                  
                  return (
                    <ChartBar
                      key={condition}
                      label={condition.charAt(0).toUpperCase() + condition.slice(1)}
                      value={count}
                      maxValue={statistics.totalParts}
                      color={colors[condition as keyof typeof colors]}
                    />
                  );
                })}
              </div>
            </div>

            {/* Parts by Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Parts by Category
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-auto">
                {Object.entries(statistics.partsByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count], index) => {
                    const colors = [
                      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
                      'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500'
                    ];
                    
                    return (
                      <ChartBar
                        key={category}
                        label={category}
                        value={count}
                        maxValue={maxCategoryValue}
                        color={colors[index % colors.length]}
                      />
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Condition Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(statistics.partsByCondition).map(([condition, count]) => {
                    const percentage = ((count / statistics.totalParts) * 100).toFixed(1);
                    return (
                      <div key={condition} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{condition}</span>
                        <span className="text-gray-900">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Value Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">High Value (&gt;$1000)</span>
                    <span className="text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Medium Value ($100-$1000)</span>
                    <span className="text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Low Value (&lt;$100)</span>
                    <span className="text-gray-900">-</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Top Categories</h4>
                <div className="space-y-2">
                  {Object.entries(statistics.partsByCategory)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate">{category}</span>
                        <span className="text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartsStatistics;