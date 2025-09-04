import React, { useState } from "react";
import { Node, Edge } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, RotateCcw, Download, Settings, AlertCircle, CheckCircle } from "lucide-react";
import { useWorkflowExecution, ExecutionConfig, StreamingEvent } from "@/lib/hooks/useWorkflowExecution";
import { ErrorDisplay } from "@/components/ui/error-display";

interface WorkflowTesterProps {
  nodes: Node[];
  edges: Edge[];
  onTestResults: (results: any) => void;
  testResults: any;
}

export default function WorkflowTesterV2({
  nodes,
  edges,
  onTestResults,
  testResults,
}: WorkflowTesterProps) {
  const [testInput, setTestInput] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [config, setConfig] = useState<ExecutionConfig>({
    apiKeys: {
      openai_api_key: "",
      anthropic_api_key: "",
      google_api_key: "",
      composio_api_key: "",
    },
    userId: "default_user",
  });

  const { 
    isExecuting, 
    result, 
    error, 
    streamingEvents, 
    currentNode, 
    executeWorkflow, 
    executeWorkflowStreaming, 
    reset 
  } = useWorkflowExecution();

  const handleRunTest = async () => {
    if (!testInput.trim()) return;

    try {
      if (useStreaming) {
        await executeWorkflowStreaming(nodes, edges, testInput, config, (event: StreamingEvent) => {
          // Optional: Handle individual streaming events here
          console.log("Streaming event:", event);
        });
        // Result will be set automatically by the streaming hook
        if (result) {
          onTestResults(result);
        }
      } else {
        const executionResult = await executeWorkflow(nodes, edges, testInput, config);
        onTestResults(executionResult);
      }
    } catch (error) {
      console.error("Execution failed:", error);
    }
  };

  const handleStopTest = () => {
    // Note: In a real implementation, you'd want to add cancellation support
    reset();
  };

  const handleReset = () => {
    setTestInput("");
    reset();
    onTestResults(null);
  };

  const exportResults = () => {
    if (!result) return;

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "workflow-execution-results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const updateApiKey = (provider: string, key: string) => {
    setConfig(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [`${provider}_api_key`]: key,
      },
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Workflow Tester
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="text-white/70 hover:text-white"
          >
            <Settings size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Configuration Panel */}
        {showConfig && (
          <Card className="bg-black/20 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/90">API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-white/70 mb-1 block">OpenAI API Key</label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={config.apiKeys?.openai_api_key || ""}
                  onChange={(e) => updateApiKey("openai", e.target.value)}
                  className="bg-black/40 border-white/20 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-white/70 mb-1 block">Anthropic API Key</label>
                <Input
                  type="password"
                  placeholder="sk-ant-..."
                  value={config.apiKeys?.anthropic_api_key || ""}
                  onChange={(e) => updateApiKey("anthropic", e.target.value)}
                  className="bg-black/40 border-white/20 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-white/70 mb-1 block">Google AI API Key</label>
                <Input
                  type="password"
                  placeholder="AI..."
                  value={config.apiKeys?.google_api_key || ""}
                  onChange={(e) => updateApiKey("google", e.target.value)}
                  className="bg-black/40 border-white/20 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-white/70 mb-1 block">Composio API Key</label>
                <Input
                  type="password"
                  placeholder="comp_..."
                  value={config.apiKeys?.composio_api_key || ""}
                  onChange={(e) => updateApiKey("composio", e.target.value)}
                  className="bg-black/40 border-white/20 text-white text-xs"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="streaming"
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="streaming" className="text-xs text-white/70">
                  Enable Streaming (Real-time updates)
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/90">Test Input</label>
          <Input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter your test input..."
            className="bg-black/40 border-white/20 text-white placeholder:text-white/40"
            disabled={isExecuting}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleRunTest}
            disabled={!testInput.trim() || isExecuting || nodes.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play size={16} className="mr-2" />
            {isExecuting ? "Running..." : "Run Test"}
          </Button>
          
          {isExecuting && (
            <Button
              onClick={handleStopTest}
              variant="destructive"
              size="sm"
            >
              <Square size={16} />
            </Button>
          )}
          
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="border-white/20 text-white/70 hover:text-white"
          >
            <RotateCcw size={16} />
          </Button>
        </div>

        {/* Execution Log */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/90">Execution Log</span>
            {result && (
              <Button
                onClick={exportResults}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white"
              >
                <Download size={14} className="mr-1" />
                Export
              </Button>
            )}
          </div>
          
          <div className="bg-black/40 rounded-lg p-3 h-full overflow-y-auto border border-white/10">
            {useStreaming && streamingEvents.length > 0 ? (
              <div className="space-y-1">
                {streamingEvents.map((event: StreamingEvent, index: number) => (
                  <div key={index} className="text-xs font-mono">
                    <span className="text-white/50">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                    {event.type === 'log' && (
                      <span className="text-white/80 ml-2">{event.data}</span>
                    )}
                    {event.type === 'nodeStart' && (
                      <span className="text-blue-400 ml-2">
                        ▶ Starting {event.data.nodeType}: {event.data.nodeName}
                      </span>
                    )}
                    {event.type === 'nodeComplete' && (
                      <span className="text-green-400 ml-2">
                        ✓ Completed {event.data.nodeId}
                      </span>
                    )}
                    {event.type === 'error' && (
                      <span className="text-red-400 ml-2">
                        ✗ Error: {event.data.error}
                      </span>
                    )}
                    {event.type === 'complete' && (
                      <span className="text-green-400 ml-2">
                        🎉 Workflow completed successfully!
                      </span>
                    )}
                  </div>
                ))}
                {isExecuting && currentNode && (
                  <div className="text-yellow-400 text-xs font-mono animate-pulse">
                    <span className="text-white/50">[{new Date().toLocaleTimeString()}]</span>
                    <span className="ml-2">⚡ Processing node: {currentNode}</span>
                  </div>
                )}
              </div>
            ) : result?.data?.executionLog?.length ? (
              <div className="space-y-1">
                {result.data.executionLog.map((log: string, index: number) => (
                  <div key={index} className="text-xs text-white/80 font-mono">
                    <span className="text-white/50">[{index + 1}]</span> {log}
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorDisplay
                error={error}
                errorReport={result?.data?.metadata?.errorReport}
                onRetry={() => handleRunTest()}
                onDismiss={() => reset()}
                className="mb-2"
              />
            ) : isExecuting ? (
              <div className="text-white/60 text-sm">
                <div className="animate-pulse">
                  {useStreaming ? "Initializing streaming execution..." : "Executing workflow..."}
                </div>
              </div>
            ) : (
              <div className="text-white/40 text-sm">
                No execution logs yet. Run a test to see results.
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {result && (
          <Card className="bg-black/20 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                {result.success ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <AlertCircle size={16} className="text-red-400" />
                )}
                <span className="text-sm font-medium text-white">
                  {result.success ? "Execution Successful" : "Execution Failed"}
                </span>
              </div>
              
              <div className="space-y-2 text-xs text-white/70">
                <div>
                  <span className="text-white/50">Duration:</span>{" "}
                  {result.data?.metadata?.duration ? `${result.data.metadata.duration}ms` : "N/A"}
                </div>
                <div>
                  <span className="text-white/50">Nodes Processed:</span>{" "}
                  {Object.keys(result.data?.nodeResults || {}).length}
                </div>
                {result.data?.currentOutput && (
                  <div>
                    <span className="text-white/50">Final Output:</span>
                    <div className="mt-1 p-2 bg-black/40 rounded text-white/80 text-xs font-mono max-h-20 overflow-y-auto">
                      {result.data.currentOutput}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </div>
  );
}
