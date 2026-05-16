import re

with open('frontend/src/views/WatchListView.tsx', 'r') as f:
    content = f.read()

# remove unused imports
content = content.replace("import { X, ExternalLink, CalendarDays, TrendingUp, ArrowUpDown, Gavel, Loader2, LayoutGrid } from 'lucide-react';", "import { X, ExternalLink, Loader2 } from 'lucide-react';")

# remove unused Modal
content = content.replace("import Modal from '../components/Modal';\n", "")

# remove normalizeTags
# it's from `const normalizeTags` to the end of the function block.
import re
content = re.sub(r"const normalizeTags =.*?return \[\];\n};\n", "", content, flags=re.DOTALL)

# possibly null getRoiValue
content = content.replace("getRoiValue(selectedItem.valuation, selectedItem.current_bid) > 20", "(getRoiValue(selectedItem.valuation, selectedItem.current_bid) ?? 0) > 20")
content = content.replace("Math.round(getRoiValue(selectedItem.valuation, selectedItem.current_bid)!)", "Math.round(getRoiValue(selectedItem.valuation, selectedItem.current_bid) ?? 0)")

with open('frontend/src/views/WatchListView.tsx', 'w') as f:
    f.write(content)
