import re

with open('frontend/src/views/WorkQueueView.tsx', 'r') as f:
    wq = f.read()

replacements = {
    'className="stage-navigator glass mb-6"': 'className="stage-navigator mb-6"',
    'className="item-list glass-panel"': 'className="item-list"',
    'className="staging-panel glass-panel"': 'className="staging-panel"',
    'className="photo-zone glass mb-6"': 'className="photo-zone mb-6"',
    'className="text-gray-400 text-sm"': 'className="wq-label"',
    'className="text-gray-400"': 'className="text-gray-500"',
    'className="glass-panel p-4 bg-emerald-500/5 border-emerald-500/20"': 'className="saas-card-block"',
    'className="glass-panel p-4 bg-blue-500/5 border-blue-500/20"': 'className="saas-card-block"',
    'className="glass-panel p-4 bg-purple-500/5 border-purple-500/20"': 'className="saas-card-block"',
    'className="glass-panel p-4 bg-orange-500/5 border-orange-500/20"': 'className="saas-card-block"',
    'className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2"': 'className="wq-header-title"',
    'className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2"': 'className="wq-header-title"',
    'className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2"': 'className="wq-header-title"',
    'className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2"': 'className="wq-header-title"',
    '<Receipt size={16} /> Acquisition Logic': 'Acquisition Logic',
    'className="text-xs text-gray-500 font-bold uppercase mb-2 block"': 'className="wq-label"',
    'className="text-[10px] text-gray-500 font-bold uppercase mb-2 block"': 'className="wq-label-small"',
    'className="grid grid-cols-2 gap-4 mb-4"': 'className="wq-grid-2"',
    'className="grid grid-cols-2 gap-2"': 'className="wq-grid-2"',
    'className="flex gap-2 mt-1"': 'className="wq-button-group"',
    'className="flex gap-2"': 'className="wq-button-group"'
}

for k, v in replacements.items():
    wq = wq.replace(k, v)

# segmented buttons
wq = re.sub(r'className={`flex-1 py-2 rounded text-xs border \${selectedItem.status === \'PAID\' \? \'bg-emerald-500/20 border-emerald-500 text-emerald-400\' : \'bg-white/5 border-white/10 text-gray-400\'}`}',
            r'className={`wq-segment-btn ${selectedItem.status === \'PAID\' ? \'active bg-emerald-600\' : \'\'}`}', wq)
wq = re.sub(r'className={`flex-1 py-2 rounded text-xs border \${\(\!selectedItem.shipping_method \|\| selectedItem.shipping_method === \'vendor\'\) \? \'bg-blue-500/20 border-blue-500 text-blue-400\' : \'bg-white/5 border-white/10 text-gray-400\'}`}',
            r'className={`wq-segment-btn ${!selectedItem.shipping_method || selectedItem.shipping_method === \'vendor\' ? \'active\' : \'\'}`}', wq)
wq = re.sub(r'className={`flex-1 py-2 rounded text-xs border \${\(selectedItem.shipping_method === \'local\'\) \? \'bg-blue-500/20 border-blue-500 text-blue-400\' : \'bg-white/5 border-white/10 text-gray-400\'}`}',
            r'className={`wq-segment-btn ${selectedItem.shipping_method === \'local\' ? \'active\' : \'\'}`}', wq)

with open('frontend/src/views/WorkQueueView.tsx', 'w') as f:
    f.write(wq)

print("done")
