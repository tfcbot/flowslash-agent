import React, { useState } from "react";
import { Node, Edge } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Code, Package, FileText, Copy, CheckCircle } from "lucide-react";
import { 
  exportWorkflowFromUI, 
  generateStandaloneFunction, 
  generateStandalonePackage 
} from "@/lib/workflow-export/export-utils";

interface WorkflowExporterProps {
  nodes: Node[];
  edges: Edge[];
  className?: string;
}

export function WorkflowExporter({ nodes, edges, className = "" }: WorkflowExporterProps) {
  const [workflowName, setWorkflowName] = useState("My Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [functionName, setFunctionName] = useState("executeWorkflow");
  const [exportType, setExportType] = useState<'function' | 'package'>('function');
  const [copied, setCopied] = useState(false);

  const handleExportFunction = () => {
    const workflow = exportWorkflowFromUI(nodes, edges, {
      name: workflowName,
      description: workflowDescription,
      version: "1.0.0",
    });

    const functionCode = generateStandaloneFunction(workflow, {
      functionName,
      includeTypes: true,
      includeComments: true,
    });

    // Copy to clipboard
    navigator.clipboard.writeText(functionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPackage = () => {
    const workflow = exportWorkflowFromUI(nodes, edges, {
      name: workflowName,
      description: workflowDescription,
      version: "1.0.0",
    });

    const packageFiles = generateStandalonePackage(workflow, {
      functionName,
      includeTypes: true,
      includeComments: true,
      includeTests: true,
    });

    // Create and download ZIP file
    downloadAsZip(packageFiles, `${workflowName.replace(/\s+/g, '-').toLowerCase()}-package.zip`);
  };

  const downloadAsZip = async (files: Record<string, string>, filename: string) => {
    // Simple implementation - in a real app, you'd use a proper ZIP library
    const content = Object.entries(files)
      .map(([name, content]) => `=== ${name} ===\n${content}\n`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.zip', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getNodeSummary = () => {
    const nodeTypes = nodes.reduce((acc, node) => {
      acc[node.type || 'unknown'] = (acc[node.type || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(nodeTypes)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
  };

  const hasRequiredNodes = nodes.length > 0;
  const hasLLMNodes = nodes.some(n => n.type === 'llm');
  const hasComposioNodes = nodes.some(n => n.type === 'composio');

  return (
    <Card className={`bg-black/40 border-white/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Package size={20} />
          Export Workflow
        </CardTitle>
        <p className="text-white/70 text-sm">
          Export your workflow as a standalone function or complete package
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Workflow Info */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-white/90 block mb-1">
              Workflow Name
            </label>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="My Awesome Workflow"
              className="bg-black/40 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/90 block mb-1">
              Description (Optional)
            </label>
            <Input
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="What does this workflow do?"
              className="bg-black/40 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/90 block mb-1">
              Function Name
            </label>
            <Input
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              placeholder="executeWorkflow"
              className="bg-black/40 border-white/20 text-white"
            />
          </div>
        </div>

        {/* Workflow Summary */}
        <div className="bg-black/20 rounded-lg p-3 border border-white/10">
          <h4 className="text-sm font-medium text-white/90 mb-2">Workflow Summary</h4>
          <div className="space-y-1 text-xs text-white/70">
            <div>📊 <strong>{nodes.length}</strong> nodes, <strong>{edges.length}</strong> connections</div>
            <div>🔧 Node types: {getNodeSummary()}</div>
            {hasLLMNodes && (
              <div>🤖 Requires LLM API keys (OpenAI, Anthropic, or Google)</div>
            )}
            {hasComposioNodes && (
              <div>🛠️ Requires Composio API key for tool integrations</div>
            )}
          </div>
        </div>

        {/* Export Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/90 block">Export Type</label>
          <div className="flex gap-2">
            <Button
              variant={exportType === 'function' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportType('function')}
              className={exportType === 'function' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'border-white/20 text-white/70 hover:text-white'
              }
            >
              <Code size={14} className="mr-1" />
              Function Only
            </Button>
            <Button
              variant={exportType === 'package' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportType('package')}
              className={exportType === 'package' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'border-white/20 text-white/70 hover:text-white'
              }
            >
              <Package size={14} className="mr-1" />
              Complete Package
            </Button>
          </div>
        </div>

        {/* Export Description */}
        <div className="bg-black/20 rounded-lg p-3 border border-white/10">
          {exportType === 'function' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                <Code size={16} />
                Standalone Function
              </div>
              <p className="text-xs text-white/70">
                Exports a single TypeScript function that you can copy into your project. 
                Includes the workflow definition and execution logic.
              </p>
              <div className="text-xs text-white/60">
                • Copy-paste ready TypeScript code<br/>
                • Includes type definitions<br/>
                • Self-contained with workflow definition
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                <Package size={16} />
                Complete Package
              </div>
              <p className="text-xs text-white/70">
                Exports a complete npm package with all files needed to run the workflow independently.
              </p>
              <div className="text-xs text-white/60">
                • package.json with dependencies<br/>
                • TypeScript source code<br/>
                • Test file and README<br/>
                • Environment configuration
              </div>
            </div>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 pt-2">
          {exportType === 'function' ? (
            <Button
              onClick={handleExportFunction}
              disabled={!hasRequiredNodes || !workflowName.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {copied ? (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copy Function
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleExportPackage}
              disabled={!hasRequiredNodes || !workflowName.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download size={16} className="mr-2" />
              Download Package
            </Button>
          )}
        </div>

        {/* Requirements Warning */}
        {!hasRequiredNodes && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <FileText size={16} />
              Add some nodes to your workflow before exporting
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        {hasRequiredNodes && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-400 mb-2">Usage Instructions</div>
            <div className="text-xs text-white/70 space-y-1">
              <div>1. {exportType === 'function' ? 'Paste the function into your project' : 'Extract the downloaded package'}</div>
              <div>2. Install required dependencies</div>
              <div>3. Set up your API keys in environment variables</div>
              <div>4. Call the function with your input and configuration</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
