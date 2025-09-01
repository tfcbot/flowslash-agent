import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Settings } from "lucide-react";

export interface PatternMetaNodeData {
  label: string;
  pattern: string;
}

export default function PatternMetaNode({
  data,
}: NodeProps<PatternMetaNodeData>) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 shadow-lg min-w-[200px] border-2 border-blue-400">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-2">
        <Settings size={16} />
        <div className="font-medium text-sm">{data.label}</div>
      </div>

      <div className="text-xs opacity-90">Pattern: {data.pattern}</div>

      <div className="mt-2 text-xs opacity-75">
        This is a predefined workflow pattern. Customize the individual nodes to
        fit your needs.
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
