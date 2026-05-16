import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Check, X, Ruler } from 'lucide-react';

interface PackagingConfig {
  id: number;
  name: string;
  length: number;
  width: number;
  height: number;
  box_cost: number;
  void_fill_cost: number;
  addon_cost: number;
  total_cost: number;
  is_active: boolean;
}

const PackagingConfigurator: React.FC = () => {
  const [configs, setConfigs] = useState<PackagingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsLotAdding] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<PackagingConfig>>({
    name: '',
    length: 0,
    width: 0,
    height: 0,
    box_cost: 0,
    void_fill_cost: 0,
    addon_cost: 0,
    is_active: true
  });

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/packaging/');
      if (response.ok) {
        const data = await response.json();
        setConfigs(data);
      }
    } catch (error) {
      console.error('Failed to fetch packaging configs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/packaging/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (response.ok) {
        await fetchConfigs();
        setIsLotAdding(false);
        setNewConfig({
          name: '',
          length: 0,
          width: 0,
          height: 0,
          box_cost: 0,
          void_fill_cost: 0,
          addon_cost: 0,
          is_active: true
        });
      }
    } catch (error) {
      console.error('Failed to create packaging config:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      const response = await fetch(`/api/packaging/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setConfigs(configs.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete packaging config:', error);
    }
  };

  if (loading) return <div>Loading configurations...</div>;

  return (
    <div className="packaging-configurator">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Packaging & Supplies</h2>
          <p className="text-gray-400 text-sm">Define standard box sizes and costs for automated COGS calculation.</p>
        </div>
        <button 
          className="action-btn primary"
          onClick={() => setIsLotAdding(true)}
          disabled={isAdding}
        >
          <Plus size={18} /> Add Configuration
        </button>
      </div>

      <div className="grid gap-4">
        {isAdding && (
          <div className="glass-panel p-4 border-2 border-blue-500/30 animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Config Name</label>
                <input 
                  type="text" 
                  className="frosted-input w-full"
                  placeholder="e.g. Standard Shoe Box"
                  value={newConfig.name}
                  onChange={e => setNewConfig({...newConfig, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Length (in)</label>
                <input 
                  type="number" 
                  className="frosted-input w-full"
                  value={newConfig.length}
                  onChange={e => setNewConfig({...newConfig, length: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Width (in)</label>
                <input 
                  type="number" 
                  className="frosted-input w-full"
                  value={newConfig.width}
                  onChange={e => setNewConfig({...newConfig, width: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Height (in)</label>
                <input 
                  type="number" 
                  className="frosted-input w-full"
                  value={newConfig.height}
                  onChange={e => setNewConfig({...newConfig, height: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Box Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="frosted-input w-full"
                  value={newConfig.box_cost}
                  onChange={e => setNewConfig({...newConfig, box_cost: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Void Fill Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="frosted-input w-full"
                  value={newConfig.void_fill_cost}
                  onChange={e => setNewConfig({...newConfig, void_fill_cost: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Add-on Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="frosted-input w-full"
                  value={newConfig.addon_cost}
                  onChange={e => setNewConfig({...newConfig, addon_cost: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="action-btn outline small" onClick={() => setIsLotAdding(false)}>
                <X size={16} /> Cancel
              </button>
              <button className="action-btn primary small" onClick={handleCreate}>
                <Check size={16} /> Save Config
              </button>
            </div>
          </div>
        )}

        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Name / ID</th>
                <th className="p-4">Dimensions (L x W x H)</th>
                <th className="p-4">Unit Costs</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {configs.map(config => (
                <tr key={config.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="text-white font-medium">{config.name}</div>
                        <div className="text-gray-500 text-xs mono">ID: CFG-{config.id.toString().padStart(3, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Ruler size={14} className="text-gray-500" />
                      <span className="mono">{config.length}" × {config.width}" × {config.height}"</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between max-w-[120px]">
                        <span className="text-gray-500">Box:</span>
                        <span className="text-gray-300">${config.box_cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between max-w-[120px]">
                        <span className="text-gray-500">Void:</span>
                        <span className="text-gray-300">${config.void_fill_cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between max-w-[120px]">
                        <span className="text-gray-500">Addon:</span>
                        <span className="text-gray-300">${config.addon_cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-bold text-lg">${config.total_cost.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <button 
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {configs.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No packaging configurations defined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackagingConfigurator;
