import re

with open('frontend/src/views/StoreView.css', 'a') as f:
    f.write('''
/* SaaS Semantic Classes for Ledger & Store */
.saas-card { background: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
.saas-card-emerald { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 1.5rem; }
.saas-card-rose { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 1.5rem; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.chart-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
@media(min-width: 1024px) { .chart-grid { grid-template-columns: 1fr 1fr; } }
.chart-card { height: 320px; display: flex; flex-direction: column; }
.chart-container { flex: 1; min-height: 0; position: relative; }

.flex-between { display: flex; justify-content: space-between; align-items: center; }
.flex-center { display: flex; justify-content: center; align-items: center; }
.flex-col { display: flex; flex-direction: column; }

.text-xs-caps { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #6B7280; }
.text-xs-caps-emerald { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #059669; }
.text-3xl-bold { font-size: 1.875rem; font-weight: 700; color: #111827; }
.text-3xl-bold-rose { font-size: 1.875rem; font-weight: 700; color: #e11d48; margin-top: 0.25rem; }
.text-3xl-bold-emerald { font-size: 1.875rem; font-weight: 700; color: #059669; margin-top: 0.25rem; }
.text-lg-bold { font-size: 1.125rem; font-weight: 700; color: #111827; }
.text-sm-bold { font-size: 0.875rem; font-weight: 700; color: #111827; }
.text-sm-semibold { font-size: 0.875rem; font-weight: 600; color: #374151; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.pt-4 { padding-top: 1rem; }
.pb-2 { padding-bottom: 0.5rem; }
.border-b { border-bottom: 1px solid #E5E7EB; }
.border-t { border-top: 1px solid #E5E7EB; }
.gap-2 { display: flex; gap: 0.5rem; }
.gap-3 { display: flex; gap: 0.75rem; }
.gap-4 { display: flex; gap: 1rem; }
.w-full { width: 100%; }
.bg-gray-50 { background-color: #F9FAFB; }
.bg-emerald-50 { background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.text-right { text-align: right; }
.text-emerald-600 { color: #059669; }
.text-rose-600 { color: #e11d48; }
.text-rose-400 { color: #fb7185; }
.text-gray-500 { color: #6B7280; }
.text-gray-600 { color: #4B5563; }
.text-gray-700 { color: #374151; }
.text-gray-900 { color: #111827; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.uppercase { text-transform: uppercase; }
''')

with open('frontend/src/views/LedgerView.tsx', 'r') as f:
    lv = f.read()

lv = re.sub(r'<div className="bg-red-500.*?</div>', '', lv, flags=re.DOTALL)

