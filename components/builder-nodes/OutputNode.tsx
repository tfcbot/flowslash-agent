import React, { useState, useCallback, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, Download } from "lucide-react";
import { NodeDropdown } from "@/components/ui/node-dropdown";

export interface OutputNodeData {
  label: string;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const OutputNode = memo(function OutputNode({ id, data, selected }: NodeProps<OutputNodeData>) {
  const [isEditing, setIsEditing] = useState(false);

  const handleLabelChange = useCallback((newLabel: string) => {
    // This would need to be passed through props if we want to make it editable
    console.log("Label changed to:", newLabel);
  }, []);

  const downloadOutput = useCallback(() => {
    // This would download the actual output data
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ output: "Sample output" }));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "output.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, []);

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
      selected ? 'border-green-400 shadow-green-400/20 shadow-xl' : 'border-green-500'
    }`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-3">
        <ArrowRightCircle size={16} className="text-green-500" />
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
        <div className="text-xs text-gray-500 dark:text-gray-400">Output:</div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 min-h-[60px] text-xs text-gray-600 dark:text-gray-300">
          {data.label === "End Result"
            ? "Output will appear here after workflow execution"
            : "Ready to receive output"}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">Output node</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadOutput}
            className="h-6 w-6 p-0"
          >
            <Download size={12} />
          </Button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

export default OutputNode;
