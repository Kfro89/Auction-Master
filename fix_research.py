import re

with open('frontend/src/views/ResearchView.tsx', 'r') as f:
    content = f.read()

# 1. Remove css import
content = re.sub(r"import '\./ResearchView\.css';\n", "", content)

# 2. Add StatusBadge import
content = re.sub(r"import \{ CountdownTimer \} from '\.\./components/CountdownTimer';", "import { CountdownTimer } from '../components/CountdownTimer';\nimport { StatusBadge } from '../components/ui';", content)

# 3. Remove local StatusPill definition
status_pill_regex = r"const StatusPill: React\.FC<\{ status\?: string \}> = \(\{ status \}.*?</div>\n  \);\n};\n"
content = re.sub(status_pill_regex, "", content, flags=re.DOTALL)

# 4. Replace StatusPill usage
content = re.sub(r"<StatusPill status=\{([^}]+)\} />", r"<StatusBadge status={\1 || 'Unknown'} />", content)

# 5. Replace layout classes
content = re.sub(r'className="research-view"', '', content)
content = re.sub(r'className="glass-panel(\s.*?)"', r'className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant relative\1"', content)
content = re.sub(r'<table className="dense-grid research-table">', '<table className="w-full text-left border-collapse">', content)
content = re.sub(r'<thead className=\{isEditMode \? \'edit-mode\' : \'\'\}>', '<thead className={`bg-surface-container-low border-b border-outline-variant ${isEditMode ? \'animate-pulse\' : \'\'}`}>', content)

# 6. Replace header cell logic
content = re.sub(r'className={`\$\{className\} \$\{sortKey && !isEditMode \? \'sortable\' : \'\'\}`}', r'className={`px-4 py-4 font-[700] text-[length:var(--text-label-caps)] text-on-surface-variant uppercase tracking-[0.05em] ${className} ${sortKey && !isEditMode ? \'cursor-pointer hover:bg-black/5\' : \'\'}`}', content)

# 7. Replace row logic
content = re.sub(r'<tr \n\s*key=\{item.id\} \n\s*className={`bidding-row transition-colors cursor-pointer hover:bg-white/5 \$\{getRowClass\(item.user_bid_status\)\} \$\{item.is_archived \? \'opacity-60 grayscale-\[0\.5\]\' : \'\'\}`}',
r'<tr \n                    key={item.id} \n                    className={`transition-colors cursor-pointer hover:bg-surface-container-low ${getRowClass(item.user_bid_status)} ${item.is_archived ? \'opacity-60 grayscale-[0.5]\' : \'\'}`}', content)

content = re.sub(r'<tbody>', '<tbody className="divide-y divide-outline-variant">', content)

content = re.sub(r'className="grid-thumb rounded border border-white/10"', 'className="w-12 h-12 object-cover rounded-lg border border-outline-variant transition-transform hover:scale-110"', content)

content = re.sub(r'className="title-content"', 'className="font-[600] leading-snug text-on-surface line-clamp-2"', content)
content = re.sub(r'className="mono"', 'className="font-mono text-[0.85rem] text-on-surface-variant"', content)

content = re.sub(r'className="bid-cell"', 'className="font-[700] text-[var(--color-status-winning)]"', content)
content = re.sub(r'className="timer-text"', 'className="font-[600] text-[var(--color-secondary)]"', content)

content = re.sub(r'className="floating-save-btn"', 'className="fixed bottom-6 right-6 bg-status-winning text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-[100]"', content)

with open('frontend/src/views/ResearchView.tsx', 'w') as f:
    f.write(content)
