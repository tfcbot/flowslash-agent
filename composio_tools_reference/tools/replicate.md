---
title: Replicate
subtitle: Learn how to use Replicate with Composio
category: AI
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Replicate%20with%20Composio'
---


## Overview

**SLUG**: `REPLICATE`

### Description
Replicate allows users to run AI models via a cloud API without managing infrastructure.

### Authentication Details

<Accordion title="API Key">
<ParamField path="bearer_token" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Replicate
### Create an auth config
Use the dashboard to create an auth config for the Replicate toolkit. This allows you to connect multiple Replicate accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Replicate](https://platform.composio.dev/marketplace/Replicate)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Replicate Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using API Key

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
replicate_auth_config_id = "ac_YOUR_REPLICATE_CONFIG_ID" # Auth config ID created above
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
    print(f"Successfully connected Replicate for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, replicate_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const replicate_auth_config_id = "ac_YOUR_REPLICATE_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the API key from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const userApiKey = await getUserApiKey(userId);
  const userApiKey = "your_replicate_api_key"; // Replace with actual API key
  
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
  console.log(`Successfully connected Replicate for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, replicate_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Replicate toolkit's playground](https://app.composio.dev/app/Replicate)

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

tools = composio.tools.get(user_id=user_id, toolkits=["REPLICATE"])

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

// Get tools for Replicate
const tools = await composio.tools.get(userId, {
  toolkits: ["REPLICATE"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Replicate?', // Your task here!
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

# Get tools for Replicate
tools = composio.tools.get(user_id, toolkits=["REPLICATE"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Replicate?")
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

// Get tools for Replicate
const tools = await composio.tools.get(userId, { 
  toolkits: ["REPLICATE"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Replicate?", // Your task here!
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
<Accordion title="REPLICATE_COLLECTIONS_LIST">
**Tool Name:** List model collections

**Description**

```text wordWrap
Tool to list all collections of models. use when you need to retrieve available model collections.
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

<Accordion title="REPLICATE_CREATE_FILE">
**Tool Name:** Create file

**Description**

```text wordWrap
Tool to create a file by uploading content. use when you need to upload and store a file for later reference.
```


**Action Parameters**

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="filename" type="string" required={true}>
</ParamField>

<ParamField path="metadata" type="object">
</ParamField>

<ParamField path="type" type="string" default="application/octet-stream">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="REPLICATE_CREATE_PREDICTION">
**Tool Name:** Create Prediction

**Description**

```text wordWrap
Tool to create a prediction for a given deployment. use when you need to run model inference with specified inputs. use 'wait for' to wait until the prediction completes.
```


**Action Parameters**

<ParamField path="deployment_name" type="string" required={true}>
</ParamField>

<ParamField path="deployment_owner" type="string" required={true}>
</ParamField>

<ParamField path="input" type="object" required={true}>
</ParamField>

<ParamField path="wait_for" type="integer">
</ParamField>

<ParamField path="webhook" type="string">
</ParamField>

<ParamField path="webhook_events_filter" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="REPLICATE_FILES_GET">
**Tool Name:** Get File Details

**Description**

```text wordWrap
Tool to get details of a file by its id. use when you need to inspect uploaded file information before further operations.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="REPLICATE_FILES_LIST">
**Tool Name:** List Files

**Description**

```text wordWrap
Tool to list all files created by the user or organization. use after authenticating to fetch files list.
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

<Accordion title="REPLICATE_MODELS_EXAMPLES_LIST">
**Tool Name:** List model examples

**Description**

```text wordWrap
Tool to list example predictions for a specific model. use when you want to retrieve author-provided illustrative examples after identifying the model.
```


**Action Parameters**

<ParamField path="model_name" type="string" required={true}>
</ParamField>

<ParamField path="model_owner" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="REPLICATE_MODELS_GET">
**Tool Name:** Get Model Details

**Description**

```text wordWrap
Tool to get details of a specific model by owner and name. use when you need model metadata (schema, urls) before running predictions.
```


**Action Parameters**

<ParamField path="model_name" type="string" required={true}>
</ParamField>

<ParamField path="model_owner" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="REPLICATE_MODELS_README_GET">
**Tool Name:** Get Model README

**Description**

```text wordWrap
Tool to get the readme content for a model in markdown format. use after retrieving model details when you want to view its documentation.
```


**Action Parameters**

<ParamField path="model_name" type="string" required={true}>
</ParamField>

<ParamField path="model_owner" type="string" required={true}>
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
