---
title: Linear
subtitle: Learn how to use Linear with Composio
category: Productivity & Project Management
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Linear%20with%20Composio'
---


## Overview

**SLUG**: `LINEAR`

### Description
Linear is a streamlined issue tracking and project planning tool for modern teams, featuring fast workflows, keyboard shortcuts, and GitHub integrations

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="full" type="string" required={true} default="https://api.linear.app">
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string" default="admin,read,write,issues:create,comments:create">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


<Accordion title="API Key">
<ParamField path="full" type="string" required={true} default="https://api.linear.app">
</ParamField>

<ParamField path="generic_api_key" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Linear
### Create an auth config
Use the dashboard to create an auth config for the Linear toolkit. This allows you to connect multiple Linear accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Linear](https://platform.composio.dev/marketplace/Linear)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Linear Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
linear_auth_config_id = "ac_YOUR_LINEAR_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Linear: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, linear_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const linear_auth_config_id = "ac_YOUR_LINEAR_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Linear: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, linear_auth_config_id);

// You can also verify the connection status using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


#### Using API Key

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
linear_auth_config_id = "ac_YOUR_LINEAR_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/app

composio = Composio()

def authenticate_toolkit(user_id: str, auth_config_id: str):
    # Replace this with a method to retrieve an API key from the user.
    # Or supply your own.
    user_api_key = input("[!] Enter API key")

    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
        config={"auth_scheme": "API_KEY", "val": {"generic_api_key": user_api_key}}
    )

    # API Key authentication is immediate - no redirect needed
    print(f"Successfully connected Linear for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, linear_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const linear_auth_config_id = "ac_YOUR_LINEAR_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the API key from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const userApiKey = await getUserApiKey(userId);
  const userApiKey = "your_linear_api_key"; // Replace with actual API key
  
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId,
    {
      config: AuthScheme.APIKey({
        api_key: userApiKey
      })
    }
  );
  
  // API Key authentication is immediate - no redirect needed
  console.log(`Successfully connected Linear for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, linear_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Linear toolkit's playground](https://app.composio.dev/app/Linear)

<Tabs>
<Tab title="OpenAI (Python)">
```python title="Python" maxLines=40 wordWrap
from composio import Composio
from openai import OpenAI
import json

openai = OpenAI()
composio = Composio()

# User ID must be a valid UUID format
user_id = "0000-0000-0000"  # Replace with actual user UUID from your database

tools = composio.tools.get(user_id=user_id, toolkits=["LINEAR"])

print("[!] Tools:")
print(json.dumps(tools))

def invoke_llm(task = "What can you do?"):
    completion = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": task,  # Your task here!
            },
        ],
        tools=tools,
    )

    # Handle Result from tool call
    result = composio.provider.handle_tool_calls(user_id=user_id, response=completion)
    print(f"[!] Completion: {completion}")
    print(f"[!] Tool call result: {result}")

invoke_llm()
```

</Tab>
<Tab title="Anthropic (TypeScript)">
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AnthropicProvider } from '@composio/anthropic';
import { Anthropic } from '@anthropic-ai/sdk';

const composio = new Composio({
  provider: new AnthropicProvider({
    cacheTools: false, // default
  }),
});

const anthropic = new Anthropic();

// User ID must be a valid UUID format
const userId = "0000-0000-0000"; // Replace with actual user UUID from your database

// Get tools for Linear
const tools = await composio.tools.get(userId, {
  toolkits: ["LINEAR"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Linear?', // Your task here!
    },
  ],
  tools: tools,
  max_tokens: 1000,
});

// Handle tool calls if any
const result = await composio.provider.handleToolCalls(userId, msg);
console.log("[!] Result:", result);
```

</Tab>
<Tab title="Google (Python)">
```python title="Python" maxLines=40 wordWrap
from composio import Composio
from composio_google import GoogleProvider
from google import genai
from google.genai import types

# Create composio client
composio = Composio(provider=GoogleProvider())
# Create google client
client = genai.Client()

# User ID must be a valid UUID format
user_id = "0000-0000-0000"  # Replace with actual user UUID from your database

# Get tools for Linear
tools = composio.tools.get(user_id, toolkits=["LINEAR"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Linear?")
print("[!] Response:", response.text)
```

