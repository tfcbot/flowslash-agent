import React, { useState, useCallback, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Copy } from "lucide-react";
import { NodeDropdown } from "@/components/ui/node-dropdown";

export interface InputNodeData {
  label: string;
  query: string;
  onNodeDataChange: (id: string, data: Partial<InputNodeData>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const InputNode = memo(function InputNode({ id, data, selected }: NodeProps<InputNodeData>) {
  const [isEditing, setIsEditing] = useState(false);

  const handleLabelChange = useCallback((newLabel: string) => {
    data.onNodeDataChange(id, { label: newLabel });
  }, [id, data.onNodeDataChange]);

  const handleQueryChange = useCallback((newQuery: string) => {
    data.onNodeDataChange(id, { query: newQuery });
  }, [id, data.onNodeDataChange]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(data.query || "");
  }, [data.query]);

  const handleDelete = useCallback(() => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  }, [id, data.onDelete]);

  const handleDuplicate = useCallback(() => {
    if (data.onDuplicate) {
      data.onDuplicate(id);
    }
  }, [id, data.onDuplicate]);

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 shadow-lg min-w-[200px] transition-all duration-200 relative ${
      selected ? 'border-blue-400 shadow-blue-400/20 shadow-xl' : 'border-blue-500'
    }`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={16} className="text-blue-500" />
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={data.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
              autoFocus
              className="h-6 text-sm"
            />
          ) : (
            <div
              className="font-medium text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded"
              onClick={() => setIsEditing(true)}
            >
              {data.label}
            </div>
          )}
        </div>
        <NodeDropdown
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onSettings={() => setIsEditing(!isEditing)}
        />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Input Query:
        </div>
        <Input
          value={data.query || ''}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Enter your query here..."
          className="h-8 text-xs"
          onFocus={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            {data.query ? `${data.query.length} chars` : "No input"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 w-6 p-0"
            disabled={!data.query}
          >
            <Copy size={12} />
          </Button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
});

export default InputNode;
