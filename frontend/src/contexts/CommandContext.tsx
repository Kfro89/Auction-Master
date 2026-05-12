import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Command = {
  id: string;
  label: string;
  action: () => void;
  group?: string;
};

interface CommandContextType {
  contextCommands: Command[];
  setContextCommands: (commands: Command[]) => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export const CommandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contextCommands, setContextCommandsState] = useState<Command[]>([]);

  const setContextCommands = useCallback((newCommands: Command[]) => {
    setContextCommandsState(newCommands);
  }, []);

  return (
    <CommandContext.Provider value={{ contextCommands, setContextCommands }}>
      {children}
    </CommandContext.Provider>
  );
};

export const useCommandContext = () => {
  const context = useContext(CommandContext);
  if (!context) throw new Error('useCommandContext must be used within CommandProvider');
  return context;
};
