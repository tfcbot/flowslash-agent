// Agent interface for workflow manipulation using InstantDB Admin SDK
import { init } from '@instantdb/admin';
import schema from '../../instant.schema';

// Initialize admin client for agent operations
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!ADMIN_TOKEN || !APP_ID) {
  throw new Error('INSTANT_ADMIN_TOKEN and NEXT_PUBLIC_INSTANT_APP_ID environment variables are required for agent operations');
}

const adminDb = init({ 
  appId: APP_ID, 
  adminToken: ADMIN_TOKEN,
  schema 
});

export class WorkflowAgent {
  private agentId: string;
  private db = adminDb;

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  /**
   * Add a new node to a workflow
   */
  async addNode(
    workflowId: string,
    nodeData: {
      type: string;
      position: { x: number; y: number };
      data: Record<string, any>;
    }
  ): Promise<string> {
    const nodeId = this.generateId();
    const now = Date.now();

    await this.db.transact(
      this.db.tx.workflowNodes[nodeId].update({
        id: nodeId,
        workflowId,
        type: nodeData.type,
        position: nodeData.position,
        data: nodeData.data,
        createdAt: now,
        updatedAt: now,
        source: 'agent',
        agentId: this.agentId,
      })
    );

    // Log the operation
    await this.logOperation(workflowId, 'create', 'node', nodeId, null, nodeData);

    return nodeId;
  }

  /**
   * Update an existing node
   */
  async updateNode(
    workflowId: string,
    nodeId: string,
    updates: {
      position?: { x: number; y: number };
      data?: Record<string, any>;
      type?: string;
    }
  ): Promise<void> {
    // Get current node data for logging
    const currentNode = await this.db.query({
      workflowNodes: {
        $: { where: { id: nodeId } }
      }
    });

    const oldData = currentNode.workflowNodes?.[0];

    await this.db.transact(
      this.db.tx.workflowNodes[nodeId].update({
        ...updates,
        updatedAt: Date.now(),
        source: 'agent',
        agentId: this.agentId,
      })
    );

    // Log the operation
    await this.logOperation(workflowId, 'update', 'node', nodeId, oldData, updates);
  }

  /**
   * Delete a node and its connected edges
   */
  async deleteNode(workflowId: string, nodeId: string): Promise<void> {
    // Get current node and connected edges for logging
    const nodeQuery = await this.db.query({
      workflowNodes: {
        $: { where: { id: nodeId } }
      },
      workflowEdges: {
        $: { where: { workflowId } }
      }
    });

    const nodeData = nodeQuery.workflowNodes?.[0];
    const connectedEdges = nodeQuery.workflowEdges?.filter(
      (edge: any) => edge.sourceNode === nodeId || edge.targetNode === nodeId
    ) || [];

    // Delete node and connected edges
    await this.db.transact([
      this.db.tx.workflowNodes[nodeId].delete(),
      ...connectedEdges.map((edge: any) => this.db.tx.workflowEdges[edge.id].delete())
    ]);

    // Log the operation
    await this.logOperation(workflowId, 'delete', 'node', nodeId, nodeData, null);
  }

  /**
   * Add an edge between two nodes
   */
  async addEdge(
    workflowId: string,
    source: string,
    target: string,
    edgeData?: { type?: string; data?: Record<string, any> }
  ): Promise<string> {
    const edgeId = this.generateId();
    const now = Date.now();

    await this.db.transact(
      this.db.tx.workflowEdges[edgeId].update({
        id: edgeId,
        workflowId,
        sourceNode: source,
        targetNode: target,
        type: edgeData?.type,
        data: edgeData?.data,
        createdAt: now,
        updatedAt: now,
        source: 'agent',
      })
    );

    // Log the operation
    await this.logOperation(workflowId, 'create', 'edge', edgeId, null, { sourceNode: source, targetNode: target, ...edgeData });

    return edgeId;
  }

  /**
   * Delete an edge
   */
  async deleteEdge(workflowId: string, edgeId: string): Promise<void> {
    // Get current edge for logging
    const edgeQuery = await this.db.query({
      workflowEdges: {
        $: { where: { id: edgeId } }
      }
    });

    const edgeData = edgeQuery.workflowEdges?.[0];

    await this.db.transact(
      this.db.tx.workflowEdges[edgeId].delete()
    );

    // Log the operation
    await this.logOperation(workflowId, 'delete', 'edge', edgeId, edgeData, null);
  }

