"use client";

import React, {
  useState,
  useCallback,
  DragEvent,
  useMemo,
  useEffect,
  useRef,
} from "react";

// InstantDB imports
import db, { id } from "@/lib/db";
import { useWorkflowState } from "@/lib/hooks/useWorkflowState";
import { autoMigrateFromLocalStorage, createNewWorkflow } from "@/lib/utils/workflowMigration";
import { PresenceIndicator } from "@/components/collaboration/PresenceIndicator";
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
import WorkflowTesterV2 from "@/components/workflow-tester/WorkflowTesterV2";

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

  // InstantDB state management
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [userId] = useState(() => process.env.USER_ID || 'default-user-123'); // TODO: Replace with real auth
  
  // Use InstantDB for workflow state management
  const workflowState = useWorkflowState({ 
    workflowId: currentWorkflowId || 'temp', 
    userId 
  });

  // ReactFlow instance and agent state
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // State for sidebar visibility
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(true);

  // Extract data from InstantDB workflow state
  const { nodes, edges, workflow, isLoading, error, onNodesChange, onEdgesChange, onConnect, updateNodeData, deleteNode, duplicateNode } = workflowState;

  // Track selected nodes
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [clipboardNodes, setClipboardNodes] = useState<Node[] | null>(null);

  // History state (TODO: Move to InstantDB for collaborative undo/redo)
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>(
    [],
  );

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [flowName, setFlowName] = useState(workflow?.name || "My Workflow");
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


  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    nodeId?: string;
  }>({ show: false, x: 0, y: 0 });

  const onNodeDataChange = useCallback(
    (
      id: string,
      newData: Partial<
        InputNodeData | LLMNodeData | ComposioNodeData | AgentNodeData
      >,
    ) => {
      // Update node data in InstantDB
      updateNodeData(id, {
        ...newData,
        _forceRerender: Math.random(),
      });
    },
    [updateNodeData],
  );

  // Enhanced node deletion with proper cleanup
  const onNodeDelete = useCallback((nodeId: string) => {
    // Delete node and connected edges in InstantDB
    deleteNode(nodeId);
  }, [deleteNode]);

  // Node duplication functionality
  const onNodeDuplicate = useCallback((nodeId: string) => {
    // Duplicate node in InstantDB
    duplicateNode(nodeId);
  }, [duplicateNode]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      customInput: (props) => (
        <InputNode
          {...props}
          data={{ 
            ...props.data, 
            onNodeDataChange: onNodeDataChange as any,
            onDelete: onNodeDelete,
            onDuplicate: onNodeDuplicate
          }}
        />
      ),
      customOutput: (props) => (
        <OutputNode
          {...props}
          data={{ 
            ...props.data,
            onDelete: onNodeDelete,
            onDuplicate: onNodeDuplicate
          }}
        />
      ),
      llm: (props) => (
        <LLMNode
          {...props}
          data={{ 
            ...props.data, 
            onNodeDataChange: onNodeDataChange as any,
            onDelete: onNodeDelete,
            onDuplicate: onNodeDuplicate
          }}
        />
      ),
      composio: (props) => (
        <ComposioNode
          {...props}
          data={{ 
            ...props.data, 
            onNodeDataChange: onNodeDataChange as any,
            onDelete: onNodeDelete,
            onDuplicate: onNodeDuplicate
          }}
          onOpenToolsWindow={() => {
            setToolsWindowOpen(true);
          }}
        />
      ),
      agent: (props) => (
        <AgentNode
          {...props}
          data={{ 
            ...props.data, 
            onNodeDataChange: onNodeDataChange as any,
            onDelete: onNodeDelete,
            onDuplicate: onNodeDuplicate
          }}
          onOpenToolsWindow={() => {
            setToolsWindowOpen(true);
          }}
        />
      ),
      patternMeta: PatternMetaNode,
    }),
    [onNodeDataChange, onNodeDelete, onNodeDuplicate],
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

  // Helper to push current state to history (TODO: Move to InstantDB for collaborative undo/redo)
  const pushToHistory = useCallback(() => {
    setHistory((h) => [...h, { nodes, edges }]);
  }, [nodes, edges]);

  // Undo handler (TODO: Implement collaborative undo/redo with InstantDB)
  useEffect(() => {
    const handleUndo = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        console.log('Undo requested - collaborative undo/redo coming soon!');
        // TODO: Implement with InstantDB operation history
      }
    };
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, []);

  // onConnect is now handled by the useWorkflowState hook

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event: DragEvent) => {
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
        if (currentWorkflowId) {
          const patternNodes = createPatternNodes(patternType, position);
          
          // Add pattern nodes and edges to InstantDB
          for (const node of patternNodes.nodes) {
            await workflowState.addNode(node);
          }
          
          // Add pattern edges (would need to implement addEdge in workflowState)
          for (const edge of patternNodes.edges) {
            await workflowState.onConnect(edge);
          }
        }
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
      if (type === "customInput" || type === "llm" || type === "composio" || type === "agent") {
        nodeData.onNodeDataChange = onNodeDataChange;
        nodeData.onDelete = onNodeDelete;
        nodeData.onDuplicate = onNodeDuplicate;
      } else if (type === "customOutput") {
        nodeData.onDelete = onNodeDelete;
        nodeData.onDuplicate = onNodeDuplicate;
      }

      // Add node to InstantDB instead of local state
      if (currentWorkflowId) {
        await workflowState.addNode({
          id: getUniqueNodeId(type),
          type,
          position,
          data: nodeData,
        });
      }
    },
    [rfInstance, currentWorkflowId, workflowState, onNodeDataChange, onNodeDelete, onNodeDuplicate],
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

  const onPaste = useCallback(async () => {
    if (!clipboardNodes || !currentWorkflowId) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Add each cloned node to InstantDB
    for (const node of clipboardNodes) {
      await workflowState.addNode({
        ...node,
        id: getUniqueNodeId(node.type || "node"),
        position: {
          x: centerX + (node.position.x - centerX) + 50,
          y: centerY + (node.position.y - centerY) + 50,
        },
      });
    }
  }, [clipboardNodes, currentWorkflowId, workflowState]);

  // Enhanced deletion with better UX
  const onDelete = useCallback(async () => {
    if (selectedNodes.length === 0) return;
    
    // Delete selected nodes (and their connected edges) via InstantDB
    for (const node of selectedNodes) {
      await deleteNode(node.id);
    }
    
    // Clear selection after deletion
    setSelectedNodes([]);
  }, [selectedNodes, deleteNode]);



  // onRestore is no longer needed - workflow data is automatically synced from InstantDB

  const onAdd = useCallback(async () => {
    if (currentWorkflowId) {
      await workflowState.addNode({
        id: getUniqueNodeId("customInput"),
        type: "customInput",
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: { 
          label: `Added node`,
          onNodeDataChange: onNodeDataChange,
          onDelete: onNodeDelete,
          onDuplicate: onNodeDuplicate,
        },
      });
    }
  }, [currentWorkflowId, workflowState, onNodeDataChange, onNodeDelete, onNodeDuplicate]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
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
      if ((event.ctrlKey || event.metaKey) && event.key === "a") {
        event.preventDefault();
        // Select all nodes
        setSelectedNodes(nodes);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        event.preventDefault();
        // Duplicate selected nodes
        onPaste();
      }
      if (event.key === "Escape") {
        // Clear selection and close context menu
        setSelectedNodes([]);
        setContextMenu({ show: false, x: 0, y: 0 });
      }
    },
    [onCopy, onPaste, onDelete, nodes],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    
    // Close context menu on click outside
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0 });
    };
    document.addEventListener("click", handleClickOutside);
    
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onKeyDown]);

  // Context menu handler
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  // Context menu actions
  const contextMenuActions = {
    duplicate: () => {
      if (contextMenu.nodeId) {
        const nodeToClone = nodes.find((n: any) => n.id === contextMenu.nodeId);
        if (nodeToClone) {
          setClipboardNodes([nodeToClone]);
          onPaste();
        }
      }
      setContextMenu({ show: false, x: 0, y: 0 });
    },
    delete: () => {
      if (contextMenu.nodeId) {
        onNodeDelete(contextMenu.nodeId);
      }
      setContextMenu({ show: false, x: 0, y: 0 });
    },
    copy: () => {
      if (contextMenu.nodeId) {
        const nodeToCopy = nodes.find((n: any) => n.id === contextMenu.nodeId);
        if (nodeToCopy) {
          setClipboardNodes([nodeToCopy]);
        }
      }
      setContextMenu({ show: false, x: 0, y: 0 });
    },
  };

  // Initialize workflow on mount - migrate from localStorage or create new
  useEffect(() => {
    const initializeWorkflow = async () => {
      try {
        // Try to migrate existing localStorage workflow
        const migratedWorkflowId = await autoMigrateFromLocalStorage(userId);
        
        if (migratedWorkflowId) {
          setCurrentWorkflowId(migratedWorkflowId);
          console.log('Successfully migrated workflow from localStorage');
        } else {
          // Create a new workflow if no existing data
          const newWorkflowId = await createNewWorkflow('My Workflow', userId);
          setCurrentWorkflowId(newWorkflowId);
          console.log('Created new workflow');
        }
      } catch (error) {
        console.error('Error initializing workflow:', error);
        // Fallback: create a basic workflow
        const fallbackId = await createNewWorkflow('Fallback Workflow', userId);
        setCurrentWorkflowId(fallbackId);
      }
    };

    if (!currentWorkflowId) {
      initializeWorkflow();
    }
  }, [userId, currentWorkflowId]);

  // Show loading state while workflow is initializing
  if (!currentWorkflowId || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-[#fff5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fff5f5] mx-auto mb-4"></div>
          <p>{!currentWorkflowId ? 'Initializing workflow...' : 'Loading workflow data...'}</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an issue
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-[#fff5f5]">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading workflow: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

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
            onClick={() => setIsNodeLibraryOpen(!isNodeLibraryOpen)}
            className="p-1.5 rounded-md transition-all duration-200 hover:bg-[#fff5f5]/20 hover:scale-105"
            style={{
              background: "rgba(255, 245, 245, 0.1)",
              color: "#fff5f5",
              backdropFilter: "blur(5px)",
            }}
            title="Toggle Node Library"
          >
            {isNodeLibraryOpen ? (
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

        {/* Main Canvas */}
        <main
          className="flex-1 h-full relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Squares className="absolute inset-0 z-0" />
                      <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
            onInit={setRfInstance}
            onNodeDragStop={onNodeDragStop}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            selectionMode={SelectionMode.Partial}
            deleteKeyCode={["Delete", "Backspace"]}
            multiSelectionKeyCode={["Meta", "Ctrl"]}
            panOnDrag={[1, 2]}
            selectionKeyCode={["Shift"]}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnScroll={false}
            preventScrolling={true}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            style={{
              background: "transparent",
              width: "100%",
              height: "100%",
            }}
            onNodesDelete={(deletedNodes) => {
              // Nodes are automatically deleted via InstantDB in onNodesChange
              console.log('Nodes deleted via keyboard:', deletedNodes.map(n => n.id));
            }}
            onNodeContextMenu={onNodeContextMenu}
            connectionLineStyle={{ stroke: '#fff5f5', strokeWidth: 2, strokeDasharray: '5,5' }}
            defaultEdgeOptions={{
              style: { stroke: '#fff5f5', strokeWidth: 2, strokeDasharray: '5,5' },
              type: 'flowing',
              markerEnd: { type: MarkerType.ArrowClosed, color: '#fff5f5' },
            }}
          >
            <Controls />
          </ReactFlow>
        </main>

        {/* Right Sidebar - Node Library */}
        {isNodeLibraryOpen && (
          <aside
            className="w-72 p-4 flex flex-col shrink-0 overflow-y-auto"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              borderLeft: "1px solid rgba(255, 245, 245, 0.2)",
              backdropFilter: "blur(10px)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 245, 245, 0.3) transparent",
            }}
          >
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
          </aside>
        )}

        {/* Right Sidebar - Workflow Tester */}
        {isRightSidebarOpen && (
          <div
            className="w-96 p-4 overflow-y-auto"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              borderLeft: "1px solid rgba(255, 245, 245, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <WorkflowTesterV2
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

      {/* Real-time Collaboration Presence */}
      {currentWorkflowId && (
        <PresenceIndicator 
          workflowId={currentWorkflowId} 
          currentUserId={userId} 
        />
      )}

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-50 bg-black/90 border border-[#fff5f5]/20 rounded-lg shadow-xl backdrop-blur-sm"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            <button
              onClick={contextMenuActions.duplicate}
              className="w-full px-4 py-2 text-left text-sm text-[#fff5f5] hover:bg-[#fff5f5]/10 transition-colors"
            >
              Duplicate Node
            </button>
            <button
              onClick={contextMenuActions.copy}
              className="w-full px-4 py-2 text-left text-sm text-[#fff5f5] hover:bg-[#fff5f5]/10 transition-colors"
            >
              Copy Node
            </button>
            <div className="border-t border-[#fff5f5]/20 my-1" />
            <button
              onClick={contextMenuActions.delete}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Delete Node
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
