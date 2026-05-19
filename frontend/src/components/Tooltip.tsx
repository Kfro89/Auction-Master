import React, { useState } from 'react';

interface TooltipProps {
  text: React.ReactNode;
  children: React.ReactElement;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && <div className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2 bg-surface-container-lowest border border-outline-variant shadow-soft text-on-surface px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[1100] animate-in fade-in duration-200">{text}</div>}
    </div>
  );
};
export default Tooltip;
