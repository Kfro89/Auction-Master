import { useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { SidebarProvider } from '../../contexts/SidebarContext';
import { CommandProvider } from '../../contexts/CommandContext';
import { ToastProvider } from './ToastProvider';
import { AmbientBackdrop } from './AmbientBackdrop';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import CommandPalette from '../CommandPalette';

interface AppShellProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  title?: string;
  subtitle?: string;
  endingSoonCount?: number;
  topBarRightSlot?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  activeTab,
  onTabChange,
  title,
  subtitle,
  endingSoonCount,
  topBarRightSlot,
  children,
}: AppShellProps) {
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ThemeProvider>
      <SidebarProvider>
        <CommandProvider>
          <ToastProvider>
            <AmbientBackdrop />
            <div className="relative min-h-screen">
              <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
              <div
                className="flex flex-col min-h-screen"
                style={{
                  marginLeft: 'var(--sidebar-w)',
                  transition: 'margin-left 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <TopBar
                  title={title}
                  subtitle={subtitle}
                  endingSoonCount={endingSoonCount}
                  rightSlot={topBarRightSlot}
                  onCmdK={() => setIsCmdOpen(true)}
                />
                <main className="flex-1 px-6 py-6 max-w-[1600px] w-full mx-auto">
                  {children}
                </main>
              </div>
              <CommandPalette
                isOpen={isCmdOpen}
                onClose={() => setIsCmdOpen(false)}
                onNavigate={onTabChange}
              />
            </div>
          </ToastProvider>
        </CommandProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
