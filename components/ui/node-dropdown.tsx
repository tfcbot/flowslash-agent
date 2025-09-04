import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Copy, Trash2, Settings } from 'lucide-react';

interface NodeDropdownProps {
  onDuplicate: () => void;
  onDelete: () => void;
  onSettings?: () => void;
  className?: string;
}

export function NodeDropdown({ onDuplicate, onDelete, onSettings, className = '' }: NodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="h-6 w-6 p-0"
      >
        <Settings size={12} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-black/90 border border-[#fff5f5]/20 rounded-lg shadow-xl backdrop-blur-sm z-50 min-w-[120px]">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onDuplicate);
              }}
              className="w-full px-3 py-2 text-left text-sm text-[#fff5f5] hover:bg-[#fff5f5]/10 transition-colors flex items-center gap-2"
            >
              <Copy size={12} />
              Copy
            </button>
            {onSettings && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onSettings);
                }}
                className="w-full px-3 py-2 text-left text-sm text-[#fff5f5] hover:bg-[#fff5f5]/10 transition-colors flex items-center gap-2"
              >
                <Settings size={12} />
                Settings
              </button>
            )}
            <div className="border-t border-[#fff5f5]/20 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onDelete);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
