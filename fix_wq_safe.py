import re

with open('frontend/src/views/WorkQueueView.css', 'r') as f:
    css = f.read()

css = css.replace('background: rgba(255, 255, 255, 0.05);', 'background: #ffffff;')
css = css.replace('background: rgba(255, 255, 255, 0.03);', 'background: #ffffff;')
css = css.replace('background: rgba(255, 255, 255, 0.02);', 'background: #ffffff;')
css = css.replace('border: 1px solid rgba(255, 255, 255, 0.1);', 'border: 1px solid #E5E7EB;')
css = css.replace('border: 1px solid rgba(255, 255, 255, 0.05);', 'border: 1px solid #E5E7EB;')
css = css.replace('border: 1px dashed rgba(255, 255, 255, 0.1);', 'border: 1px dashed #D1D5DB;')
css = css.replace('color: rgba(255, 255, 255, 0.5);', 'color: #6B7280;')
css = css.replace('color: rgba(255, 255, 255, 0.4);', 'color: #6B7280;')
css = css.replace('color: rgba(255, 255, 255, 0.6);', 'color: #4B5563;')
css = css.replace('color: rgba(255, 255, 255, 0.3);', 'color: #6B7280;')
css = css.replace('color: white;', 'color: #111827;')
css = css.replace('background: rgba(0, 0, 0, 0.2);', 'background: #F3F4F6;')
css = css.replace('background: rgba(255, 255, 255, 0.08);', 'background: #F9FAFB;')
css = css.replace('color: rgba(255, 255, 255, 0.8);', 'color: #374151;')
css = css.replace('border-color: rgba(255, 255, 255, 0.1);', 'border-color: #E5E7EB;')
css = css.replace('border-color: rgba(255, 255, 255, 0.2);', 'border-color: #D1D5DB;')
css = css.replace('background: rgba(255, 255, 255, 0.04);', 'background: #F3F4F6;')
css = css.replace('background: rgba(255, 255, 255, 0.1);', 'background: #ffffff;')

if 'background-color: #FAFAFA;' not in css:
    css = css.replace('.work-queue-view {\n  display: flex;', '.work-queue-view {\n  display: flex;\n  background-color: #FAFAFA;\n  color: #111827;')

css = css.replace('box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);', '/* box-shadow removed */')
css = css.replace('.stage-btn.active {\n  background: var(--primary-color);\n  color: #111827;\n  /* box-shadow removed */\n}', '.stage-btn.active {\n  background: rgba(37, 99, 235, 0.1);\n  color: var(--primary-color, #2563eb);\n}')
css = css.replace('.stage-btn.active .stage-count {\n  background: var(--primary-color, #2563eb);\n  color: #111827;\n}', '.stage-btn.active .stage-count {\n  background: var(--primary-color, #2563eb);\n  color: white;\n}')
css = css.replace('.action-btn.primary {\n  background: var(--primary-color);\n  color: #111827;\n}', '.action-btn.primary {\n  background: var(--primary-color, #2563eb);\n  color: white;\n}')
css = css.replace('border-radius: 20px;', 'border-radius: 8px;')
css = css.replace('border-radius: 24px;', 'border-radius: 8px;')
css = css.replace('border-radius: 12px;', 'border-radius: 6px;')
css = css.replace('border-radius: 16px;', 'border-radius: 8px;')

with open('frontend/src/views/WorkQueueView.css', 'w') as f:
    f.write(css)

with open('frontend/src/views/WorkQueueView.tsx', 'r') as f:
    tsx = f.read()

