import React, { useState, useCallback, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { NodeDropdown } from "@/components/ui/node-dropdown";

export interface LLMNodeData {
  label: string;
  systemPrompt: string;
  onNodeDataChange: (id: string, data: Partial<LLMNodeData>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

interface LLMNodeProps extends NodeProps<LLMNodeData> {}

const LLMNode = memo(function LLMNode({ id, data, selected }: LLMNodeProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleLabelChange = useCallback((newLabel: string) => {
    data.onNodeDataChange(id, { label: newLabel });
  }, [id, data.onNodeDataChange]);

  const handleSystemPromptChange = useCallback((newPrompt: string) => {
    data.onNodeDataChange(id, { systemPrompt: newPrompt });
  }, [id, data.onNodeDataChange]);

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
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 shadow-lg min-w-[250px] transition-all duration-200 relative ${
      selected ? 'border-purple-400 shadow-purple-400/20 shadow-xl' : 'border-purple-500'
    }`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-3">
        <BrainCircuit size={16} className="text-purple-500" />
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

      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            System Prompt:
          </div>
          <Input
            value={data.systemPrompt || ''}
            onChange={(e) => handleSystemPromptChange(e.target.value)}
            placeholder="Enter system prompt..."
            className="h-8 text-xs"
            onFocus={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex justify-center items-center">
          <div className="text-xs text-gray-400">
            {data.systemPrompt
              ? `${data.systemPrompt.length} chars`
              : "No prompt"}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
});

export default LLMNode;
