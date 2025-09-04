---
title: Ayrshare
subtitle: Learn how to use Ayrshare with Composio
category: Social Media Management
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Ayrshare%20with%20Composio'
---


## Overview

**SLUG**: `AYRSHARE`

### Description
Ayrshare provides a Social Media API that enables developers to programmatically manage and automate social media posts, analytics, and interactions across multiple platforms.

### Authentication Details

<Accordion title="API Key">
<ParamField path="generic_api_key" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Ayrshare
### Create an auth config
Use the dashboard to create an auth config for the Ayrshare toolkit. This allows you to connect multiple Ayrshare accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Ayrshare](https://platform.composio.dev/marketplace/Ayrshare)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Ayrshare Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using API Key

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
ayrshare_auth_config_id = "ac_YOUR_AYRSHARE_CONFIG_ID" # Auth config ID created above
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
    print(f"Successfully connected Ayrshare for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, ayrshare_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const ayrshare_auth_config_id = "ac_YOUR_AYRSHARE_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the API key from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const userApiKey = await getUserApiKey(userId);
  const userApiKey = "your_ayrshare_api_key"; // Replace with actual API key
  
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
  console.log(`Successfully connected Ayrshare for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, ayrshare_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Ayrshare toolkit's playground](https://app.composio.dev/app/Ayrshare)

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

tools = composio.tools.get(user_id=user_id, toolkits=["AYRSHARE"])

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

// Get tools for Ayrshare
const tools = await composio.tools.get(userId, {
  toolkits: ["AYRSHARE"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Ayrshare?', // Your task here!
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

# Get tools for Ayrshare
tools = composio.tools.get(user_id, toolkits=["AYRSHARE"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Ayrshare?")
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

// Get tools for Ayrshare
const tools = await composio.tools.get(userId, { 
  toolkits: ["AYRSHARE"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Ayrshare?", // Your task here!
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
<Accordion title="AYRSHARE_CREATE_AUTO_SCHEDULE">
**Tool Name:** Create Auto Schedule

**Description**

```text wordWrap
Tool to create a new auto-post schedule with specified times and optional weekday filters. use when setting up recurring posting plans.
```


**Action Parameters**

<ParamField path="daysOfWeek" type="array">
</ParamField>

<ParamField path="schedule" type="array" required={true}>
</ParamField>

<ParamField path="title" type="string" default="default">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="AYRSHARE_DELETE_DELETE_POST">
**Tool Name:** Delete a previously published Ayrshare post

**Description**

```text wordWrap
Tool to delete an ayrshare post. use when you need to remove a published or scheduled post by its ayrshare post id, after confirming the correct id. note: instagram and tiktok published posts cannot be deleted via api; set `mark manual deleted=true` or remove manually.
```


**Action Parameters**

<ParamField path="bulk" type="array">
</ParamField>

<ParamField path="deleteAllScheduled" type="boolean">
</ParamField>

<ParamField path="id" type="string">
</ParamField>

<ParamField path="markManualDeleted" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="AYRSHARE_GET_POST_HISTORY">
**Tool Name:** Get Post History

**Description**

```text wordWrap
Tool to retrieve ayrshare post history with metrics. use when you need to fetch and filter past posts by date, status, or record count.
```


**Action Parameters**

<ParamField path="Profile-Key" type="string">
</ParamField>

<ParamField path="endDate" type="string">
</ParamField>

<ParamField path="lastDays" type="integer">
</ParamField>

<ParamField path="lastRecords" type="integer">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="startDate" type="string">
</ParamField>

<ParamField path="status" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="AYRSHARE_POST_SET_AUTO_SCHEDULE">
**Tool Name:** Set Auto Schedule

**Description**

```text wordWrap
Tool to set up an auto-post schedule with specified times and optional weekday filters. use when scheduling posts around a recurring pattern.
```


**Action Parameters**

<ParamField path="daysOfWeek" type="array">
</ParamField>

<ParamField path="schedule" type="array" required={true}>
</ParamField>

<ParamField path="title" type="string" default="default">
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
