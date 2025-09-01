# Database Setup Guide

This project uses **Neon** (serverless Postgres) with **Drizzle ORM** for database operations.

## Prerequisites

1. A Neon account and project
2. Node.js and npm installed

## Setup Steps

### 1. Install Dependencies

The required dependencies are already installed:
- `drizzle-orm` - The ORM
- `@neondatabase/serverless` - Neon serverless client
- `dotenv` - Environment variable management
- `drizzle-kit` - Database migration and management tools

### 2. Environment Configuration

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update `.env` with your Neon connection string:
   ```
   DATABASE_URL=postgres://username:password@ep-instance-id.region.aws.neon.tech/neondb
   ```

### 3. Database Schema

The schema is defined in `src/schema.ts` with the following tables:
- `users` - User management
- `agents` - AI agents
- `workflows` - Workflow definitions

### 4. Database Operations

Database operations are available in `src/db-operations.ts`:
- Optimized queries for Neon serverless environment
- Transaction handling
- Error handling for Neon-specific issues
- Prepared statements for repeated queries

### 5. Available Scripts

- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:migrate` - Apply migrations to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:push` - Push schema changes directly to database (development only)

### 6. Usage Example

```typescript
import { createUserWithAgent } from './src/db-operations';
import type { NewUser, NewAgent } from './src/schema';

const user: NewUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
};

const agent: NewAgent = {
  name: 'My Agent',
  description: 'A helpful AI agent'
};

const result = await createUserWithAgent(user, agent);
console.log('Created:', result);
```

## Neon-Specific Considerations

- Uses HTTP-based `neon-http` adapter for serverless optimization
- Connection pooling for high traffic applications
- Auto-scaling capabilities
- Support for Postgres-specific features (JSONB, enums, etc.)

## Best Practices

1. Keep connection times short for serverless functions
2. Use batch operations when possible
3. Leverage prepared statements for repeated queries
4. Handle Neon-specific error codes appropriately
5. Use transactions for related operations

## Troubleshooting

- Ensure `DATABASE_URL` is set correctly in `.env`
- Check Neon project status and connection limits
- Verify schema changes with `npm run db:generate`
- Use `npm run db:studio` to inspect database state
