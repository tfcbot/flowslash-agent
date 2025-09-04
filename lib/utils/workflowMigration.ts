// Migration utilities for moving from localStorage to InstantDB
import db, { id } from '../db';
import { LegacyWorkflowFormat, convertNodeFromReactFlow, convertEdgeFromReactFlow } from '../types/workflow';

export interface MigrationResult {
  success: boolean;
  workflowId?: string;
  error?: string;
  migratedNodes: number;
  migratedEdges: number;
}

/**
 * Migrate a workflow from localStorage format to InstantDB
 */
export async function migrateWorkflowFromLocalStorage(
  legacyData: LegacyWorkflowFormat,
  userId: string
): Promise<MigrationResult> {
  try {
    const workflowId = id();
    const now = Date.now();
    
    // Extract nodes and edges from legacy format
    const nodes = legacyData.graph_json?.nodes || legacyData.nodes || [];
    const edges = legacyData.graph_json?.edges || legacyData.edges || [];

    // Create workflow record
    await db.transact(
      db.tx.workflows[workflowId].update({
        id: workflowId,
        name: legacyData.name || 'Migrated Workflow',
        description: 'Migrated from localStorage',
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
        ownerId: userId,
        isPublic: false,
        metadata: {
          migratedFrom: 'localStorage',
          originalViewport: legacyData.viewport,
        }
      })
    );

    // Migrate nodes
    const nodeTransactions = nodes.map(node => {
      const dbNodeData = convertNodeFromReactFlow(node, workflowId, 'human');
      return db.tx.workflowNodes[node.id].update({
        ...dbNodeData,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Migrate edges
    const edgeTransactions = edges.map(edge => {
      const dbEdgeData = convertEdgeFromReactFlow(edge, workflowId, 'human');
      return db.tx.workflowEdges[edge.id].update({
        ...dbEdgeData,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Execute all transactions
    if (nodeTransactions.length > 0 || edgeTransactions.length > 0) {
      await db.transact([...nodeTransactions, ...edgeTransactions]);
    }

    return {
      success: true,
      workflowId,
      migratedNodes: nodes.length,
      migratedEdges: edges.length,
    };

  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown migration error',
      migratedNodes: 0,
      migratedEdges: 0,
    };
  }
}

/**
 * Auto-migrate localStorage workflow on app startup
 */
export async function autoMigrateFromLocalStorage(userId: string): Promise<string | null> {
  try {
    const savedWorkflow = localStorage.getItem('current_workflow');
    if (!savedWorkflow) return null;

    const legacyData: LegacyWorkflowFormat = JSON.parse(savedWorkflow);
    
    // For demo purposes, always create new workflow
    // TODO: Implement duplicate checking when InstantDB client query is available

    // Perform migration
    const result = await migrateWorkflowFromLocalStorage(legacyData, userId);
    
    if (result.success && result.workflowId) {
      // Clear localStorage after successful migration
      localStorage.removeItem('current_workflow');
      console.log(`Successfully migrated workflow with ${result.migratedNodes} nodes and ${result.migratedEdges} edges`);
      return result.workflowId;
    }

    return null;
  } catch (error) {
    console.error('Auto-migration failed:', error);
    return null;
  }
}

/**
 * Create a new empty workflow
 */
export async function createNewWorkflow(
  name: string,
  userId: string,
  description?: string
): Promise<string> {
  const workflowId = id();
  const now = Date.now();

  await db.transact(
    db.tx.workflows[workflowId].update({
      id: workflowId,
      name,
      description: description || '',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      ownerId: userId,
      isPublic: false,
    })
  );

  return workflowId;
}