tsx = tsx.replace('glass-panel p-4 bg-emerald-500/5 border-emerald-500/20', 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm')
tsx = tsx.replace('<h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">', '<h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">')
tsx = tsx.replace('<Receipt size={16} /> Acquisition Logic', 'Acquisition Logic')

tsx = tsx.replace('glass-panel p-4 bg-blue-500/5 border-blue-500/20', 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm')
tsx = tsx.replace('<h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">', '<h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">')
tsx = tsx.replace('<Truck size={16} />', '<Truck size={16} className="text-blue-600" />')

tsx = tsx.replace('glass-panel p-4 bg-purple-500/5 border-purple-500/20', 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm')
tsx = tsx.replace('<h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">', '<h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">')
tsx = tsx.replace('<MapPin size={16} />', '<MapPin size={16} className="text-purple-600" />')

tsx = tsx.replace('glass-panel p-4 bg-orange-500/5 border-orange-500/20', 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm')
tsx = tsx.replace('<h3 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">', '<h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">')
tsx = tsx.replace('<Boxes size={16} />', '<Boxes size={16} className="text-orange-500" />')

tsx = tsx.replace('stage-navigator glass mb-6', 'stage-navigator mb-6')
tsx = tsx.replace('item-list glass-panel', 'item-list')
tsx = tsx.replace('staging-panel glass-panel', 'staging-panel')
tsx = tsx.replace('photo-zone glass mb-6', 'photo-zone mb-6')
tsx = tsx.replace('text-gray-400 text-sm', 'text-gray-700 text-sm font-semibold')
tsx = tsx.replace('text-gray-400', 'text-gray-500')

# Payment status
pay_str = """                        <div className="field-group">
                          <label className="text-xs text-gray-500">Payment Status</label>
                          <div className="flex gap-2 mt-1">
                            <button 
                              className={`flex-1 py-2 rounded text-xs border ${selectedItem.status === 'PAID' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                              onClick={() => handleUpdateItem(selectedItem.id, { status: 'PAID' })}
                            >
                              Paid & Confirmed
                            </button>
                          </div>
                        </div>"""
pay_new = """                        <div className="field-group">
                          <label className="text-xs text-gray-500 font-bold uppercase mb-3 block">Payment Status</label>
                          <div className="flex gap-3">
                            <button 
                              className={`flex-1 justify-center py-2.5 ${selectedItem.status === 'PAID' ? 'action-btn primary bg-emerald-600 border-emerald-600 hover:bg-emerald-700' : 'action-btn outline'}`}
                              onClick={() => handleUpdateItem(selectedItem.id, { status: 'PAID' })}
                            >
                              {selectedItem.status === 'PAID' && <Check size={18} className="mr-1" />}
                              Paid & Confirmed
                            </button>
                          </div>
                        </div>"""
tsx = tsx.replace(pay_str, pay_new)

# Shipping Method
ship_str = """                        <div className="flex gap-2">
                          <button 
                            className={`flex-1 py-2 rounded text-xs border ${(!selectedItem.shipping_method || selectedItem.shipping_method === 'vendor') ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                            onClick={() => handleUpdateItem(selectedItem.id, { shipping_method: 'vendor' })}
                          >
                            Awaiting Vendor Shipment
                          </button>
                          <button 
                            className={`flex-1 py-2 rounded text-xs border ${(selectedItem.shipping_method === 'local') ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                            onClick={() => handleUpdateItem(selectedItem.id, { shipping_method: 'local' })}
                          >
                            Awaiting Local Pickup
                          </button>
                        </div>"""
ship_new = """                        <div className="flex gap-2">
                          <button 
                            className={`flex-1 justify-center ${(!selectedItem.shipping_method || selectedItem.shipping_method === 'vendor') ? 'action-btn primary' : 'action-btn outline'}`}
                            onClick={() => handleUpdateItem(selectedItem.id, { shipping_method: 'vendor' })}
                          >
                            Vendor Shipment
                          </button>
                          <button 
                            className={`flex-1 justify-center ${(selectedItem.shipping_method === 'local') ? 'action-btn primary' : 'action-btn outline'}`}
                            onClick={() => handleUpdateItem(selectedItem.id, { shipping_method: 'local' })}
                          >
                            Local Pickup
                          </button>
                        </div>"""
tsx = tsx.replace(ship_str, ship_new)

def add_label_styles(match):
    label_text = match.group(1)
    if 'text-[10px]' in label_text:
        return f'<label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">{match.group(2)}</label>'
    elif 'text-xs text-gray-500' in label_text:
        return f'<label className="text-xs text-gray-500 font-bold uppercase mb-2 block">{match.group(2)}</label>'
    return match.group(0)

tsx = re.sub(r'<label className="(.*?)">(.*?)</label>', add_label_styles, tsx)

with open('frontend/src/views/WorkQueueView.tsx', 'w') as f:
    f.write(tsx)

print("done")
