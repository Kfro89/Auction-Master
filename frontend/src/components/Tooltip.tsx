import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  text: React.ReactNode;
  children: React.ReactElement;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="tooltip-wrapper" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && <div className="tooltip-box">{text}</div>}
    </div>
  );
};
export default Tooltip;
