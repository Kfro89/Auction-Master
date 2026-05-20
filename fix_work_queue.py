import re

with open('frontend/src/views/WorkQueueView.tsx', 'r') as f:
    content = f.read()

# Remove 'glass' and 'glass-panel' classes which might be causing issues
content = content.replace('stage-navigator glass mb-6', 'stage-navigator mb-6')
content = content.replace('item-list glass-panel', 'item-list')
content = content.replace('staging-panel glass-panel', 'staging-panel')
content = content.replace('photo-zone glass mb-6', 'photo-zone mb-6')

# Fix remaining text-gray-400 which is too light for white background
content = content.replace('text-gray-400 text-sm', 'text-gray-700 text-sm font-semibold')
content = content.replace('text-gray-400', 'text-gray-500')

with open('frontend/src/views/WorkQueueView.tsx', 'w') as f:
    f.write(content)

with open('frontend/src/views/WorkQueueView.css', 'r') as f:
    css_content = f.read()

if 'color: #111827;' not in css_content[:200]:
    css_content = css_content.replace('background-color: #FAFAFA;', 'background-color: #FAFAFA;\n  color: #111827;')
    
with open('frontend/src/views/WorkQueueView.css', 'w') as f:
    f.write(css_content)

