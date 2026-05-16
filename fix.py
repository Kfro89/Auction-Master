import os

# ItemDetailModal
f = 'frontend/src/components/ItemDetailModal.tsx'
with open(f, 'r') as file:
    content = file.read()

content = content.replace("import { CalendarDays, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';", 
"import { CalendarDays, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';\nimport { CountdownTimer } from './CountdownTimer';\nimport { normalizeTags, getHighResImageUrl } from '../utils/formatters';")

import re
content = re.sub(r"const CountdownTimer: React\.FC<\{ endTime: string \| null \}> = \(\{ endTime \}\) => \{.*?\};\n\nconst normalizeTags =.*?;\n\nexport const getHighResImageUrl =.*?\n\n", "\n", content, flags=re.DOTALL)
with open(f, 'w') as file:
    file.write(content)

# ResearchView
f = 'frontend/src/views/ResearchView.tsx'
with open(f, 'r') as file:
    content = file.read()

content = content.replace("import type { Command } from '../contexts/CommandContext';",
"import type { Command } from '../contexts/CommandContext';\nimport { CountdownTimer } from '../components/CountdownTimer';\nimport { normalizeTags, getHighResImageUrl } from '../utils/formatters';")

content = re.sub(r"const CountdownTimer: React\.FC<\{ endTime: string \| null \}> = \(\{ endTime \}\) => \{.*?\};\n\nconst normalizeTags =.*?\n\n", "\n", content, flags=re.DOTALL)

content = re.sub(r"  const getHighResImageUrl = \(url: string\) => \{\n    if \(!url\) return '';\n    // Replace typical patterns from scraping for high-res images\n    return url\.replace\(/\\\\/\(\?:small\|thumb\)\\\\\//i, '/large/'\)\.replace\(/\[_-\]\(\?:small\|thumb\)\(\\\\.\[a-zA-Z0-9\]\+\)\$/i, '_large\$1'\);\n  \};\n\n", "", content)

content = content.replace("<CountdownTimer endTime={item.end_time} />", '<CountdownTimer endTime={item.end_time} className="timer-text" endedText="Ending Now" endedClassName="ending-now" />')

with open(f, 'w') as file:
    file.write(content)

# WatchListView
f = 'frontend/src/views/WatchListView.tsx'
with open(f, 'r') as file:
    content = file.read()

content = content.replace("import ItemDetailModal from '../components/ItemDetailModal';",
"import ItemDetailModal from '../components/ItemDetailModal';\nimport { CountdownTimer } from '../components/CountdownTimer';\nimport { getHighResImageUrl } from '../utils/formatters';")

content = re.sub(r"const CountdownTimer: React\.FC<\{ endTime: string \| null \}> = \(\{ endTime \}\) => \{.*?\};\n\n", "\n", content, flags=re.DOTALL)

content = re.sub(r"  const getHighResImageUrl = \(url: string\) => \{\n    if \(!url\) return '';\n    return url\.replace\(/\\\\/\(\?:small\|thumb\)\\\\\//i, '/large/'\)\.replace\(/\[_-\]\(\?:small\|thumb\)\(\\\\.\[a-zA-Z0-9\]\+\)\$/i, '_large\$1'\);\n  \};\n\n", "", content)

content = content.replace("<CountdownTimer endTime={item.end_time} />", '<CountdownTimer endTime={item.end_time} className="watch-timer" endedText="Ended" endedClassName="ended" />')

content = content.replace("await response.json().catch(() => ({ detail: \"Valuation failed\" }));\n        console.error(`Failed to valuate item ${itemId}`);",
"const errData = await response.json().catch(() => ({ detail: \"Valuation failed\" }));\n        console.error(`Failed to valuate item ${itemId}:`, errData.detail);")

with open(f, 'w') as file:
    file.write(content)
