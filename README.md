# FlowSlash Agent - AI-Programmable Workflow Microservice

A stateless LangGraph-powered microservice for AI agents to build and deploy custom workflows. AI agents can modify the codebase to create specialized workflow servers with curated tool integrations via Composio. Built for AI-driven workflow automation.

## Features

- **AI-Programmable**: AI agents can modify workflow code directly in TypeScript
- **LangGraph Workflow Engine**: Execute complex AI workflows with multiple nodes and tools
- **Curated Tool Integrations**: 15 production-ready tools including Gmail, Slack, GitHub, Notion via Composio
- **Stateless Architecture**: No database required - perfect for microservices and serverless
- **Environment-Based Config**: All API keys managed via environment variables
- **TypeScript Native**: Maximum type safety with zero `any` types and strict mode
- **Auto-Generated SDK**: Fully typed client with complete IntelliSense support
- **OpenAPI Documentation**: Interactive Swagger UI for API exploration
- **LLMs.txt Export**: AI-friendly endpoint documentation
- **Single Endpoint**: Simple `/execute` API for all workflow execution

## Tech Stack

- **Workflow Engine**: LangGraph (AI workflow orchestration)
- **Server**: Hono (lightweight, fast web framework)
- **Tools**: Composio (15 curated integrations with full documentation)
- **TypeScript**: Strict mode, zero `any` types, comprehensive type safety
- **Documentation**: OpenAPI 3.0 + Swagger UI
- **SDK Generation**: swagger-typescript-api with full typing
- **Runtime Validation**: Zod schemas integrated with TypeScript types
- **Deployment**: Stateless design - works on Docker, Vercel, Cloudflare Workers

## Quick Start for AI Agents

### Prerequisites

- Node.js 18+ and NPM
- Composio API key for tool integrations
- OpenAI/Anthropic/Google API keys (based on workflow needs)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flowslash-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local`:
   ```env
   # Required for Composio tools
   COMPOSIO_API_KEY="your_composio_api_key"
   
   # Required for LLM nodes (add based on your workflow)
   OPENAI_API_KEY="sk-your_openai_key"
   ANTHROPIC_API_KEY="your_anthropic_key"  # If using Claude
   GOOGLE_API_KEY="your_google_key"        # If using Gemini
   
   # Server config
   PORT=3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start and automatically:
- Generate OpenAPI specification  
- Create TypeScript SDK
- Export LLMs.txt file
- Start on http://localhost:3000 with `/execute` endpoint ready

## How AI Agents Use This Repo

### 🤖 **AI Workflow Development Process**

1. **Analyze User Request**: Understand what workflow is needed
2. **Select Tools**: Choose from 15 documented Composio tools in `/composio_tools_reference/tools/`
3. **Generate Workflow**: Modify `src/routes/execute.ts` with LangGraph workflow code
4. **Deploy**: Commit changes and deploy server
5. **Execute**: Use the `/execute` endpoint

### 🛠️ **Available Tools (15 Total)**

Check `/composio_tools_reference/tools/` for complete documentation:

| Category | Tools Available |
|----------|-----------------|
| **📧 Communication** | Gmail, Slack |
| **🗂️ Productivity** | Notion, Airtable, Google Sheets, Linear |
| **👥 Social Media** | Twitter, LinkedIn, Instagram, Ayrshare |
| **🔧 Development** | GitHub |
| **☁️ File Storage** | Google Drive, Dropbox |
| **🕷️ Web Scraping** | Apify |
| **🤖 AI/ML** | Replicate |

**Total: 15 fully documented and tested integrations**

### 🎯 **AI Workflow Generation Example**

#### **User Request:**
*"Create a workflow that sends Gmail and notifies Slack"*

#### **AI Modifies: `src/routes/execute.ts`**

```typescript
function getWorkflowDefinition() {
  return {
    nodes: [
      {
        id: "input_1",
        type: "customInput",
        data: { label: "Email Request" }
      },
      {
        id: "extract_details",
        type: "llm", 
        data: {
          provider: "openai",
          modelName: "gpt-4o",
          systemPrompt: "Extract email recipient, subject, and body from user input. Return JSON format."
        }
      },
      {
        id: "send_gmail",
        type: "composio",
        data: {
          toolAction: "GMAIL_SEND_EMAIL",
          inputMapping: {
            recipient_email: "extract_details.recipient",
            subject: "extract_details.subject", 
            body: "extract_details.body"
          }
        }
      },
      {
        id: "notify_slack",
        type: "composio",
        data: {
          toolAction: "SLACK_SEND_MESSAGE",
          inputMapping: {
            channel: "#general",
            message: "Email sent successfully to {{send_gmail.recipient}}"
          }
        }
      }
    ],
    edges: [
      { source: "input_1", target: "extract_details" },
      { source: "extract_details", target: "send_gmail" },
      { source: "send_gmail", target: "notify_slack" }
    ]
  };
}
```

