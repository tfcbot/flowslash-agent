import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Puzzle, Settings, ExternalLink } from "lucide-react";

export interface ComposioNodeData {
  label: string;
  toolAction: string;
  onNodeDataChange: (id: string, data: Partial<ComposioNodeData>) => void;
}

interface ComposioNodeProps extends NodeProps<ComposioNodeData> {
  onOpenToolsWindow: () => void;
}

export default function ComposioNode({
  id,
  data,
  onOpenToolsWindow,
}: ComposioNodeProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleLabelChange = (newLabel: string) => {
    data.onNodeDataChange(id, { label: newLabel });
  };

  const handleToolActionChange = (newAction: string) => {
    data.onNodeDataChange(id, { toolAction: newAction });
  };

  const openToolsWindow = () => {
    onOpenToolsWindow();
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-orange-500 rounded-lg p-4 shadow-lg min-w-[250px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-3">
        <Puzzle size={16} className="text-orange-500" />
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="h-6 w-6 p-0"
        >
          <Settings size={12} />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Tool Action:
          </div>
          <Input
            value={data.toolAction}
            onChange={(e) => handleToolActionChange(e.target.value)}
            placeholder="e.g., send_email, create_task..."
            className="h-8 text-xs"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            {data.toolAction
              ? `Action: ${data.toolAction}`
              : "No action specified"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openToolsWindow}
            className="h-6 text-xs"
          >
            <ExternalLink size={12} className="mr-1" />
            Tools
          </Button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}