</Tab>
<Tab title="Vercel (TypeScript)">
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { VercelProvider } from '@composio/vercel';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

// User ID must be a valid UUID format
const userId = "0000-0000-0000"; // Replace with actual user UUID from your database

// Get tools for Linear
const tools = await composio.tools.get(userId, { 
  toolkits: ["LINEAR"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Linear?", // Your task here!
    },
  ],
  tools,
  maxSteps: 3,
});

console.log("[!] Result:", text);
```

</Tab>
</Tabs>

### Tool List

<AccordionGroup>
<Accordion title="LINEAR_CREATE_LINEAR_ATTACHMENT">
**Tool Name:** Create linear attachment

**Description**

```text wordWrap
Creates a new attachment and associates it with a specific, existing linear issue.
```


**Action Parameters**

<ParamField path="issue_id" type="string" required={true}>
</ParamField>

<ParamField path="subtitle" type="string" required={true}>
</ParamField>

<ParamField path="title" type="string" required={true}>
</ParamField>

<ParamField path="url" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_CREATE_LINEAR_COMMENT">
**Tool Name:** Create a comment

**Description**

```text wordWrap
Creates a new comment on a specified linear issue.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="issue_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_CREATE_LINEAR_ISSUE">
**Tool Name:** Create linear issue

**Description**

```text wordWrap
Creates a new issue in a specified linear project and team, requiring a title and description, and allowing for optional properties like assignee, state, priority, cycle, and due date.
```


**Action Parameters**

<ParamField path="assignee_id" type="string">
</ParamField>

<ParamField path="cycle_id" type="string">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="due_date" type="string">
</ParamField>

<ParamField path="estimate" type="integer">
</ParamField>

<ParamField path="label_ids" type="array">
</ParamField>

<ParamField path="parent_id" type="string">
</ParamField>

<ParamField path="priority" type="integer">
</ParamField>

<ParamField path="project_id" type="string">
</ParamField>

<ParamField path="state_id" type="string">
</ParamField>

<ParamField path="team_id" type="string" required={true}>
</ParamField>

<ParamField path="title" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_CREATE_LINEAR_ISSUE_DETAILS">
**Tool Name:** Get create issue default params

**Description**

```text wordWrap
Fetches a linear team's default issue estimate and state, useful for pre-filling new issue forms.
```


**Action Parameters**

<ParamField path="team_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_CREATE_LINEAR_LABEL">
**Tool Name:** Create a label

**Description**

```text wordWrap
Creates a new label in linear for a specified team, used to categorize and organize issues.
```


**Action Parameters**

<ParamField path="color" type="string" required={true}>
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="team_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_DELETE_LINEAR_ISSUE">
**Tool Name:** Delete issue

**Description**

```text wordWrap
Archives an existing linear issue by its id, which is linear's standard way of deleting issues; the operation is idempotent.
```


**Action Parameters**

<ParamField path="issue_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_GET_ALL_LINEAR_TEAMS">
**Tool Name:** Get all teams

**Description**

```text wordWrap
Retrieves all teams from the linear workspace without requiring any parameters.
```


**Action Parameters**



**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_GET_ATTACHMENTS">
**Tool Name:** Download issue attachments

**Description**

```text wordWrap
Downloads a specific attachment from a linear issue; the `file name` must include the correct file extension.
```


**Action Parameters**

<ParamField path="attachment_id" type="string" required={true}>
</ParamField>

<ParamField path="file_name" type="string" required={true}>
</ParamField>

<ParamField path="issue_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_GET_CURRENT_USER">
**Tool Name:** Get current user

**Description**

```text wordWrap
Gets the currently authenticated user's id, name, email, and other profile information. use this to identify 'me' in other linear operations that require user id filtering.
```


**Action Parameters**



**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_GET_CYCLES_BY_TEAM_ID">
**Tool Name:** Get cycles by team ID