  /**
   * Get workflow data for analysis
   */
  async getWorkflow(workflowId: string) {
    return await this.db.query({
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
  }

  /**
   * Optimize workflow by analyzing and suggesting improvements
   */
  async optimizeWorkflow(workflowId: string): Promise<{
    suggestions: Array<{
      type: 'add' | 'update' | 'delete';
      target: 'node' | 'edge';
      reason: string;
      action: () => Promise<void>;
    }>;
  }> {
    const workflowData = await this.getWorkflow(workflowId);
    const workflow = workflowData.workflows?.[0];
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const nodes = workflowData.workflowNodes || [];
    const edges = workflowData.workflowEdges || [];
    const suggestions = [];

    // Example optimization: Add error handling nodes
    const hasErrorHandling = nodes.some((node: any) => 
      node.data?.label?.toLowerCase().includes('error') ||
      node.data?.label?.toLowerCase().includes('fallback')
    );

    if (!hasErrorHandling && nodes.length > 2) {
      suggestions.push({
        type: 'add' as const,
        target: 'node' as const,
        reason: 'Add error handling for robust workflow execution',
        action: async () => {
          await this.addNode(workflowId, {
            type: 'llm',
            position: { x: 300, y: 300 },
            data: {
              label: 'Agent: Error Handler',
              model: 'gpt-4o-mini',
              systemPrompt: 'Handle errors gracefully and provide fallback responses',
              temperature: 0.1,
            }
          });
        }
      });
    }

    // Example optimization: Optimize LLM node parameters
    const llmNodes = nodes.filter((node: any) => node.type === 'llm');
    for (const llmNode of llmNodes) {
      if (llmNode.data?.temperature > 0.7) {
        suggestions.push({
          type: 'update' as const,
          target: 'node' as const,
          reason: `Reduce temperature for more consistent outputs in ${llmNode.data?.label || 'LLM node'}`,
          action: async () => {
            await this.updateNode(workflowId, llmNode.id, {
              data: {
                ...llmNode.data,
                temperature: 0.3,
              }
            });
          }
        });
      }
    }

    return { suggestions };
  }

  /**
   * Monitor workflow for changes and react automatically
   */
  async startMonitoring(workflowId: string, callback?: (change: any) => void) {
    // Note: This would typically use InstantDB's subscription features
    // For now, implementing as polling - in production you'd use websockets
    
    console.log(`Agent ${this.agentId} started monitoring workflow ${workflowId}`);
    
    // Example: React to new nodes by optimizing them
    const checkForChanges = async () => {
      try {
        const recentOperations = await this.db.query({
          agentOperations: {
            $: { 
              where: { 
                workflowId,
                timestamp: { $gt: Date.now() - 5000 } // Last 5 seconds
              } 
            }
          }
        });

        // Process recent changes
        for (const operation of recentOperations.agentOperations || []) {
          if (operation.agentId !== this.agentId && operation.operation === 'create') {
            // Another user or agent created something, analyze and suggest optimizations
            const suggestions = await this.optimizeWorkflow(workflowId);
            
            if (callback) {
              callback({
                type: 'optimization_suggestions',
                suggestions: suggestions.suggestions,
                triggeredBy: operation
              });
            }
          }
        }
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    };

    // Poll every 2 seconds (in production, use real-time subscriptions)
    const intervalId = setInterval(checkForChanges, 2000);
    
    return () => {
      clearInterval(intervalId);
      console.log(`Agent ${this.agentId} stopped monitoring workflow ${workflowId}`);
    };
  }

  /**
   * Log agent operations for transparency and debugging
   */
  private async logOperation(
    workflowId: string,
    operation: 'create' | 'update' | 'delete' | 'optimize',
    targetType: 'node' | 'edge',
    targetId: string,
    oldData: any,
    newData: any,
    reason?: string
  ): Promise<void> {
    const logId = this.generateId();
    
    await this.db.transact(
      this.db.tx.agentOperations[logId].update({
        id: logId,
        workflowId,
        agentId: this.agentId,
        operation,
        targetType,
        targetId,
        oldData,
        newData,
        reason,
        timestamp: Date.now(),
      })
    );
  }

  /**
   * Generate unique ID for entities
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function for creating agents
export function createWorkflowAgent(agentId: string): WorkflowAgent {
  return new WorkflowAgent(agentId);
}

// Example usage for external agents
export async function exampleAgentUsage() {
  const agent = createWorkflowAgent('optimization-agent-1');
  
  // Monitor a workflow and react to changes
  const stopMonitoring = await agent.startMonitoring('workflow-123', (change) => {
    console.log('Agent detected change:', change);
  });

  // Manually optimize a workflow
  const suggestions = await agent.optimizeWorkflow('workflow-123');
  console.log('Optimization suggestions:', suggestions);

  // Apply first suggestion
  if (suggestions.suggestions.length > 0) {
    await suggestions.suggestions[0].action();
  }

  // Stop monitoring when done
  // stopMonitoring();
}