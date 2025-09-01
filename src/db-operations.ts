import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  usersTable,
  agentsTable,
  flowsTable,
  composioConnectionsTable,
  type NewUser,
  type NewAgent,
  type NewFlow,
  type NewComposioConnection,
} from "./schema";

// Helper function to check if database is available
function checkDb() {
  if (!db) {
    throw new Error(
      "Database connection not available. Please check your DATABASE_URL environment variable.",
    );
  }
  return db;
}

// User operations
export async function createUser(userData: NewUser) {
  const database = checkDb();
  const [user] = await database.insert(usersTable).values(userData).returning();
  return user;
}

export async function getUserById(id: string) {
  const database = checkDb();
  const [user] = await database
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  return user;
}

export async function getUserByEmail(email: string) {
  const database = checkDb();
  const [user] = await database
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
}

// Agent operations
export async function createAgent(agentData: NewAgent) {
  const database = checkDb();
  const [agent] = await database
    .insert(agentsTable)
    .values(agentData)
    .returning();
  return agent;
}

export async function getAgentsByUserId(userId: string) {
  const database = checkDb();
  return await database
    .select()
    .from(agentsTable)
    .where(eq(agentsTable.userId, userId))
    .orderBy(desc(agentsTable.createdAt));
}

export async function getAgentById(id: string) {
  const database = checkDb();
  const [agent] = await database
    .select()
    .from(agentsTable)
    .where(eq(agentsTable.id, id));
  return agent;
}

export async function updateAgent(id: string, updates: Partial<NewAgent>) {
  const database = checkDb();
  const [agent] = await database
    .update(agentsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(agentsTable.id, id))
    .returning();
  return agent;
}

export async function deleteAgent(id: string) {
  const database = checkDb();
  const [agent] = await database
    .delete(agentsTable)
    .where(eq(agentsTable.id, id))
    .returning();
  return agent;
}

// Flow operations
export async function createFlow(flowData: NewFlow) {
  const database = checkDb();
  const [flow] = await database.insert(flowsTable).values(flowData).returning();
  return flow;
}

export async function getFlowsByUserId(userId: string) {
  const database = checkDb();
  return await database
    .select()
    .from(flowsTable)
    .where(eq(flowsTable.userId, userId))
    .orderBy(desc(flowsTable.updatedAt));
}

export async function getFlowById(id: string) {
  const database = checkDb();
  const [flow] = await database
    .select()
    .from(flowsTable)
    .where(eq(flowsTable.id, id));
  return flow;
}

export async function updateFlow(id: string, updates: Partial<NewFlow>) {
  const database = checkDb();
  const [flow] = await database
    .update(flowsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(flowsTable.id, id))
    .returning();
  return flow;
}

export async function deleteFlow(id: string) {
  const database = checkDb();
  const [flow] = await database
    .delete(flowsTable)
    .where(eq(flowsTable.id, id))
    .returning();
  return flow;
}

// Composio connection operations
export async function createComposioConnection(
  connectionData: NewComposioConnection,
) {
  const database = checkDb();
  const [connection] = await database
    .insert(composioConnectionsTable)
    .values(connectionData)
    .returning();
  return connection;
}

export async function getComposioConnectionsByUserId(userId: string) {
  const database = checkDb();
  return await database
    .select()
    .from(composioConnectionsTable)
    .where(eq(composioConnectionsTable.userId, userId));
}

export async function getComposioConnectionByToolkit(
  userId: string,
  toolkitSlug: string,
) {
  const database = checkDb();
  const [connection] = await database
    .select()
    .from(composioConnectionsTable)
    .where(
      and(
        eq(composioConnectionsTable.userId, userId),
        eq(composioConnectionsTable.toolkitSlug, toolkitSlug),
      ),
    );
  return connection;
}

export async function updateComposioConnection(
  id: string,
  updates: Partial<NewComposioConnection>,
) {
  const database = checkDb();
  const [connection] = await database
    .update(composioConnectionsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(composioConnectionsTable.id, id))
    .returning();
  return connection;
}

export async function deleteComposioConnection(id: string) {
  const database = checkDb();
  const [connection] = await database
    .delete(composioConnectionsTable)
    .where(eq(composioConnectionsTable.id, id))
    .returning();
  return connection;
}
