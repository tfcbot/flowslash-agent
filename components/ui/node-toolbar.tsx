import React from 'react';
import { Button } from './button';
import { Copy, Trash2, Settings } from 'lucide-react';

interface NodeToolbarProps {
  onDuplicate: () => void;
  onDelete: () => void;
  onSettings?: () => void;
  className?: string;
}

export function NodeToolbar({ onDuplicate, onDelete, onSettings, className = '' }: NodeToolbarProps) {
  return (
    <div className={`flex items-center gap-1 bg-black/80 border border-[#fff5f5]/20 rounded-lg p-1 backdrop-blur-sm ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDuplicate}
        className="h-7 w-7 p-0 text-[#fff5f5] hover:bg-[#fff5f5]/10"
        title="Duplicate node"
      >
        <Copy size={12} />
      </Button>
      {onSettings && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="h-7 w-7 p-0 text-[#fff5f5] hover:bg-[#fff5f5]/10"
          title="Node settings"
        >
          <Settings size={12} />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10"
        title="Delete node"
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
}