replacements = {
    'className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"': 'className="kpi-grid"',
    'className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"': 'className="kpi-grid"',
    'className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 bg-rose-50 border-rose-200 flex flex-col justify-center"': 'className="saas-card-rose flex-col justify-center"',
    'className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 col-span-2 flex gap-4 h-64"': 'className="saas-card chart-card flex-col" style={{height: "250px", gridColumn: "span 2"}}',
    'className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col justify-center"': 'className="saas-card flex-col justify-center"',
    'className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 bg-emerald-50 border-emerald-200 flex flex-col justify-center relative overflow-hidden"': 'className="saas-card-emerald flex-col justify-center relative overflow-hidden"',
    'className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"': 'className="chart-grid"',
    'className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col h-80"': 'className="saas-card chart-card"',
    'className="flex-1 min-h-0"': 'className="chart-container"',
    'className="flex-1 min-h-0 pt-4"': 'className="chart-container pt-4"',
    'className="text-[10px] uppercase font-bold text-gray-500"': 'className="text-xs-caps"',
    'className="text-[10px] uppercase font-bold text-emerald-600 relative z-10"': 'className="text-xs-caps-emerald relative z-10"',
    'className="text-3xl font-bold text-gray-900 mt-1"': 'className="text-3xl-bold"',
    'className="text-3xl font-bold text-rose-500 mt-1"': 'className="text-3xl-bold-rose"',
    'className="text-4xl font-bold text-emerald-600 mt-1 relative z-10"': 'className="text-3xl-bold-emerald relative z-10"',
    'className="text-[10px] font-bold text-emerald-600/70 mt-1 relative z-10"': 'className="text-xs-caps-emerald mt-2 relative z-10"',
    'className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm"': 'className="saas-card p-3"',
    'className="font-bold text-gray-700 text-sm mb-1"': 'className="text-sm-bold mb-2"',
    'className="text-blue-600 font-semibold"': 'className="text-sm-semibold text-emerald-600"',
    'className="text-sm font-bold text-gray-900 mb-4 tracking-tight"': 'className="text-lg-bold mb-4"',
    'className="bg-white border border-gray-200 rounded-lg shadow-sm p-8"': 'className="saas-card p-6"',
    'className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4"': 'className="text-lg-bold mb-6 border-b pb-2"',
    'className="space-y-4 max-w-3xl"': 'className="flex-col gap-4"',
    'className="flex justify-between items-center text-lg p-3 bg-gray-50 rounded-lg"': 'className="flex-between p-3 bg-gray-50 rounded-lg"',
    'className="pl-6 space-y-3 border-l-2 border-gray-200 ml-3 py-2"': 'className="flex-col gap-3 p-3"',
    'className="flex justify-between items-center text-sm text-gray-600"': 'className="flex-between text-gray-600 text-sm"',
    'className="flex justify-between items-center text-md p-3"': 'className="flex-between p-3 text-sm-bold"',
    'className="text-gray-500 font-bold uppercase tracking-wide text-xs"': 'className="text-xs-caps"',
    'className="flex justify-between items-center text-md p-3 bg-rose-50/50 rounded-lg border border-rose-100"': 'className="flex-between p-3 saas-card-rose mb-2"',
    'className="pl-6 space-y-3 border-l-2 border-gray-200 ml-3 py-4"': 'className="flex-col gap-3 p-3"',
    'className="flex justify-between items-center text-xs text-gray-500"': 'className="flex-between text-xs text-gray-500"',
    'className="flex justify-between items-center text-2xl pt-6 border-t-2 border-gray-200"': 'className="flex-between pt-4 border-t"',
    'className="text-gray-900 font-black"': 'className="text-3xl-bold"',
    'className="text-emerald-600 font-black bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200"': 'className="text-3xl-bold-emerald bg-emerald-50 p-2 rounded-lg border-emerald-200"',
    'className="w-full text-left border-collapse"': 'className="w-full text-left"',
    'className="divide-y divide-gray-200"': 'className=""',
    'className="text-[10px] uppercase font-bold px-2 py-1 bg-gray-50 rounded border border-gray-200 text-gray-500"': 'className="text-xs-caps p-2 bg-gray-50 rounded-md"',
    'className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8 border border-blue-200 bg-blue-50 animate-in zoom-in-95"': 'className="saas-card mb-6"',
    'className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"': 'className="kpi-grid mb-6"',
    'className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"': 'className="chart-grid mb-6"',
    'className="flex justify-end gap-3 pt-6 border-t border-gray-200"': 'className="flex-between pt-4 border-t"',
    'className="text-xs text-gray-500 font-bold uppercase mb-2 block"': 'className="text-xs-caps mb-2"'
}

for k, v in replacements.items():
    lv = lv.replace(k, v)

with open('frontend/src/views/LedgerView.tsx', 'w') as f:
    f.write(lv)

with open('frontend/src/views/WorkQueueView.css', 'a') as f:
    f.write('''
/* Semantic classes for Work Queue */
.saas-card-block {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  margin-bottom: 1.5rem;
}
.wq-header-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0.75rem;
}
.wq-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #6B7280;
  margin-bottom: 0.5rem;
  display: block;
}
.wq-label-small {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #6B7280;
  margin-bottom: 0.5rem;
  display: block;
}
.wq-button-group {
  display: flex;
  gap: 0.75rem;
}
.wq-content-spacing {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.wq-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.wq-grid-2-pt {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding-top: 0.5rem;
}
.wq-grid-4-mb {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.wq-segmented-control {
  display: flex;
  padding: 0.25rem;
  background: #F3F4F6;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}
.wq-segment-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  background: transparent;
  color: #6B7280;
  font-weight: 500;
  cursor: pointer;
}
.wq-segment-btn:hover {
  color: #374151;
  background: rgba(0,0,0,0.03);
}
.wq-segment-btn.active {
  background: #ffffff;
  color: #111827;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.action-btn.bg-emerald-600 {
  background-color: #059669;
  border-color: #059669;
  color: white;
}
.action-btn.bg-emerald-600:hover {
  background-color: #047857;
}
''')

