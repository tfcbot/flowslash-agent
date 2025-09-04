// Custom hook for managing workflow state with InstantDB
import { useCallback, useMemo } from 'react';
import { Node, Edge, NodeChange, EdgeChange, addEdge, Connection } from 'reactflow';
import db, { id } from '../db';
import { convertNodeToReactFlow, convertEdgeToReactFlow, convertNodeFromReactFlow, convertEdgeFromReactFlow } from '../types/workflow';

export interface UseWorkflowStateProps {
  workflowId: string;
  userId?: string;
}

export function useWorkflowState({ workflowId, userId }: UseWorkflowStateProps) {
  // Query workflow data from InstantDB
  const { data, isLoading, error } = db.useQuery({
    workflows: {
      $: { where: { id: workflowId } }
    },
    workflowNodes: {
      $: { where: { workflowId } }
    },
    workflowEdges: {
      $: { where: { workflowId } }
    }
  });

  const workflow = data?.workflows?.[0];
  const dbNodes = data?.workflowNodes || [];
  const dbEdges = data?.workflowEdges || [];

  // Convert InstantDB data to ReactFlow format
  const nodes: Node[] = useMemo(() => 
    dbNodes.map((node: any) => convertNodeToReactFlow(node)), [dbNodes]
  );

  const edges: Edge[] = useMemo(() => 
    dbEdges.map((edge: any) => convertEdgeToReactFlow(edge)), [dbEdges]
  );

  // Handle node changes (position, selection, etc.)
  const onNodesChange = useCallback(async (changes: NodeChange[]) => {
    for (const change of changes) {
      switch (change.type) {
        case 'position':
          if (change.position && change.id) {
            await db.transact(
              db.tx.workflowNodes[change.id].update({
                position: change.position,
                updatedAt: Date.now(),
                source: 'human',
              })
            );
          }
          break;
        case 'remove':
          if (change.id) {
            await db.transact([
              db.tx.workflowNodes[change.id].delete(),
              // Also delete connected edges
              ...dbEdges
                .filter((edge: any) => edge.sourceNode === change.id || edge.targetNode === change.id)
                .map((edge: any) => db.tx.workflowEdges[edge.id].delete())
            ]);
          }
          break;
        case 'select':
          // Handle selection change for presence/collaboration
          if (userId) {
            const selectedNodeIds = nodes
              .filter(node => node.selected)
              .map(node => node.id);
            
            await db.transact(
              db.tx.presence[`${userId}-${workflowId}`].update({
                workflowId,
                userId,
                userName: 'Current User', // TODO: Get from auth
                selectedNodeIds,
                lastSeen: Date.now(),
                isOnline: true,
              })
            );
          }
          break;
      }
    }
  }, [workflowId, userId, dbEdges, nodes]);

  // Handle edge changes
  const onEdgesChange = useCallback(async (changes: EdgeChange[]) => {
    for (const change of changes) {
      switch (change.type) {
        case 'remove':
          if (change.id) {
            await db.transact(
              db.tx.workflowEdges[change.id].delete()
            );
          }
          break;
        case 'select':
          // Handle edge selection if needed
          break;
      }
    }
  }, []);

  // Handle new connections
  const onConnect = useCallback(async (params: Edge | Connection) => {
    const edgeId = id();
    const now = Date.now();
    
    await db.transact(
      db.tx.workflowEdges[edgeId].update({
        id: edgeId,
        workflowId,
        sourceNode: params.source || '',
        targetNode: params.target || '',
        type: 'type' in params ? params.type || 'default' : 'default',
        data: 'data' in params ? params.data || {} : {},
        createdAt: now,
        updatedAt: now,
        source: 'human',
      })
    );
  }, [workflowId]);

  // Add new node
  const addNode = useCallback(async (nodeData: Partial<Node>) => {
    const nodeId = id();
    const now = Date.now();
    
    const dbNodeData = convertNodeFromReactFlow(
      {
        id: nodeId,
        position: { x: 0, y: 0 },
        ...nodeData,
      } as Node,
      workflowId,
      'human'
    );

    await db.transact(
      db.tx.workflowNodes[nodeId].update({
        ...dbNodeData,
        id: nodeId,
        createdAt: now,
        updatedAt: now,
      })
    );

    return nodeId;
  }, [workflowId]);

  // Update node data
  const updateNodeData = useCallback(async (
    nodeId: string, 
    newData: Record<string, any>
  ) => {
    const existingNode = dbNodes.find((n: any) => n.id === nodeId);
    if (existingNode) {
      await db.transact(
        db.tx.workflowNodes[nodeId].update({
          data: { ...existingNode.data, ...newData },
          updatedAt: Date.now(),
          source: 'human',
        })
      );
    }
  }, [dbNodes]);

  // Delete node
  const deleteNode = useCallback(async (nodeId: string) => {
    const connectedEdges = dbEdges.filter(
      (edge: any) => edge.sourceNode === nodeId || edge.targetNode === nodeId
    );

    await db.transact([
      db.tx.workflowNodes[nodeId].delete(),
      ...connectedEdges.map((edge: any) => db.tx.workflowEdges[edge.id].delete())
    ]);
  }, [dbEdges]);

  // Duplicate node
  const duplicateNode = useCallback(async (nodeId: string) => {
    const existingNode = dbNodes.find((n: any) => n.id === nodeId);
    if (existingNode) {
      const newNodeId = id();
      const now = Date.now();
      
      await db.transact(
        db.tx.workflowNodes[newNodeId].update({
          ...existingNode,
          id: newNodeId,
          position: {
            x: existingNode.position.x + 50,
            y: existingNode.position.y + 50,
          },
          createdAt: now,
          updatedAt: now,
        })
      );
      
      return newNodeId;
    }
  }, [dbNodes]);

  return {
    // Data
    workflow,
    nodes,
    edges,
    isLoading,
    error,
    
    // Event handlers for ReactFlow
    onNodesChange,
    onEdgesChange,
    onConnect,
    
    // CRUD operations
    addNode,
    updateNodeData,
    deleteNode,
    duplicateNode,
  };
}