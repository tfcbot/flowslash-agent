import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";

// User table with UUID primary key like chat app
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agents table with userId reference
export const agentsTable = pgTable("agents", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  isActive: boolean("is_active").default(true),
  config: jsonb("config"), // Agent configuration as JSONB
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flows table with userId reference
export const flowsTable = pgTable("flows", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  agentId: uuid("agent_id").references(() => agentsTable.id),
  status: varchar("status", { length: 50 }).default("draft"),
  graphJson: jsonb("graph_json"), // ReactFlow graph data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Composio connections table for user's connected apps
export const composioConnectionsTable = pgTable("composio_connections", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  toolkitSlug: varchar("toolkit_slug", { length: 100 }).notNull(),
  connectionId: varchar("connection_id", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"), // Connection metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Agent = typeof agentsTable.$inferSelect;
export type NewAgent = typeof agentsTable.$inferInsert;

export type Flow = typeof flowsTable.$inferSelect;
export type NewFlow = typeof flowsTable.$inferInsert;

export type ComposioConnection = typeof composioConnectionsTable.$inferSelect;
export type NewComposioConnection =
  typeof composioConnectionsTable.$inferInsert;
