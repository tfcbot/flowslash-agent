import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, RotateCcw, FileText, Settings } from "lucide-react";

interface WorkflowTesterProps {
  nodes: any[];
  edges: any[];
  onTestResults: (results: any) => void;
  testResults: any;
}

export default function WorkflowTester({
  nodes,
  edges,
  onTestResults,
  testResults,
}: WorkflowTesterProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const handleRunTest = async () => {
    if (!testInput.trim()) return;

    setIsRunning(true);
    setExecutionLog([]);

    // Simulate workflow execution
    const log = [`Starting workflow test with input: "${testInput}"`];
    setExecutionLog(log);

    try {
      // Simulate processing through nodes
      const inputNodes = nodes.filter((node) => node.type === "customInput");
      const llmNodes = nodes.filter((node) => node.type === "llm");
      const composioNodes = nodes.filter((node) => node.type === "composio");
      const outputNodes = nodes.filter((node) => node.type === "customOutput");

      log.push(
        `Found ${inputNodes.length} input nodes, ${llmNodes.length} LLM nodes, ${composioNodes.length} Composio nodes, ${outputNodes.length} output nodes`,
      );
      setExecutionLog([...log]);

      // Simulate execution steps
      await new Promise((resolve) => setTimeout(resolve, 1000));
      log.push("Processing input through workflow...");
      setExecutionLog([...log]);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      log.push("Executing LLM operations...");
      setExecutionLog([...log]);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      log.push("Running Composio tool actions...");
      setExecutionLog([...log]);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      log.push("Workflow completed successfully!");
      setExecutionLog([...log]);

      // Mock results
      const results = {
        success: true,
        input: testInput,
        output: `Processed result for: "${testInput}"`,
        executionTime: "4.5s",
        nodesProcessed: nodes.length,
        timestamp: new Date().toISOString(),
      };

      onTestResults(results);
    } catch (error) {
      log.push(`Error: ${error}`);
      setExecutionLog([...log]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStopTest = () => {
    setIsRunning(false);
    setExecutionLog((prev) => [...prev, "Test stopped by user"]);
  };

  const handleReset = () => {
    setTestInput("");
    setExecutionLog([]);
    onTestResults(null);
  };

  const exportResults = () => {
    if (!testResults) return;

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(testResults, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "workflow-test-results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={16} className="text-blue-500" />
        <h3 className="font-medium text-gray-900 dark:text-white">
          Workflow Tester
        </h3>
      </div>

      <div className="space-y-4 flex-1">
        {/* Test Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Input
          </label>
          <Input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter test input for your workflow..."
            className="h-9"
            disabled={isRunning}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleRunTest}
            disabled={isRunning || !testInput.trim()}
            className="flex-1"
          >
            <Play size={16} className="mr-2" />
            {isRunning ? "Running..." : "Run Test"}
          </Button>
          <Button
            variant="outline"
            onClick={handleStopTest}
            disabled={!isRunning}
            className="flex-1"
          >
            <Square size={16} className="mr-2" />
            Stop
          </Button>
          <Button variant="outline" onClick={handleReset} size="sm">
            <RotateCcw size={16} />
          </Button>
        </div>

        {/* Execution Log */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Execution Log
            </label>
            {testResults && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportResults}
                className="h-6 text-xs"
              >
                Export Results
              </Button>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 p-3 h-32 overflow-y-auto">
            {executionLog.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                No execution log yet. Run a test to see the workflow execution
                steps.
              </div>
            ) : (
              <div className="space-y-1">
                {executionLog.map((log, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      [{new Date().toLocaleTimeString()}]
                    </span>{" "}
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Test Completed Successfully
              </span>
            </div>
            <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
              <div>
                <strong>Input:</strong> {testResults.input}
              </div>
              <div>
                <strong>Output:</strong> {testResults.output}
              </div>
              <div>
                <strong>Execution Time:</strong> {testResults.executionTime}
              </div>
              <div>
                <strong>Nodes Processed:</strong> {testResults.nodesProcessed}
              </div>
            </div>
          </div>
        )}

        {/* Workflow Stats */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Workflow Statistics
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div>Total Nodes: {nodes.length}</div>
            <div>Total Edges: {edges.length}</div>
            <div>
              Input Nodes:{" "}
              {nodes.filter((n) => n.type === "customInput").length}
            </div>
            <div>
              Output Nodes:{" "}
              {nodes.filter((n) => n.type === "customOutput").length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
