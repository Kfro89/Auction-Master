import React, { useState } from 'react';
import { Camera, ShieldAlert, Search } from 'lucide-react';

interface InventoryItem {
    id: number;
    anti_tamper_tag?: string;
    title?: string;
}

const RmaView: React.FC = () => {
    const [confirmed, setConfirmed] = useState(false);
    const [itemIdInput, setItemIdInput] = useState('');
    const [item, setItem] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchItem = async () => {
        if (!itemIdInput) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/inventory/${itemIdInput}`);
            if (response.ok) {
                const foundItem: InventoryItem = await response.json();
                setItem(foundItem);
            } else {
                setError('Item not found');
                setItem(null);
            }
        } catch (err) {
            setError('Error fetching item');
            setItem(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-50/50 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-6 gap-6">
            <div className="flex items-center gap-4 bg-white/80 p-4 rounded-xl border border-slate-200/50 shadow-sm">
                <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm font-medium text-slate-700">Enter Item ID:</label>
                    <input 
                        type="text" 
                        value={itemIdInput}
                        onChange={(e) => setItemIdInput(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white shadow-sm flex-1 max-w-xs"
                        placeholder="e.g. 123"
                    />
                    <button 
                        onClick={handleFetchItem}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 font-medium"
                    >
                        {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span> : <Search size={16} />}
                        Fetch Item
                    </button>
                </div>
                {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
                {item && <span className="text-emerald-600 text-sm font-medium flex items-center gap-2">Item Loaded: {item.title || `ID ${item.id}`}</span>}
            </div>

            <div className="flex w-full gap-6 flex-1">
                <div className="flex-1 p-8 bg-white/80 rounded-xl border border-slate-200/50 shadow-sm flex flex-col">
                    <h2 className="text-slate-900 text-2xl font-semibold mb-6 tracking-tight">Original Staging Data</h2>
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-col flex-1">
                        <p className="text-slate-600 mb-6 font-medium text-lg flex flex-col gap-1">
                            <span className="text-slate-400 uppercase text-xs tracking-wider">Anti-Tamper Tag:</span>
                            <span className="text-slate-800 text-xl font-mono bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 w-fit">
                                {item ? (item.anti_tamper_tag || 'No tag assigned') : '---'}
                            </span>
                        </p>
                        <div className="w-full flex-1 min-h-[250px] bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                            <Camera size={48} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-8 bg-white/80 rounded-xl border border-slate-200/50 shadow-sm flex flex-col">
                    <h2 className="text-slate-900 text-2xl font-semibold mb-6 tracking-tight">Return Verification</h2>
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-col flex-1">
                        <button className="w-full mb-8 py-4 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-xl border-none font-medium cursor-pointer flex items-center justify-center gap-3 shadow-sm shadow-indigo-200">
                            <Camera size={20} strokeWidth={2} /> Activate Scanner
                        </button>
                        
                        <div className="flex-1" />
                        
                        <label className="flex items-start gap-4 cursor-pointer text-slate-700 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={confirmed} 
                                onChange={(e) => setConfirmed(e.target.checked)} 
                                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                            /> 
                            <span className="leading-relaxed">I confirm the anti-tamper tag is intact and matches original photos.</span>
                        </label>
                        
                        <button 
                            disabled={!confirmed || !item}
                            className={`mt-6 flex items-center justify-center gap-3 w-full py-4 text-white rounded-xl border-none font-semibold transition-all duration-200 shadow-sm ${
                                confirmed && item
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 cursor-pointer' 
                                : 'bg-slate-200 cursor-not-allowed opacity-70 text-slate-500'
                            }`}>
                            <ShieldAlert size={20} strokeWidth={2} /> Issue Refund
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RmaView;
