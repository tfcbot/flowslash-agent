# Flowslash Agent - AI Workflow Builder

A visual AI workflow builder built with Next.js, ReactFlow, and Neon Database. Create, test, and deploy AI agents with drag-and-drop ease.

## Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating AI workflows
- **Multiple Node Types**: Input, LLM, Composio tools, Agent, and Output nodes
- **Pre-built Patterns**: Common workflow patterns like augmented LLM, prompt chaining, and routing
- **Composio Integration**: Access to 300+ third-party app integrations
- **Real-time Testing**: Test your workflows with live execution and logging
- **Neon Database**: PostgreSQL backend with Drizzle ORM for data persistence

## Tech Stack

- **Frontend**: Next.js 15, React 19, ReactFlow, Tailwind CSS
- **Backend**: Neon Database (PostgreSQL), Drizzle ORM
- **AI Integration**: OpenAI, Anthropic, Google AI models
- **Third-party Tools**: Composio for app integrations
- **UI Components**: shadcn/ui with custom design system

## Quick Start

### Prerequisites

- Node.js 18+
- Neon Database account
- Composio API key (optional, for tool integrations)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flowslash-agent
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database"
   COMPOSIO_API_KEY="your_composio_api_key_here"
   ```

4. **Set up the database**
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Usage

### Creating a New Flow

1. Click "New Flow" on the home page
2. Drag and drop components from the left sidebar
3. Connect nodes by dragging from output to input handles
4. Configure each node with your settings
5. Save and test your workflow

### Node Types

- **Input Node**: Start your workflow with user input
- **LLM Node**: Process with AI language models
- **Composio Node**: Execute actions in third-party apps
- **Agent Node**: Full AI agent with tool access
- **Output Node**: Display final results

### Workflow Patterns

- **Augmented LLM**: Input → LLM → Tools → Output
- **Prompt Chaining**: Input → Agent 1 → Agent 2 → Output
- **Routing**: Input → Router → Multiple paths → Output
- **Parallelization**: Input → Parallel agents → Aggregator → Output

## Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run Biome linting
- `bun run format` - Format code with Biome
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

### Project Structure

```
flowslash-agent/
├── app/                    # Next.js app directory
│   ├── builder/           # Workflow builder pages
│   └── api/               # API routes
├── components/             # React components
│   ├── builder-nodes/     # ReactFlow node components
│   ├── workflow-tester/   # Workflow testing components
│   └── ui/                # shadcn/ui components
├── src/                    # Source code
│   ├── db/                # Database operations
│   ├── schema.ts          # Database schema
│   └── composio.ts        # Composio service
└── lib/                    # Utility functions
```

### Database Schema

The application uses the following main tables:

- **users**: User accounts and authentication
- **agents**: AI agent configurations
- **flows**: Workflow definitions and graph data
- **composio_connections**: User's connected third-party apps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Join our community discussions