with open('frontend/src/views/WorkQueueView.tsx', 'r') as f:
    wq = f.read()

wq_replacements = {
    'className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"': 'className="saas-card-block"',
    'className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"': 'className="saas-card-block"',
    'className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"': 'className="wq-header-title"',
    'className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2"': 'className="wq-header-title"',
    'className="text-xs text-gray-500 font-bold uppercase mb-3 block"': 'className="wq-label"',
    'className="text-xs text-gray-500 font-bold uppercase mb-2 block"': 'className="wq-label"',
    'className="text-[10px] text-gray-500 font-bold uppercase mb-2 block"': 'className="wq-label-small"',
    'className="flex gap-3"': 'className="wq-button-group"',
    'className="flex gap-2"': 'className="wq-button-group"',
    'className="space-y-6"': 'className="wq-content-spacing"',
    'className="space-y-4"': 'className="wq-content-spacing"',
    'className="grid grid-cols-2 gap-4"': 'className="wq-grid-2"',
    'className="grid grid-cols-2 gap-3 pt-2"': 'className="wq-grid-2-pt"',
    'className="grid grid-cols-4 gap-3 mb-5"': 'className="wq-grid-4-mb"',
    'className="flex p-1 bg-gray-100 rounded-lg border border-gray-200/60 shadow-inner"': 'className="wq-segmented-control"',
}

for k, v in wq_replacements.items():
    wq = wq.replace(k, v)

wq = re.sub(r'className={`flex-1 justify-center \${[^}]+ \? \'action-btn primary\' : \'action-btn outline\'}`}', 
            r'className={`wq-segment-btn ${!selectedItem.shipping_method || selectedItem.shipping_method === \'vendor\' ? \'active\' : \'\'}`}', wq, count=1)
wq = re.sub(r'className={`flex-1 justify-center \${[^}]+ \? \'action-btn primary\' : \'action-btn outline\'}`}', 
            r'className={`wq-segment-btn ${selectedItem.shipping_method === \'local\' ? \'active\' : \'\'}`}', wq, count=1)

with open('frontend/src/views/WorkQueueView.tsx', 'w') as f:
    f.write(wq)

with open('frontend/src/components/SellerDashboard.tsx', 'r') as f:
    sd = f.read()

sd_replacements = {
    'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"': 'className="kpi-grid"',
    'className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"': 'className="chart-grid"',
    'className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between"': 'className="saas-card flex-between"',
    'className="text-[10px] uppercase font-bold text-gray-500 tracking-wider"': 'className="text-xs-caps"',
    'className="text-2xl font-bold text-gray-900 mt-1"': 'className="text-3xl-bold"',
    'className="p-3 bg-rose-50 rounded-xl text-rose-500 border border-rose-100"': 'className="p-3 saas-card-rose text-rose-600 flex-center"',
    'className="p-3 bg-emerald-50 rounded-xl text-emerald-500 border border-emerald-100"': 'className="p-3 saas-card-emerald text-emerald-600 flex-center"',
    'className="text-blue-500"': 'style={{color: "#3b82f6"}}',
    'className="text-emerald-500"': 'style={{color: "#10b981"}}',
    'className="text-amber-500"': 'style={{color: "#f59e0b"}}',
    'className="text-purple-500"': 'style={{color: "#8b5cf6"}}'
}

for k, v in sd_replacements.items():
    sd = sd.replace(k, v)

with open('frontend/src/components/SellerDashboard.tsx', 'w') as f:
    f.write(sd)

print("Replacement complete.")
