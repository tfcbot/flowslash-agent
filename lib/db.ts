import { init } from '@instantdb/react';
import schema from '../instant.schema';

// Initialize InstantDB client
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

if (!APP_ID) {
  throw new Error('NEXT_PUBLIC_INSTANT_APP_ID environment variable is required');
}

const db = init({ 
  appId: APP_ID, 
  schema 
});

export default db;

// Export helper function for generating IDs
export { id } from '@instantdb/react';

// Export types for convenience
export type { Schema } from '../instant.schema';