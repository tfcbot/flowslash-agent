"use client";

import React, {
  useState,
  useCallback,
  DragEvent,
  useMemo,
  useEffect,
  useRef,
} from "react";
import ReactFlow, {
  Controls,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowInstance,
  useNodesState,
  useEdgesState,
  NodeTypes,
  XYPosition,
  MarkerType,
  NodeDragHandler,
  NodeChange,
  EdgeChange,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Squares } from "@/components/ui/squares-background";
import {
  MessageSquare,
  BrainCircuit,
  Puzzle,
  ArrowRightCircle,
  PanelLeftOpen,
  PanelLeftClose,
  Group,
  Share2,
  Upload,
  Loader2,
  Save,
  Play,
  Trash2,
} from "lucide-react";

// Import node components (will create these next)
import InputNode from "@/components/builder-nodes/InputNode";
import OutputNode from "@/components/builder-nodes/OutputNode";
import LLMNode from "@/components/builder-nodes/LLMNode";
import ComposioNode from "@/components/builder-nodes/ComposioNode";
import AgentNode from "@/components/builder-nodes/AgentNode";
import PatternMetaNode from "@/components/builder-nodes/PatternMetaNode";
import FlowingEdge from "@/components/builder-nodes/FlowingEdge";
import ToolsWindow from "@/components/builder-nodes/ToolsWindow";
import AgentBuilder from "@/components/builder-nodes/AgentBuilder";
import WorkflowTester from "@/components/workflow-tester/WorkflowTester";

// Types for node data
export interface InputNodeData {
  label: string;
  query: string;
  onNodeDataChange: (id: string, data: Partial<InputNodeData>) => void;
}

export interface LLMNodeData {
  label: string;
  systemPrompt: string;
  apiKey: string;
  onNodeDataChange: (id: string, data: Partial<LLMNodeData>) => void;
}

export interface ComposioNodeData {
  label: string;
  composioApiKey: string;
  toolAction: string;
  onNodeDataChange: (id: string, data: Partial<ComposioNodeData>) => void;
}

export interface AgentNodeData {
  label: string;
  modelProvider: string;
  modelName: string;
  systemPrompt: string;
  llmApiKey: string;
  composioApiKey: string;
  allowedTools: string;
  onNodeDataChange: (id: string, data: Partial<AgentNodeData>) => void;
}

