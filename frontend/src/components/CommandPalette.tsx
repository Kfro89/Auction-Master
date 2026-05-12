import React, { useState, useEffect, useRef } from 'react';
import './CommandPalette.css';
import { Search } from 'lucide-react';
import { useCommandContext } from '../contexts/CommandContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { contextCommands } = useCommandContext();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
    }
    setSelectedIndex(0);
  }, [isOpen, query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      }
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        const safeIndex = selectedIndex < filteredCommands.length ? selectedIndex : 0;
        filteredCommands[safeIndex].action();
        onClose();
      }
    }
  };

  const handleAction = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  const defaultCommands = [
    { label: 'Go to Research', tab: 'research', type: 'navigation' },
    { label: 'Go to Bidding', tab: 'bidding', type: 'navigation' },
    { label: 'Go to Work Queue', tab: 'work-queue', type: 'navigation' },
    { label: 'Go to Store', tab: 'store', type: 'navigation' },
    { label: 'Go to Settings', tab: 'settings', type: 'navigation' },
  ];

  const allCommands = [
    ...defaultCommands.map(c => ({ id: c.tab, label: c.label, action: () => handleAction(c.tab), group: 'Navigation' })),
    ...contextCommands
  ];

  const filteredCommands = allCommands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="cmd-header">
          <Search size={20} className="cmd-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="cmd-results">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <div 
                key={cmd.id} 
                className={`cmd-item ${index === selectedIndex ? 'selected' : ''}`} 
                onClick={() => { cmd.action(); onClose(); }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="cmd-item-label">{cmd.label}</span>
                {cmd.group && <span className="cmd-item-group">{cmd.group}</span>}
              </div>
            ))
          ) : (
            <div className="cmd-empty">No commands found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