#### **Deploy & Use:**
```bash
# AI commits the workflow
git add src/routes/execute.ts
git commit -m "AI: Gmail + Slack notification workflow"
git push

# Execute the workflow
curl -X POST http://localhost:3000/execute \
  -H "Authorization: Bearer user_123_1234567890_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "message": "Send email to john@company.com about project completion"
    }
  }'
```

## 📡 **API Endpoints**

- **`POST /execute`** - Execute the embedded workflow (requires bearer token)
- **`GET /`** - API health check
- **`GET /docs`** - Interactive API documentation  
- **`GET /api/sdk/download`** - Download TypeScript SDK
- **`GET /llms.txt`** - AI-friendly endpoint documentation

## 🤖 **AI Agent Guide: Building Custom Workflows**

### **Step 1: Understand the Current Workflow**
The default workflow in `src/routes/execute.ts` → `getWorkflowDefinition()` is a simple:
```
Input → LLM Response → Output
```

### **Step 2: Choose Your Tools**
Browse `/composio_tools_reference/tools/` to find needed integrations:

| Tool Category | Example Tools | Use Cases |
|---------------|---------------|-----------|
| **Gmail** | `GMAIL_SEND_EMAIL`, `GMAIL_CREATE_EMAIL_DRAFT` | Email automation |
| **Slack** | `SLACK_SEND_MESSAGE`, `SLACK_CREATE_CHANNEL` | Team notifications |
| **GitHub** | `GITHUB_CREATE_ISSUE`, `GITHUB_SEARCH_REPOS` | Code management |
| **Notion** | `NOTION_CREATE_PAGE`, `NOTION_UPDATE_DATABASE` | Documentation |
| **Airtable** | `AIRTABLE_CREATE_RECORD`, `AIRTABLE_LIST_RECORDS` | Data management |

### **Step 3: Design Your LangGraph Workflow**

#### **Node Types Available:**
- **`customInput`**: Accepts user input
- **`llm`**: AI processing (OpenAI, Anthropic, Google)
- **`composio`**: Execute Composio tools
- **`customOutput`**: Return results

#### **Example: Gmail Sender Workflow**
```typescript
function getWorkflowDefinition() {
  return {
    nodes: [
      {
        id: "input_1",
        type: "customInput",
        data: { label: "Email Request" }
      },
      {
        id: "parse_email",
        type: "llm",
        data: {
          provider: "openai",
          modelName: "gpt-4o",
          systemPrompt: "Extract recipient, subject, body from: {{input}}. Return JSON."
        }
      },
      {
        id: "send_email", 
        type: "composio",
        data: {
          toolAction: "GMAIL_SEND_EMAIL",
          inputMapping: {
            recipient_email: "parse_email.recipient",
            subject: "parse_email.subject",
            body: "parse_email.body"
          }
        }
      },
      {
        id: "output_1",
        type: "customOutput", 
        data: { format: "json" }
      }
    ],
    edges: [
      { source: "input_1", target: "parse_email" },
      { source: "parse_email", target: "send_email" },
      { source: "send_email", target: "output_1" }
    ]
  };
}
```

### **Step 4: Test Your Workflow**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Authorization: Bearer user_123_1234567890_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "message": "Send email to team@company.com saying the deployment is complete"
    }
  }'
```

### **Step 5: Deploy**
```bash
git add src/routes/execute.ts
git commit -m "AI: Custom workflow for [use case]"
git push
# Deploy via your CI/CD pipeline
```

## 📚 **Tool Reference Guide**

### **Authentication Setup**
Most Composio tools require user authentication. Check each tool's documentation in `/composio_tools_reference/tools/` for auth requirements:

- **OAuth2**: User authenticates via browser flow
- **API Key**: User provides their API key  
- **Bearer Token**: User provides bearer token

### **Common Tool Actions**

#### **Gmail Tools** (`/composio_tools_reference/tools/gmail.md`)
```typescript
// Send email
toolAction: "GMAIL_SEND_EMAIL"
inputMapping: {
  recipient_email: "john@example.com",
  subject: "Project Update", 
  body: "The project is complete!"
}