export default function BuilderPage() {
  // Helper function to create a unique ID
  const getUniqueNodeId = (type: string) =>
    `${type}_${Math.random().toString(36).substr(2, 9)}`;

  // Define modelOptions before it's used in sidebarNodeTypes
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

  // Sidebar item configuration
  const sidebarNodeTypes = [
    {
      type: "customInput",
      label: "Input Node",
      icon: <MessageSquare size={18} />,
      defaultData: { label: "Start Query", query: "" },
    },
    {
      type: "llm",
      label: "LLM Node",
      icon: <BrainCircuit size={18} />,
      defaultData: { label: "LLM Call", systemPrompt: "" },
    },
    {
      type: "composio",
      label: "Composio Tool",
      icon: <Puzzle size={18} />,
      defaultData: { label: "Tool", toolAction: "" },
    },
    {
      type: "customOutput",
      label: "Output Node",
      icon: <ArrowRightCircle size={18} />,
      defaultData: { label: "End Result" },
    },
    {
      type: "agent",
      label: "Agent Node",
      icon: <Group size={18} />,
      defaultData: {
        label: "Agent",
        modelProvider: "openai",
        modelName: modelOptions.openai[0],
        systemPrompt: "",
        allowedTools: "",
      },
    },
  ];

  const allSidebarItems = [
    ...sidebarNodeTypes.map((n) => ({
      key: n.type,
      label: n.label,
      icon: n.icon,
      description:
        n.type === "customInput"
          ? "Start your flow with user input"
          : n.type === "llm"
            ? "Process with AI language model"
            : n.type === "composio"
              ? "Execute specific actions"
              : n.type === "customOutput"
                ? "Display final results"
                : n.type === "agent"
                  ? "LLM agent with tool access"
                  : "",
      dragType: "node",
      dragData: {
        nodeType: n.type,
        nodeLabel: n.label,
        initialData: n.defaultData,
      },
    })),
    {
      key: "augmented-llm",
      label: "Augmented LLM",
      icon: <span className="text-lg font-bold text-[#fff5f5]">A</span>,
      description: "Input → LLM+Tools → Output",
      dragType: "pattern",
      dragData: { pattern: "augmented-llm" },
    },
    {
      key: "prompt-chaining",
      label: "Prompt Chaining",
      icon: <span className="text-lg font-bold text-[#fff5f5]">C</span>,
      description: "Input → Agent 1 → Agent 2 → Output",
      dragType: "pattern",
      dragData: { pattern: "prompt-chaining" },
    },
    {
      key: "routing",
      label: "Routing",
      icon: <span className="text-lg font-bold text-[#fff5f5]">R</span>,
      description: "Input → Router → Agent 1/2 → Output",
      dragType: "pattern",
      dragData: { pattern: "routing" },
    },
    {
      key: "parallelisation",
      label: "Parallelisation",
      icon: <span className="text-lg font-bold text-[#fff5f5]">P</span>,
      description: "Input → Agents (parallel) → Aggregator → Output",
      dragType: "pattern",
      dragData: { pattern: "parallelisation" },
    },
    {
      key: "evaluator-optimiser",
      label: "Evaluator-Optimiser",
      icon: <span className="text-lg font-bold text-[#fff5f5]">E</span>,
      description: "Input → Generator → Evaluator (loop) → Output",
      dragType: "pattern",
      dragData: { pattern: "evaluator-optimiser" },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // State for sidebar visibility
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Track selected nodes
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [clipboardNodes, setClipboardNodes] = useState<Node[] | null>(null);

  // History state
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>(
    [],
  );

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [flowName, setFlowName] = useState("My Workflow");
  const [editingName, setEditingName] = useState(false);

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const filteredSidebarItems = allSidebarItems.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()),
  );

  const [toolsWindowOpen, setToolsWindowOpen] = useState(false);

  const [testResults, setTestResults] = useState<any>(null);

  const [runJoyride, setRunJoyride] = useState(false);

  const onNodeDataChange = useCallback(
    (
      id: string,
      newData: Partial<
        InputNodeData | LLMNodeData | ComposioNodeData | AgentNodeData
      >,
    ) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...newData,
                  _forceRerender: Math.random(),
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      customInput: (props) => (
        <InputNode
          {...props}
          data={{ ...props.data, onNodeDataChange: onNodeDataChange as any }}
        />
      ),
      customOutput: OutputNode,
      llm: (props) => (
        <LLMNode
          {...props}
          data={{ ...props.data, onNodeDataChange: onNodeDataChange as any }}
        />
      ),
      composio: (props) => (
        <ComposioNode
          {...props}
          data={{ ...props.data, onNodeDataChange: onNodeDataChange as any }}
          onOpenToolsWindow={() => {
            setToolsWindowOpen(true);
          }}
        />
      ),
      agent: (props) => (
        <AgentNode
          {...props}
          data={{ ...props.data, onNodeDataChange: onNodeDataChange as any }}
          onOpenToolsWindow={() => {
            setToolsWindowOpen(true);
          }}
        />
      ),
      patternMeta: PatternMetaNode,
    }),
    [onNodeDataChange, setNodes],
  );

  const edgeTypes = useMemo(
    () => ({
      flowing: FlowingEdge,
    }),
    [],
  );

  const handleNameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditingName(false);
  };

  const handleNameBlur = async () => {
    setEditingName(false);
  };

  // Helper to push current state to history
  const pushToHistory = useCallback(() => {
    setHistory((h) => [...h, { nodes, edges }]);
  }, [nodes, edges]);

  // Wrap onNodesChange to push to history
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      pushToHistory();
      onNodesChange(changes);
    },
    [onNodesChange, pushToHistory],
  );

  // Wrap onEdgesChange to push to history
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      pushToHistory();
      onEdgesChange(changes);
    },
    [onEdgesChange, pushToHistory],
  );

  // Undo handler
  useEffect(() => {
    const handleUndo = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (history.length > 0) {
          const prev = history[history.length - 1];
          setNodes(prev.nodes);
          setEdges(prev.edges);
          setHistory((h) => h.slice(0, -1));
        }
      }
    };
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, [history, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!rfInstance) return;

      // Pattern drop logic
      const patternType = event.dataTransfer.getData("application/pattern");
      if (patternType) {
        const position: XYPosition = rfInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Handle pattern creation
        const patternNodes = createPatternNodes(patternType, position);
        setNodes((nds) => [...nds, ...patternNodes.nodes]);
        setEdges((eds) => [...eds, ...patternNodes.edges]);
        return;
      }

      // Node drop logic
      const type = event.dataTransfer.getData("application/reactflow");
      const initialNodeDataJSON = event.dataTransfer.getData(
        "application/nodeInitialData",
      );
      const initialNodeData = JSON.parse(initialNodeDataJSON || "{}");

      if (typeof type === "undefined" || !type) return;

      const position: XYPosition = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let nodeData: any = { ...initialNodeData };
      if (type === "customInput" || type === "llm" || type === "composio") {
        nodeData.onNodeDataChange = onNodeDataChange;
      }

      const newNode: Node = {
        id: getUniqueNodeId(type),
        type,
        position,
        data: nodeData,
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes, setEdges, onNodeDataChange],
  );

  const onDragStart = (
    event: DragEvent,
    nodeType: string,
    nodeLabel: string,
    initialData: object,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData(
      "application/nodeInitialData",
      JSON.stringify(initialData),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const createPatternNodes = (pattern: string, startPosition: XYPosition) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let currentX = startPosition.x;
    let currentY = startPosition.y;
    const nodeSpacing = 250;

    switch (pattern) {
      case "augmented-llm":
        // Input → LLM → Composio → Output
        const inputNode = {
          id: getUniqueNodeId("customInput"),
          type: "customInput",
          position: { x: currentX, y: currentY },
          data: { label: "User Input", query: "" },
        };
        nodes.push(inputNode);
        currentX += nodeSpacing;

        const llmNode = {
          id: getUniqueNodeId("llm"),
          type: "llm",
          position: { x: currentX, y: currentY },
          data: { label: "LLM Processing", systemPrompt: "" },
        };
        nodes.push(llmNode);
        currentX += nodeSpacing;

        const composioNode = {
          id: getUniqueNodeId("composio"),
          type: "composio",
          position: { x: currentX, y: currentY },
          data: { label: "Tool Execution", toolAction: "" },
        };
        nodes.push(composioNode);
        currentX += nodeSpacing;

        const outputNode = {
          id: getUniqueNodeId("customOutput"),
          type: "customOutput",
          position: { x: currentX, y: currentY },
          data: { label: "Final Result" },
        };
        nodes.push(outputNode);

        // Add edges
        edges.push(
          {
            id: `e1-${inputNode.id}-${llmNode.id}`,
            source: inputNode.id,
            target: llmNode.id,
            type: "flowing",
          },
          {
            id: `e2-${llmNode.id}-${composioNode.id}`,
            source: llmNode.id,
            target: composioNode.id,
            type: "flowing",
          },
          {
            id: `e3-${composioNode.id}-${outputNode.id}`,
            source: composioNode.id,
            target: outputNode.id,
            type: "flowing",
          },
        );
        break;

      // Add more patterns as needed
    }

    return { nodes, edges };
  };

  const onNodeDragStop: NodeDragHandler = useCallback((event, node) => {
    console.log("drag stop", node);
  }, []);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes);
  }, []);

  const onCopy = useCallback(() => {
    if (selectedNodes.length === 0) return;
    setClipboardNodes(selectedNodes);
  }, [selectedNodes]);

  const onPaste = useCallback(() => {
    if (!clipboardNodes) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const newNodes = clipboardNodes.map((node) => ({
      ...node,
      id: getUniqueNodeId(node.type || "node"),
      position: {
        x: centerX + (node.position.x - centerX) + 50,
        y: centerY + (node.position.y - centerY) + 50,
      },
    }));

    setNodes((nds) => [...nds, ...newNodes]);
  }, [clipboardNodes, setNodes]);

  const onDelete = useCallback(() => {
    if (selectedNodes.length === 0) return;
    setNodes((nds) =>
      nds.filter((node) => !selectedNodes.find((n) => n.id === node.id)),
    );
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodes.find(
            (n) => n.id === edge.source || n.id === edge.target,
          ),
      ),
    );
  }, [selectedNodes, setNodes, setEdges]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const flowData = {
        name: flowName,
        graph_json: flow,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("current_workflow", JSON.stringify(flowData));
      console.log("Workflow saved to localStorage:", flowData);
    }
  }, [rfInstance, flowName]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flowData = localStorage.getItem("current_workflow");
      if (flowData) {
        const flow = JSON.parse(flowData);
        const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        if (flow.name) setFlowName(flow.name);
        rfInstance?.setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [rfInstance]);

  const onAdd = useCallback(() => {
    const newNode = {
      id: getUniqueNodeId("customInput"),
      type: "customInput",
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: `Added node` },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        onCopy();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        onPaste();
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        onDelete();
      }
    },
    [onCopy, onPaste, onDelete],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  // Load saved workflow on mount
  useEffect(() => {
    const savedWorkflow = localStorage.getItem("current_workflow");
    if (savedWorkflow) {
      try {
        const flow = JSON.parse(savedWorkflow);
        if (flow.graph_json?.nodes) {
          setNodes(flow.graph_json.nodes);
        }
        if (flow.graph_json?.edges) {
          setEdges(flow.graph_json.edges);
        }
        if (flow.name) {
          setFlowName(flow.name);
        }
      } catch (error) {
        console.error("Error loading saved workflow:", error);
      }
    }
  }, [setNodes, setEdges]);

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: "#000000",
        color: "#fff5f5",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Header */}
      <header
        className="h-16 flex items-center justify-between px-6 shrink-0"
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          borderBottom: "1px solid rgba(255, 245, 245, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="p-1.5 rounded-md transition-all duration-200 hover:bg-[#fff5f5]/20 hover:scale-105"
            style={{
              background: "rgba(255, 245, 245, 0.1)",
              color: "#fff5f5",
              backdropFilter: "blur(5px)",
            }}
            title="Toggle Sidebar"
          >
            {isLeftSidebarOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </button>

          {editingName ? (
            <form
              onSubmit={handleNameSubmit}
              className="flex items-center gap-2"
            >
              <Input
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                onBlur={handleNameBlur}
                autoFocus
                className="w-64"
              />
            </form>
          ) : (
            <span
              className="text-xl font-semibold text-[#fff5f5] ml-2 cursor-pointer hover:text-[#fff5f5]"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              {flowName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center gap-1.5 hover:bg-[#fff5f5]/20 hover:scale-105"
            style={{
              background: "rgba(255, 245, 245, 0.1)",
              color: "#fff5f5",
              backdropFilter: "blur(5px)",
            }}
            title="Save Workflow"
          >
            <Save size={16} /> Save
          </button>
          <button
            onClick={() => setRunJoyride(true)}
            className="px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center gap-1.5 hover:bg-[#fff5f5]/20 hover:scale-105"
            style={{
              background: "rgba(255, 245, 245, 0.1)",
              color: "#fff5f5",
              backdropFilter: "blur(5px)",
            }}
            title="Tutorial"
          >
            <Loader2 size={16} /> Tutorial
          </button>
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center gap-1.5 hover:bg-[#fff5f5]/20 hover:scale-105"
            style={{
              background: "rgba(255, 245, 245, 0.1)",
              color: "#fff5f5",
              backdropFilter: "blur(5px)",
            }}
            title="Test Workflow"
          >
            <Share2 size={16} /> Test
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <aside
          className={`flex flex-col shrink-0 overflow-y-auto transition-all duration-300 ease-in-out 
                     ${isLeftSidebarOpen ? "w-72 p-4" : "w-0 p-0 overflow-hidden"}`}
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            borderRight: "1px solid rgba(255, 245, 245, 0.2)",
            backdropFilter: "blur(10px)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 245, 245, 0.3) transparent",
          }}
        >
          {isLeftSidebarOpen && (
            <>
              <div
                className="sticky top-0 z-20 pb-2 mb-3 flex flex-col gap-2 bg-[rgba(0,0,0,0.7)]"
                style={{ borderBottom: "1px solid rgba(255, 245, 245, 0.2)" }}
              >
                <span className="text-xl font-bold text-[#fff5f5] tracking-tight">
                  Node Library
                </span>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search nodes or patterns..."
                  className="mt-1 bg-black/40 border border-[#fff5f5]/20 text-[#fff5f5] placeholder:text-[#fff5f5]/40"
                />
              </div>
              <div
                className="flex flex-col gap-4 flex-grow overflow-y-auto"
                style={{
                  paddingBottom: "1rem",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255, 245, 245, 0.3) transparent",
                  maxHeight: "calc(100vh - 120px)",
                }}
              >
                {filteredSidebarItems.map((item) => (
                  <div
                    key={item.key}
                    onDragStart={(event) => {
                      if (item.dragType === "node") {
                        const nodeData = item.dragData as {
                          nodeType: string;
                          nodeLabel: string;
                          initialData: any;
                        };
                        onDragStart(
                          event,
                          nodeData.nodeType,
                          nodeData.nodeLabel,
                          nodeData.initialData,
                        );
                      } else if (item.dragType === "pattern") {
                        const patternData = item.dragData as {
                          pattern: string;
                        };
                        event.dataTransfer.setData(
                          "application/pattern",
                          patternData.pattern,
                        );
                        event.dataTransfer.effectAllowed = "move";
                      }
                    }}
                    draggable
                    className="group relative p-4 rounded-xl cursor-grab active:scale-[0.97] transition-all duration-200"
                    style={{
                      background: "rgba(255, 245, 245, 0.1)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255, 245, 245, 0.2)",
                    }}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                        style={{
                          background: "rgba(255, 245, 245, 0.15)",
                          backdropFilter: "blur(5px)",
                        }}
                      >
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-[#fff5f5]">
                        {item.label}
                      </span>
                      <div className="text-xs text-[#fff5f5]/70 mt-1">
                        {item.description}
                      </div>
                    </div>
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: "rgba(255, 245, 245, 0.05)",
                        border: "1px solid rgba(255, 245, 245, 0.3)",
                        backdropFilter: "blur(5px)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Main Canvas */}
        <main
          className="flex-grow h-full relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Squares className="absolute inset-0 z-0" />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onNodeDragStop={onNodeDragStop}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            selectionMode={SelectionMode.Partial}
            deleteKeyCode="Delete"
            style={{
              background: "transparent",
            }}
          >
            <Controls />
          </ReactFlow>
        </main>

        {/* Right Sidebar */}
        {isRightSidebarOpen && (
          <div
            className="w-96 p-4 overflow-y-auto"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              borderLeft: "1px solid rgba(255, 245, 245, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <WorkflowTester
              nodes={nodes}
              edges={edges}
              onTestResults={setTestResults}
              testResults={testResults}
            />
          </div>
        )}
      </div>

      {/* Tools Window */}
      {toolsWindowOpen && (
        <ToolsWindow
          isOpen={toolsWindowOpen}
          onClose={() => setToolsWindowOpen(false)}
        />
      )}

      {/* Joyride Tutorial */}
      {/* <Joyride
        steps={[
          {
            target: '.react-flow',
            content: 'This is your workflow canvas. Drag and drop components from the left sidebar to build your AI agent.',
            placement: 'center',
          },
          {
            target: '.react-flow',
            content: 'Connect components by dragging from one node\'s output to another node\'s input.',
            placement: 'center',
          },
        ]}
        run={runJoyride}
        onFinish={() => setRunJoyride(false)}
        continuous
        showProgress
        showSkipButton
      /> */}
    </div>
  );
}
