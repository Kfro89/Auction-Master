import React, { useState } from 'react';
import { Camera, ShieldAlert } from 'lucide-react';

const RmaView: React.FC = () => {
    const [confirmed, setConfirmed] = useState(false);

    return (
        <div className="flex h-full w-full bg-slate-50/50 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-6 gap-6">
            <div className="flex-1 p-8 bg-white/80 rounded-xl border border-slate-200/50 shadow-sm flex flex-col">
                <h2 className="text-slate-900 text-2xl font-semibold mb-6 tracking-tight">Original Staging Data</h2>
                <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-col flex-1">
                    <p className="text-slate-600 mb-6 font-medium text-lg">
                        <span className="text-slate-400 mr-2 uppercase text-sm tracking-wider">Anti-Tamper Tag:</span>
                        XYZ-123
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
                        disabled={!confirmed}
                        className={`mt-6 flex items-center justify-center gap-3 w-full py-4 text-white rounded-xl border-none font-semibold transition-all duration-200 shadow-sm ${
                            confirmed 
                            ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 cursor-pointer' 
                            : 'bg-slate-200 cursor-not-allowed opacity-70 text-slate-500'
                        }`}>
                        <ShieldAlert size={20} strokeWidth={2} /> Issue Refund
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RmaView;
