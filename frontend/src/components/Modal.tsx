import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    md: 'max-w-[500px] w-full',
    lg: 'max-w-[800px] w-full',
    xl: 'max-w-[1200px] w-full',
    full: 'w-[95vw] h-[95vh]'
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div 
        className={`relative bg-surface-container-lowest border border-outline-variant shadow-soft rounded-[1rem] p-6 max-h-[90vh] overflow-auto animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] ${sizeClasses[size]}`} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-3 right-3 bg-transparent border-none text-on-surface-variant cursor-pointer p-1 rounded-md flex items-center justify-center transition-all duration-200 hover:bg-black/5 hover:text-on-surface" 
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;