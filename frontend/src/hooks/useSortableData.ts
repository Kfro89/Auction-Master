import React from 'react';

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
