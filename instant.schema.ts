import { i } from '@instantdb/react';

// InstantDB Schema for Real-Time Collaborative Workflow Editor
const graph = i.graph(
  {
    // Core workflow entity
    workflows: i.entity({
      id: i.string(),
      name: i.string(),
      description: i.string().optional(),
      version: i.string(),
      createdAt: i.number(),
      updatedAt: i.number(),
      ownerId: i.string(), // User who created the workflow
      isPublic: i.boolean(),
      metadata: i.json().optional(), // Additional workflow metadata
    }),

    // Workflow nodes (LLM, Composio, Input, Output, etc.)
    workflowNodes: i.entity({
      id: i.string(),
      workflowId: i.string(),
      type: i.string(), // 'customInput', 'llm', 'composio', 'agent', 'customOutput'
      position: i.json(), // { x: number, y: number }
      data: i.json(), // Node-specific data (label, model, tools, etc.)
      createdAt: i.number(),
      updatedAt: i.number(),
      source: i.string().optional(), // 'human' | 'agent' - who created/modified this node
      agentId: i.string().optional(), // If created by an agent
    }),

    // Workflow edges (connections between nodes)
    workflowEdges: i.entity({
      id: i.string(),
      workflowId: i.string(),
      sourceNode: i.string(), // Source node ID
      targetNode: i.string(), // Target node ID
      type: i.string().optional(), // Edge type for ReactFlow
      data: i.json().optional(), // Edge-specific data
      createdAt: i.number(),
      updatedAt: i.number(),
      source: i.string().optional(), // 'human' | 'agent'
    }),

    // Real-time presence for collaborative editing
    presence: i.entity({
      id: i.string(),
      workflowId: i.string(),
      userId: i.string(),
      userName: i.string(),
      cursor: i.json().optional(), // Current cursor position
      selectedNodeIds: i.json().optional(), // Array of selected node IDs
      lastSeen: i.number(),
      isOnline: i.boolean(),
    }),

    // Agent operations log for transparency
    agentOperations: i.entity({
      id: i.string(),
      workflowId: i.string(),
      agentId: i.string(),
      operation: i.string(), // 'create', 'update', 'delete', 'optimize'
      targetType: i.string(), // 'node' | 'edge'
      targetId: i.string(),
      oldData: i.json().optional(),
      newData: i.json().optional(),
      reason: i.string().optional(), // Why the agent made this change
      timestamp: i.number(),
    }),

    // Users for collaboration
    users: i.entity({
      id: i.string(),
      email: i.string(),
      name: i.string(),
      avatar: i.string().optional(),
      createdAt: i.number(),
    }),
  },
  {} // Empty links object for now
);

// Export schema for use in client and server
export default graph;
export type Schema = typeof graph;