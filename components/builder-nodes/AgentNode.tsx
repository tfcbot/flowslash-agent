import React, { useState, useCallback, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Group, ExternalLink } from "lucide-react";
import { NodeDropdown } from "@/components/ui/node-dropdown";

export interface AgentNodeData {
  label: string;
  modelProvider: string;
  modelName: string;
  systemPrompt: string;
  allowedTools: string;
  onNodeDataChange: (id: string, data: Partial<AgentNodeData>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

interface AgentNodeProps extends NodeProps<AgentNodeData> {
  onOpenToolsWindow: () => void;
}

const modelOptions = {
  openai: ["gpt-4o", "gpt-4.1", "o3-mini"],
  anthropic: [
    "claude-3-5-sonnet-20240620",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ],
  google: [
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "gemini-1.0-pro",
  ],
};

const AgentNode = memo(function AgentNode({
  id,
  data,
  selected,
  onOpenToolsWindow,
}: AgentNodeProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleLabelChange = useCallback((newLabel: string) => {
    data.onNodeDataChange(id, { label: newLabel });
  }, [id, data.onNodeDataChange]);

  const handleModelProviderChange = useCallback((newProvider: string) => {
    data.onNodeDataChange(id, {
      modelProvider: newProvider,
      modelName:
        modelOptions[newProvider as keyof typeof modelOptions]?.[0] || "",
    });
  }, [id, data.onNodeDataChange]);

  const handleModelNameChange = useCallback((newModel: string) => {
    data.onNodeDataChange(id, { modelName: newModel });
  }, [id, data.onNodeDataChange]);

  const handleSystemPromptChange = useCallback((newPrompt: string) => {
    data.onNodeDataChange(id, { systemPrompt: newPrompt });
  }, [id, data.onNodeDataChange]);

  const handleAllowedToolsChange = useCallback((newTools: string) => {
    data.onNodeDataChange(id, { allowedTools: newTools });
  }, [id, data.onNodeDataChange]);

  const openToolsWindow = useCallback(() => {
    onOpenToolsWindow();
  }, [onOpenToolsWindow]);

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
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 shadow-lg min-w-[280px] transition-all duration-200 relative ${
      selected ? 'border-indigo-400 shadow-indigo-400/20 shadow-xl' : 'border-indigo-500'
    }`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-3">
        <Group size={16} className="text-indigo-500" />
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Provider:
            </div>
            <select
              value={data.modelProvider}
              onChange={(e) => handleModelProviderChange(e.target.value)}
              className="w-full h-8 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Model:
            </div>
            <select
              value={data.modelName}
              onChange={(e) => handleModelNameChange(e.target.value)}
              className="w-full h-8 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700"
            >
              {modelOptions[
                data.modelProvider as keyof typeof modelOptions
              ]?.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            System Prompt:
          </div>
          <Input
            value={data.systemPrompt || ''}
            onChange={(e) => handleSystemPromptChange(e.target.value)}
            placeholder="Enter system prompt for the agent..."
            className="h-8 text-xs"
            onFocus={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>

        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Allowed Tools:
          </div>
          <Input
            value={data.allowedTools || ''}
            onChange={(e) => handleAllowedToolsChange(e.target.value)}
            placeholder="e.g., gmail, notion, slack (comma separated)"
            className="h-8 text-xs"
            onFocus={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Agent with {data.modelProvider} model
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
});

export default AgentNode;