// Create draft
toolAction: "GMAIL_CREATE_EMAIL_DRAFT"
```

#### **Slack Tools** (`/composio_tools_reference/tools/slack.md`)
```typescript
// Send message
toolAction: "SLACK_SEND_MESSAGE"
inputMapping: {
  channel: "#general",
  message: "Deployment successful!"
}
```

#### **GitHub Tools** (`/composio_tools_reference/tools/github.md`)
```typescript
// Create issue
toolAction: "GITHUB_CREATE_ISSUE"
inputMapping: {
  repo: "owner/repository",
  title: "Bug Report",
  body: "Description of the issue"
}
```

## 🚀 **Deployment Options**

### **Docker**
```dockerfile
FROM node:18
COPY . .
RUN npm ci && npm run build
CMD ["npm", "start"]
```

### **Vercel**
```bash
vercel deploy
# Perfect for serverless AI workflows
```

### **Cloudflare Workers**  
```bash
npm run build
wrangler publish
# Ultra-fast edge deployment
```

## 📊 **Development Commands**

```bash
npm run dev         # Start development server
npm run build       # Build for production  
npm start           # Start production server
npm run lint        # Check code quality with ESLint
npm run lint:fix    # Fix ESLint issues automatically
npm run format      # Format code with Prettier
npm run format:check # Check code formatting
```

## 📁 **Project Structure for AI Agents**

```
flowslash-agent/
├── src/
│   ├── routes/
│   │   └── execute.ts         # 🎯 AI modifies this file
│   ├── lib/
│   │   └── workflow-executor.ts  # LangGraph execution engine
│   ├── middleware/
│   │   └── auth.ts            # Simple token validation
│   └── types/
│       └── simple.ts          # TypeScript definitions
├── composio_tools_reference/   # 📖 Tool documentation
│   └── tools/
│       ├── gmail.md          # Gmail integration guide
│       ├── slack.md          # Slack integration guide  
│       ├── github.md         # GitHub integration guide
│       └── ...               # 300+ more tools
└── package.json               # Dependencies
```

## 🔧 **AI Development Workflow**

### **For Building Custom Workflow Servers:**

1. **🎯 AI analyzes user request**
   ```
   User: "I need a server that sends Gmail and creates GitHub issues"
   ```

2. **📖 AI references tool documentation**
   ```
   AI reads: /composio_tools_reference/tools/gmail.md
   AI reads: /composio_tools_reference/tools/github.md
   ```

3. **✏️ AI modifies workflow code**
   ```typescript
   // AI updates src/routes/execute.ts
   function getWorkflowDefinition() {
     return {
       nodes: [
         // AI-generated LangGraph workflow
       ],
       edges: [
         // AI-generated connections
       ]
     };
   }
   ```

4. **🚀 Deploy the custom server**
   ```bash
   npm run build
   npm start
   # Custom workflow server ready!
   ```

## 🎯 **Common AI Workflow Patterns**

### **Email Automation**
```typescript
Input → Extract Details (LLM) → Send Gmail (Composio) → Output
```

### **Development Workflows**  
```typescript
Input → Parse Request (LLM) → Create GitHub Issue (Composio) → Notify Slack (Composio) → Output
```

### **Data Processing**
```typescript
Input → Process Data (LLM) → Update Airtable (Composio) → Generate Report (LLM) → Output
```

### **Social Media Management**
```typescript
Input → Generate Content (LLM) → Post Twitter (Composio) → Post LinkedIn (Composio) → Output
```

## 🚀 **Perfect for AI Agents Because**

- ✅ **No Database Setup**: Stateless microservice architecture
- ✅ **Simple API**: Single `/execute` endpoint 
- ✅ **Rich Tool Ecosystem**: 15 curated and documented Composio integrations
- ✅ **TypeScript Code**: AI can generate type-safe workflows
- ✅ **LangGraph Power**: Deterministic execution with state management
- ✅ **Environment Config**: All API keys from environment variables
- ✅ **Git-Based Deployment**: Version control for AI-generated workflows

## 🌐 **CORS Configuration**

The server is pre-configured to accept requests from:

- **Localhost**: All localhost ports for development
- **Freestyle Domains**: All `*.freestyle.sh` subdomains (HTTP and HTTPS)
- **Flowslash Domains**: All `*.flowslash.com` subdomains (HTTP and HTTPS)

```typescript
// Automatic CORS handling for dev servers
origin: (origin) => {
  if (!origin || origin.includes('localhost')) return origin || '*';
  if (origin.endsWith('.freestyle.sh')) return origin;
  if (origin.endsWith('.flowslash.com')) return origin;
  return null; // Reject other origins
}
```

## 📞 **Support**

- 📖 **Tool Documentation**: `/composio_tools_reference/tools/`
- 🌐 **API Docs**: `http://localhost:3000/docs`
- 🤖 **LLM-Friendly**: `http://localhost:3000/llms.txt`
