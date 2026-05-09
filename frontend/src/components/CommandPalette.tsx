import React, { useState, useEffect, useRef } from 'react';
import './CommandPalette.css';
import { Search } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleAction = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  const filteredCommands = [
    { label: 'Go to Research', tab: 'research' },
    { label: 'Go to Bidding', tab: 'bidding' },
    { label: 'Go to Work Queue', tab: 'work-queue' },
    { label: 'Go to Store', tab: 'store' },
    { label: 'Go to Settings', tab: 'settings' },
  ].filter(cmd => cmd.label.toLowerCase().includes(query.toLowerCase()));

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
            filteredCommands.map((cmd) => (
              <div key={cmd.tab} className="cmd-item" onClick={() => handleAction(cmd.tab)}>
                {cmd.label}
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
