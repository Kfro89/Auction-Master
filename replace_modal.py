import re

with open('frontend/src/views/LedgerView.tsx', 'r') as f:
    content = f.read()

# Replace glass-panel with bg-white border border-gray-200 rounded-lg shadow-sm
content = content.replace('glass-panel', 'bg-white border border-gray-200 rounded-lg shadow-sm')

# Colors
content = content.replace('text-white', 'text-gray-900')
content = content.replace('text-gray-300', 'text-gray-700')
content = content.replace('text-gray-400', 'text-gray-500')
content = content.replace('text-gray-500', 'text-gray-500') # stays

# Backgrounds and borders
content = content.replace('bg-rose-500/5 border-rose-500/20', 'bg-rose-50 border border-rose-200')
content = content.replace('bg-emerald-500/10 border-emerald-500/20', 'bg-emerald-50 border border-emerald-200')
content = content.replace('border-2 border-blue-500/30', 'border border-blue-200 bg-blue-50')
content = content.replace('bg-white/5', 'bg-gray-50')
content = content.replace('border-white/5', 'border-gray-200')
content = content.replace('border-white/10', 'border-gray-200')
content = content.replace('divide-white/5', 'divide-gray-200')
content = content.replace('hover:bg-white/5', 'hover:bg-gray-50')
content = content.replace('bg-white/10', 'bg-gray-200')

with open('frontend/src/views/LedgerView.tsx', 'w') as f:
    f.write(content)
