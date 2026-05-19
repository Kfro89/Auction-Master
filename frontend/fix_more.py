import re
import os

def replace_in_file(filepath, replacements):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements.items():
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# 1. VehiclesView.tsx fix syntax error
with open('frontend/src/views/VehiclesView.tsx', 'r') as f:
    vv = f.read()
vv = vv.replace("      return changed ? next : prev;\n    });\n  }, [items]);", "      return changed ? next : prev;\n    }), 0);\n  }, [items]);")
# Fix 'any' issues remaining
vv = vv.replace("tags?: any;", "tags?: unknown;")
vv = vv.replace("(tag: any)", "(tag: { key?: string; value: string; fullTag?: string; })")
with open('frontend/src/views/VehiclesView.tsx', 'w') as f:
    f.write(vv)

# 2. WatchListView.tsx fix 'any' and un-used 'error'
with open('frontend/src/views/WatchListView.tsx', 'r') as f:
    wlv = f.read()
wlv = wlv.replace("} catch (error) {\n      console.error('Failed to remove item:', error);", "} catch (e) {\n      console.error('Failed to remove item:', e);")
wlv = wlv.replace("tags?: any;", "tags?: unknown;")
with open('frontend/src/views/WatchListView.tsx', 'w') as f:
    f.write(wlv)

# 3. ItemDetailModal.tsx fix 'any'
with open('frontend/src/components/ItemDetailModal.tsx', 'r') as f:
    idm = f.read()
idm = idm.replace("record: any", "record: Record<string, unknown>")
with open('frontend/src/components/ItemDetailModal.tsx', 'w') as f:
    f.write(idm)

# 4. LedgerView.tsx CustomTooltip move out
with open('frontend/src/views/LedgerView.tsx', 'r') as f:
    lv = f.read()
if "const CustomTooltip" in lv:
    # We will extract CustomTooltip and put it at the top level
    custom_tooltip_code = """
const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-1">{payload[0].name}</p>
        <p className="text-sm text-blue-600 font-bold">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};
"""
    # Remove it from inside LedgerView
    lv = re.sub(r"  const CustomTooltip = \(\{ active, payload \}: any\) => \{[\s\S]*?  \};\n", "", lv)
    # Also replace any other 'any'
    lv = lv.replace("payload }: any)", "payload }: { active?: boolean, payload?: any[] })")
    # Add it to the top after imports
    lv = re.sub(r"(import .*?;\n\n)", r"\1" + custom_tooltip_code, lv, count=1)
    
    with open('frontend/src/views/LedgerView.tsx', 'w') as f:
        f.write(lv)

# 5. useSortableData.ts
# Since it's complaining about accessing refs during render, we can replace refs with useState.
with open('frontend/src/hooks/useSortableData.ts', 'r') as f:
    usd = f.read()

usd = usd.replace("const lastSortConfigRef = React.useRef<SortConfig | null>(null);", "const [lastSortConfig, setLastSortConfig] = React.useState<SortConfig | null>(null);")
usd = usd.replace("const previousOrderRef = React.useRef<number[]>([]);", "const [previousOrder, setPreviousOrder] = React.useState<number[]>([]);")
usd = usd.replace("lastSortConfigRef.current", "lastSortConfig")
usd = usd.replace("previousOrderRef.current", "previousOrder")
# Replace setting refs during render with a useEffect
usd_new = """import React from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const useSortableData = <T extends { id: number }>(items: T[], config: SortConfig | null = null) => {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(config);
  const [lastSortConfig, setLastSortConfig] = React.useState<SortConfig | null>(null);
  const [previousOrder, setPreviousOrder] = React.useState<number[]>([]);

  const sortableItems = React.useMemo(() => {
    let sortedItems = [...items];
    
    if (sortConfig !== null) {
      sortedItems.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof T];
        const bVal = b[sortConfig.key as keyof T];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      if (previousOrder.length > 0) {
        const itemMap = new Map(sortedItems.map(item => [item.id, item]));
        const newSorted = [];
        for (const id of previousOrder) {
          if (itemMap.has(id)) {
            newSorted.push(itemMap.get(id)!);
            itemMap.delete(id);
          }
        }
        for (const item of itemMap.values()) {
          newSorted.push(item);
        }
        sortedItems = newSorted;
      }
    }
    return sortedItems;
  }, [items, sortConfig, previousOrder]);

  React.useEffect(() => {
    if (sortConfig !== lastSortConfig) {
      setPreviousOrder(sortableItems.map(item => item.id));
      setLastSortConfig(sortConfig);
    }
  }, [sortableItems, sortConfig, lastSortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortableItems, requestSort, sortConfig };
};
"""
with open('frontend/src/hooks/useSortableData.ts', 'w') as f:
    f.write(usd_new)

# 6. WorkQueueView.tsx
with open('frontend/src/views/WorkQueueView.tsx', 'r') as f:
    wqv = f.read()
wqv = wqv.replace("tags?: any;", "tags?: unknown;")
with open('frontend/src/views/WorkQueueView.tsx', 'w') as f:
    f.write(wqv)

# 7. StoreView.tsx
with open('frontend/src/views/StoreView.tsx', 'r') as f:
    sv = f.read()
sv = sv.replace("tags?: any;", "tags?: unknown;")
with open('frontend/src/views/StoreView.tsx', 'w') as f:
    f.write(sv)
