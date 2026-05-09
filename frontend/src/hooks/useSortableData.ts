import { useState, useMemo, useRef } from 'react';

export const useSortableData = (items: any[], config: { key: string; direction: 'asc' | 'desc' } | null = null) => {
  const [sortConfig, setSortConfig] = useState(config);
  const previousOrderRef = useRef<number[]>([]);
  const lastSortConfigRef = useRef(sortConfig);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    
    // Check if the user specifically requested a new sort
    const isNewSort = sortConfig !== lastSortConfigRef.current;
    
    if (isNewSort) {
      // User clicked a header, do a fresh sort
      if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
          const getVal = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
          let aVal = getVal(a, sortConfig.key);
          let bVal = getVal(b, sortConfig.key);
          
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;

          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      // Save this new order
      previousOrderRef.current = sortableItems.map(item => item.id);
      lastSortConfigRef.current = sortConfig;
    } else {
      // Data updated, but sort wasn't changed.
      // Restore the previous order to prevent items from jumping around.
      if (previousOrderRef.current.length > 0) {
        const itemMap = new Map(sortableItems.map(item => [item.id, item]));
        const newSorted = [];
        
        for (const id of previousOrderRef.current) {
          if (itemMap.has(id)) {
            newSorted.push(itemMap.get(id));
            itemMap.delete(id);
          }
        }
        // Append any brand new items that weren't in the previous order
        for (const newItem of itemMap.values()) {
          newSorted.push(newItem);
        }
        sortableItems = newSorted;
        // Update the order ref to include the new items
        previousOrderRef.current = sortableItems.map(item => item.id);
      } else {
        // First render, no previous order
        if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
            const getVal = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
            let aVal = getVal(a, sortConfig.key);
            let bVal = getVal(b, sortConfig.key);
            
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }
        previousOrderRef.current = sortableItems.map(item => item.id);
      }
    }
    
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};