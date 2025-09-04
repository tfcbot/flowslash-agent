// Type definitions for workflow data structures
// These types bridge ReactFlow and InstantDB formats

import { Node, Edge } from 'reactflow';

// InstantDB data types (matches schema)
export interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
  isPublic: boolean;
  metadata?: Record<string, any>;
}

export interface WorkflowNodeData {
  id: string;
  workflowId: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  source?: 'human' | 'agent';
  agentId?: string;
}

export interface WorkflowEdgeData {
  id: string;
  workflowId: string;
  sourceNode: string;
  targetNode: string;
  type?: string;
  data?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  source?: 'human' | 'agent';
}

// Conversion helpers between ReactFlow and InstantDB formats
export function convertNodeToReactFlow(dbNode: WorkflowNodeData): Node {
  return {
    id: dbNode.id,
    type: dbNode.type,
    position: dbNode.position,
    data: {
      ...dbNode.data,
      // Add metadata for tracking
      _instantdbId: dbNode.id,
      _source: dbNode.source,
      _agentId: dbNode.agentId,
    }
  };
}

export function convertEdgeToReactFlow(dbEdge: WorkflowEdgeData): Edge {
  return {
    id: dbEdge.id,
    source: dbEdge.sourceNode,
    target: dbEdge.targetNode,
    type: dbEdge.type,
    data: dbEdge.data,
  };
}

export function convertNodeFromReactFlow(
  reactFlowNode: Node, 
  workflowId: string, 
  source: 'human' | 'agent' = 'human'
): Omit<WorkflowNodeData, 'createdAt' | 'updatedAt'> {
  const { _instantdbId, _source, _agentId, ...cleanData } = reactFlowNode.data || {};
  
  return {
    id: reactFlowNode.id,
    workflowId,
    type: reactFlowNode.type || 'unknown',
    position: reactFlowNode.position,
    data: cleanData,
    source,
    agentId: _agentId,
  };
}

export function convertEdgeFromReactFlow(
  reactFlowEdge: Edge, 
  workflowId: string,
  source: 'human' | 'agent' = 'human'
): Omit<WorkflowEdgeData, 'createdAt' | 'updatedAt'> {
  return {
    id: reactFlowEdge.id,
    workflowId,
    sourceNode: reactFlowEdge.source,
    targetNode: reactFlowEdge.target,
    type: reactFlowEdge.type,
    data: reactFlowEdge.data,
    source,
  };
}

// Legacy localStorage format for migration
export interface LegacyWorkflowFormat {
  name: string;
  graph_json?: {
    nodes: Node[];
    edges: Edge[];
  };
  nodes?: Node[];
  edges?: Edge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}