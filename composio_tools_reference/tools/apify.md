---
title: Apify
subtitle: Learn how to use Apify with Composio
category: Web Scraping
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Apify%20with%20Composio'
---


## Overview

**SLUG**: `APIFY`

### Description
Apify is a platform for building, deploying, and managing web scraping and automation tools, known as Actors.

### Authentication Details

<Accordion title="API Key">
<ParamField path="generic_api_key" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Apify
### Create an auth config
Use the dashboard to create an auth config for the Apify toolkit. This allows you to connect multiple Apify accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Apify](https://platform.composio.dev/marketplace/Apify)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Apify Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using API Key

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
apify_auth_config_id = "ac_YOUR_APIFY_CONFIG_ID" # Auth config ID created above
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
    print(f"Successfully connected Apify for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, apify_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const apify_auth_config_id = "ac_YOUR_APIFY_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the API key from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const userApiKey = await getUserApiKey(userId);
  const userApiKey = "your_apify_api_key"; // Replace with actual API key
  
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
  console.log(`Successfully connected Apify for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, apify_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Apify toolkit's playground](https://app.composio.dev/app/Apify)

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

tools = composio.tools.get(user_id=user_id, toolkits=["APIFY"])

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

// Get tools for Apify
const tools = await composio.tools.get(userId, {
  toolkits: ["APIFY"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Apify?', // Your task here!
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

# Get tools for Apify
tools = composio.tools.get(user_id, toolkits=["APIFY"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Apify?")
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

// Get tools for Apify
const tools = await composio.tools.get(userId, { 
  toolkits: ["APIFY"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Apify?", // Your task here!
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
<Accordion title="APIFY_CREATE_ACTOR">
**Tool Name:** Create Actor

**Description**

```text wordWrap
Tool to create a new actor with specified configuration. use when you need to initialize a fresh actor programmatically before publishing or running it.
```


**Action Parameters**

<ParamField path="categories" type="array">
</ParamField>

<ParamField path="defaultRunOptions" type="object">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="isDeprecated" type="boolean">
</ParamField>

<ParamField path="isPublic" type="boolean">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="title" type="string">
</ParamField>

<ParamField path="versions" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_CREATE_DATASET">
**Tool Name:** Create Dataset

**Description**

```text wordWrap
Tool to create a new dataset. use when you need to initialize or retrieve a dataset by name.
```


**Action Parameters**

<ParamField path="name" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_CREATE_TASK">
**Tool Name:** Create Actor Task

**Description**

```text wordWrap
Tool to create a new actor task with specified settings. use when you need to configure or schedule recurring actor runs programmatically.
```


**Action Parameters**

<ParamField path="actId" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="options" type="object">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_CREATE_TASK_WEBHOOK">
**Tool Name:** Create Task Webhook

**Description**

```text wordWrap
Tool to create a webhook for an actor task. use when you need external notifications about task run events (e.g., completion or failure) in downstream systems.
```


**Action Parameters**

<ParamField path="condition" type="object" required={true}>
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="eventTypes" type="array" required={true}>
</ParamField>

<ParamField path="headersTemplate" type="string">
</ParamField>

<ParamField path="idempotencyKey" type="string">
</ParamField>

<ParamField path="isAdHoc" type="boolean">
</ParamField>

<ParamField path="payloadTemplate" type="string">
</ParamField>

<ParamField path="requestUrl" type="string" required={true}>
</ParamField>

<ParamField path="shouldInterpolateStrings" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_DELETE_ACTOR">
**Tool Name:** Delete Actor

**Description**

```text wordWrap
Tool to delete an actor permanently. use when you need to remove an actor by its id or username~actorname. confirm before calling.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_DELETE_WEBHOOK">
**Tool Name:** Delete Webhook

**Description**

```text wordWrap
Tool to delete a webhook by its id. use when removing a webhook after confirming the webhook id.
```


**Action Parameters**

<ParamField path="webhookId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_ACTOR">
**Tool Name:** Get Actor Details

**Description**

```text wordWrap
Tool to get details of a specific actor. use when you need actor metadata by id or username/actorname.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_ALL_WEBHOOKS">
**Tool Name:** Get all webhooks

**Description**

```text wordWrap
Tool to get a list of all webhooks created by the user. use when you need to enumerate webhooks before filtering or maintenance.
```


**Action Parameters**

<ParamField path="desc" type="boolean">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="offset" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="limit" type="integer" required={true}>
</ParamField>

<ParamField path="offset" type="integer" required={true}>
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

<ParamField path="total" type="integer" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_DATASET_ITEMS">
**Tool Name:** Get dataset items

**Description**

```text wordWrap
Tool to retrieve items from a dataset. use when you need to fetch data from a specified dataset by pagination or filtering. only json format is fully supported.
```


**Action Parameters**

<ParamField path="asciiHeaders" type="boolean">
</ParamField>

<ParamField path="attachment" type="boolean">
</ParamField>

<ParamField path="bom" type="boolean">
</ParamField>

<ParamField path="clean" type="boolean">
</ParamField>

<ParamField path="datasetId" type="string" required={true}>
</ParamField>

<ParamField path="delimiter" type="string">
</ParamField>

<ParamField path="desc" type="boolean">
</ParamField>

<ParamField path="fields" type="string">
</ParamField>

<ParamField path="flatten" type="boolean">
</ParamField>

<ParamField path="format" type="string" default="json">
</ParamField>

<ParamField path="limit" type="integer" default="1000">
</ParamField>

<ParamField path="offset" type="integer">
</ParamField>

<ParamField path="offsetKey" type="string">
</ParamField>

<ParamField path="omit" type="string">
</ParamField>

<ParamField path="skipEmpty" type="boolean">
</ParamField>

<ParamField path="skipHidden" type="boolean">
</ParamField>

<ParamField path="unwind" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_DEFAULT_BUILD">
**Tool Name:** Get Default Build

**Description**

```text wordWrap
Tool to get the default build for an actor. use after specifying the actor id; optionally wait for the build to finish before returning.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>

<ParamField path="waitForFinish" type="number">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_KEY_VALUE_RECORD">
**Tool Name:** Get Key-Value Record

**Description**

```text wordWrap
Tool to retrieve a record from a key-value store. use when you need to fetch a specific value by key from an apify key-value store.
```


**Action Parameters**

<ParamField path="attachment" type="boolean">
</ParamField>

<ParamField path="disableRedirect" type="boolean">
</ParamField>

<ParamField path="format" type="string">
</ParamField>

<ParamField path="recordKey" type="string" required={true}>
</ParamField>

<ParamField path="storeId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_LIST_OF_BUILDS">
**Tool Name:** Get list of builds

**Description**

```text wordWrap
Tool to get a list of builds for a specific actor. use when you need paginated access to an actor’s build (version) history.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>

<ParamField path="desc" type="boolean">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="offset" type="integer">
</ParamField>

<ParamField path="status" type="string">
</ParamField>

<ParamField path="unnamed" type="boolean">
</ParamField>

<ParamField path="waitForFinish" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_LIST_OF_RUNS">
**Tool Name:** Get list of runs

**Description**

```text wordWrap
Tool to get a list of runs for a specific actor. use when you need to paginate through runs and optionally filter by status before processing run data.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>

<ParamField path="desc" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="1000">
</ParamField>

<ParamField path="offset" type="integer">
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

<Accordion title="APIFY_GET_LIST_OF_TASK_RUNS">
**Tool Name:** Get list of task runs

**Description**

```text wordWrap
Tool to get a list of runs for a specific actor task. use when you need to paginate through task runs and optionally filter by status.
```


**Action Parameters**

<ParamField path="actorTaskId" type="string" required={true}>
</ParamField>

<ParamField path="desc" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="1000">
</ParamField>

<ParamField path="offset" type="integer">
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

<Accordion title="APIFY_GET_LIST_OF_TASKS">
**Tool Name:** Get list of tasks

**Description**

```text wordWrap
Tool to fetch a paginated list of tasks belonging to the authenticated user. use when you need to browse or sort tasks created by the user.
```


**Action Parameters**

<ParamField path="desc" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="1000">
</ParamField>

<ParamField path="offset" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_LIST_OF_TASK_WEBHOOKS">
**Tool Name:** Get list of task webhooks

**Description**

```text wordWrap
Tool to get a list of webhooks for a specific actor task. use when you need to review or paginate webhooks after creating or updating a task.
```


**Action Parameters**

<ParamField path="actorTaskId" type="string" required={true}>
</ParamField>

<ParamField path="desc" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="1000">
</ParamField>

<ParamField path="offset" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_LOG">
**Tool Name:** Get log

**Description**

```text wordWrap
Tool to retrieve logs for a specific actor run or build. use after initiating an actor run or build when you need to inspect execution logs.
```


**Action Parameters**

<ParamField path="buildOrRunId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_OPEN_API_DEFINITION">
**Tool Name:** Get OpenAPI Definition

**Description**

```text wordWrap
Tool to get the openapi definition for a specific actor build. use when you need the api schema for code generation or analysis.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>

<ParamField path="buildId" type="string" required={true}>
</ParamField>

<ParamField path="token" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_GET_TASK_INPUT">
**Tool Name:** Get Task Input

**Description**

```text wordWrap
Tool to retrieve the input configuration of a specific task. use when you need to inspect stored task input before execution or debugging.
```


**Action Parameters**

<ParamField path="taskId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_RESURRECT_RUN">
**Tool Name:** Resurrect Run

**Description**

```text wordWrap
Tool to resurrect a finished actor run. use when you need to restart a completed or failed run. deprecated endpoint; may be removed in future.
```


**Action Parameters**

<ParamField path="runId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_RUN_ACTOR">
**Tool Name:** Run Actor Asynchronously

**Description**

```text wordWrap
Tool to run a specific actor asynchronously. use when you need to trigger an actor run without waiting for completion and retrieve its run details immediately.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>

<ParamField path="body" type="object">
</ParamField>

<ParamField path="build" type="string">
</ParamField>

<ParamField path="maxItems" type="number">
</ParamField>

<ParamField path="maxTotalChargeUsd" type="number">
</ParamField>

<ParamField path="memory" type="number">
</ParamField>

<ParamField path="timeout" type="number">
</ParamField>

<ParamField path="waitForFinish" type="number">
</ParamField>

<ParamField path="webhooks" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_RUN_ACTOR_SYNC">
**Tool Name:** Run Actor Sync

**Description**

```text wordWrap
Tool to run a specific actor synchronously with input and return its output record. use when immediate actor results are needed; runs may timeout after 300 seconds.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>

<ParamField path="build" type="string">
</ParamField>

<ParamField path="input" type="object" required={true}>
</ParamField>

<ParamField path="maxItems" type="integer">
</ParamField>

<ParamField path="maxTotalChargeUsd" type="number">
</ParamField>

<ParamField path="memory" type="integer">
</ParamField>

<ParamField path="outputRecordKey" type="string">
</ParamField>

<ParamField path="timeout" type="number">
</ParamField>

<ParamField path="webhooks" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_RUN_ACTOR_SYNC_GET_DATASET_ITEMS">
**Tool Name:** Run Actor Sync & Get Dataset Items

**Description**

```text wordWrap
Tool to run an actor synchronously and retrieve its dataset items. use when immediate access to run results is needed.
```


**Action Parameters**

<ParamField path="actorId" type="string" required={true}>
</ParamField>

<ParamField path="format" type="string" default="json">
</ParamField>

<ParamField path="input" type="object">
</ParamField>

<ParamField path="limit" type="integer" default="100">
</ParamField>

<ParamField path="offset" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_RUN_TASK">
**Tool Name:** Run Task Asynchronously

**Description**

```text wordWrap
Tool to run a specific actor task asynchronously. use when you need to trigger a task run without waiting for completion and immediately retrieve its run details.
```


**Action Parameters**

<ParamField path="actorTaskId" type="string" required={true}>
</ParamField>

<ParamField path="body" type="object">
</ParamField>

<ParamField path="build" type="string">
</ParamField>

<ParamField path="maxItems" type="number">
</ParamField>

<ParamField path="maxTotalChargeUsd" type="number">
</ParamField>

<ParamField path="memory" type="number">
</ParamField>

<ParamField path="timeout" type="number">
</ParamField>

<ParamField path="waitForFinish" type="number">
</ParamField>

<ParamField path="webhooks" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_STORE_DATA_IN_DATASET">
**Tool Name:** Store Data in Dataset

**Description**

```text wordWrap
Tool to store data items in a dataset. use after collecting data when you want to batch-append or update items in an existing dataset.
```


**Action Parameters**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="datasetId" type="string" required={true}>
</ParamField>

<ParamField path="deduplicate" type="boolean">
</ParamField>

<ParamField path="fields" type="string">
</ParamField>

<ParamField path="omit" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_STORE_DATA_IN_KEY_VALUE_STORE">
**Tool Name:** Store Data in Key-Value Store

**Description**

```text wordWrap
Tool to create or update a record in a key-value store. use after you have the store id and record key to persist json data.
```


**Action Parameters**

<ParamField path="recordKey" type="string" required={true}>
</ParamField>

<ParamField path="recordValue" type="object" required={true}>
</ParamField>

<ParamField path="storeId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_UPDATE_KEY_VALUE_STORE">
**Tool Name:** Update Key-Value Store

**Description**

```text wordWrap
Tool to update a key-value store's properties. use when renaming or changing access or schema version of the store after confirming the store id.
```


**Action Parameters**

<ParamField path="access" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="schemaVersion" type="integer">
</ParamField>

<ParamField path="storeId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="APIFY_UPDATE_TASK_INPUT">
**Tool Name:** Update Task Input

**Description**

```text wordWrap
Tool to update the input configuration of a specific actor task. use when you need to modify a scheduled tasks input before execution.
```


**Action Parameters**

<ParamField path="input" type="object" required={true}>
</ParamField>

<ParamField path="taskId" type="string" required={true}>
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