**Description**

```text wordWrap
Retrieves all cycles for a specified linear team id; cycles are time-boxed work periods (like sprints) and the team id must correspond to an existing team.
```


**Action Parameters**

<ParamField path="team_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_GET_LINEAR_ISSUE">
**Tool Name:** Get Linear issue

**Description**

```text wordWrap
Retrieves an existing linear issue's comprehensive details, including title, description, attachments, and comments.
```


**Action Parameters**

<ParamField path="issue_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_LIST_LINEAR_CYCLES">
**Tool Name:** Get all cycles

**Description**

```text wordWrap
Retrieves all cycles (time-boxed iterations for work) from the linear account; no filters are applied.
```


**Action Parameters**



**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_LIST_LINEAR_ISSUES">
**Tool Name:** List Linear issues

**Description**

```text wordWrap
Lists non-archived linear issues; if project id is not specified, issues from all accessible projects are returned. can also filter by assignee id to get issues assigned to a specific user.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="assignee_id" type="string">
</ParamField>

<ParamField path="first" type="integer" default="10">
</ParamField>

<ParamField path="project_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_LIST_LINEAR_LABELS">
**Tool Name:** Get labels by team

**Description**

```text wordWrap
Retrieves all labels associated with a given team id in linear; the team id must refer to an existing team.
```


**Action Parameters**

<ParamField path="team_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_LIST_LINEAR_PROJECTS">
**Tool Name:** List linear projects

**Description**

```text wordWrap
Retrieves all projects from the linear account.
```


**Action Parameters**



**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_LIST_LINEAR_STATES">
**Tool Name:** List Linear states

**Description**

```text wordWrap
Retrieves all workflow states for a specified team in linear, representing the stages an issue progresses through in that team's workflow.
```


**Action Parameters**

<ParamField path="team_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_LIST_LINEAR_TEAMS">
**Tool Name:** Get teams by project

**Description**

```text wordWrap
Retrieves all teams, including their members, and filters each team's associated projects by the provided 'project id'.
```


**Action Parameters**

<ParamField path="project_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_LIST_LINEAR_USERS">
**Tool Name:** List Linear users

**Description**

```text wordWrap
Lists all users in the linear workspace with their ids, names, emails, and active status.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="first" type="integer" default="50">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_REMOVE_ISSUE_LABEL">
**Tool Name:** Remove label from Linear issue

**Description**

```text wordWrap
Removes a specified label from an existing linear issue using their ids; successful even if the label isn't on the issue.
```


**Action Parameters**

<ParamField path="issue_id" type="string" required={true}>
</ParamField>

<ParamField path="label_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_RUN_QUERY_OR_MUTATION">
**Tool Name:** Run Query or Mutation

**Description**

```text wordWrap
Wildcard action that executes any graphql query or mutation against the linear api. use this as a fallback when no specific action exists for your use case, or when you need to perform complex operations not covered by other linear actions. supports full graphql capabilities including custom queries, mutations, and advanced filtering.
```


**Action Parameters**

<ParamField path="query_or_mutation" type="string" required={true}>
</ParamField>

<ParamField path="variables" type="object" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="LINEAR_UPDATE_ISSUE">
**Tool Name:** Update issue

**Description**

```text wordWrap
Updates an existing linear issue using its `issue id`; requires at least one other attribute for modification, and all provided entity ids (for state, assignee, labels, etc.) must be valid.
```


**Action Parameters**

<ParamField path="assignee_id" type="string">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="due_date" type="string">
</ParamField>

<ParamField path="estimate" type="integer">
</ParamField>

<ParamField path="issue_id" type="string" required={true}>
</ParamField>

<ParamField path="label_ids" type="array">
</ParamField>

<ParamField path="parent_id" type="string">
</ParamField>

<ParamField path="priority" type="integer">
</ParamField>

<ParamField path="project_id" type="string">
</ParamField>

<ParamField path="state_id" type="string">
</ParamField>

<ParamField path="team_id" type="string">
</ParamField>

<ParamField path="title" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

</AccordionGroup>
