---
title: Dropbox
subtitle: Learn how to use Dropbox with Composio
category: Document & File Management
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Dropbox%20with%20Composio'
---


## Overview

**SLUG**: `DROPBOX`

### Description
Dropbox is a cloud storage service offering file syncing, sharing, and collaboration across devices with version control and robust integrations

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="full" type="string" required={true} default="https://api.dropboxapi.com">
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string" default="email,profile,account_info.write,account_info.read,files.metadata.write,files.metadata.read,files.content.write,files.content.read,openid,file_requests.write,file_requests.read,sharing.write,sharing.read,contacts.write,contacts.read">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


## Connecting to Dropbox
### Create an auth config
Use the dashboard to create an auth config for the Dropbox toolkit. This allows you to connect multiple Dropbox accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Dropbox](https://platform.composio.dev/marketplace/Dropbox)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Dropbox Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
dropbox_auth_config_id = "ac_YOUR_DROPBOX_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Dropbox: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, dropbox_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const dropbox_auth_config_id = "ac_YOUR_DROPBOX_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Dropbox: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, dropbox_auth_config_id);

// You can also verify the connection status using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Dropbox toolkit's playground](https://app.composio.dev/app/Dropbox)

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

tools = composio.tools.get(user_id=user_id, toolkits=["DROPBOX"])

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

// Get tools for Dropbox
const tools = await composio.tools.get(userId, {
  toolkits: ["DROPBOX"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Dropbox?', // Your task here!
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

# Get tools for Dropbox
tools = composio.tools.get(user_id, toolkits=["DROPBOX"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Dropbox?")
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

// Get tools for Dropbox
const tools = await composio.tools.get(userId, { 
  toolkits: ["DROPBOX"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Dropbox?", // Your task here!
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
<Accordion title="DROPBOX_CREATE_FILE_REQUEST">
**Tool Name:** Create file request

**Description**

```text wordWrap
Tool to create a new file request in dropbox. use when you need to request files from others by generating a unique link for uploads to a specified dropbox folder, optionally with a deadline.
```


**Action Parameters**

<ParamField path="deadline" type="object">
</ParamField>

<ParamField path="destination" type="string" required={true}>
</ParamField>

<ParamField path="open" type="boolean" default="True">
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

<Accordion title="DROPBOX_CREATE_FOLDER">
**Tool Name:** Create folder

**Description**

```text wordWrap
Tool to create a new folder at a specified path in dropbox. use when you need to organize files by creating a new directory. requires the 'files.content.write' scope.
```


**Action Parameters**

<ParamField path="autorename" type="boolean">
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="DROPBOX_CREATE_PAPER">
**Tool Name:** Create paper document

**Description**

```text wordWrap
Creates a new dropbox paper document at the specified path using html or markdown content.
```


**Action Parameters**

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="import_format" type="string" default="html">
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="DROPBOX_DELETE_FILE_OR_FOLDER">
**Tool Name:** Delete file or folder

**Description**

```text wordWrap
Permanently deletes the file or folder at the specified path in dropbox. use when you need to remove a specific file or folder. requires the `files.content.write` scope.
```


**Action Parameters**

<ParamField path="path" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="DROPBOX_GET_ABOUT_ME">
**Tool Name:** Get about me

**Description**

```text wordWrap
Tool to get information about the current user's dropbox account. use when you need to retrieve account details like email, name, or account type.
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

<Accordion title="DROPBOX_LIST_FILES_IN_FOLDER">
**Tool Name:** List files in folder

**Description**

```text wordWrap
Tool to list files and folders in a specified dropbox directory. use when you need to see the contents of a folder, including subfolders if recursive is true.
```


**Action Parameters**

<ParamField path="include_deleted" type="boolean">
</ParamField>

<ParamField path="include_media_info" type="boolean">
</ParamField>

<ParamField path="include_non_downloadable_files" type="boolean" default="True">
</ParamField>

<ParamField path="limit" type="integer" default="2000">
</ParamField>

<ParamField path="path" type="string">
</ParamField>

<ParamField path="recursive" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="DROPBOX_LIST_FOLDERS">
**Tool Name:** List folder contents

**Description**

```text wordWrap
Retrieves a list of folders, files, and deleted entries from a specified dropbox path.
```


**Action Parameters**

<ParamField path="include_deleted" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="2000">
</ParamField>

<ParamField path="path" type="string">
</ParamField>

<ParamField path="recursive" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="DROPBOX_MOVE_FILE_OR_FOLDER">
**Tool Name:** Move file or folder

**Description**

```text wordWrap
Move file or folder
```


**Action Parameters**

<ParamField path="allow_ownership_transfer" type="boolean">
</ParamField>

<ParamField path="allow_shared_folder" type="boolean">
</ParamField>

<ParamField path="autorename" type="boolean">
</ParamField>

<ParamField path="from_path" type="string" required={true}>
</ParamField>

<ParamField path="to_path" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="DROPBOX_READ_FILE">
**Tool Name:** Read a file

**Description**

```text wordWrap
Downloads a file from the specified dropbox path, requiring `files.content.read` scope.
```


**Action Parameters**

<ParamField path="path" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="DROPBOX_SEARCH_FILE_OR_FOLDER">
**Tool Name:** Search File or Folder

**Description**

```text wordWrap
Tool to search for files and folders in dropbox. use when you need to find an item by name or content, optionally within a specific path or with other filters, and paginate through results. example: search for 'report.docx' in the '/finance' folder.
```


**Action Parameters**

<ParamField path="options" type="object">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="DROPBOX_UPLOAD_FILE">
**Tool Name:** Upload File

**Description**

```text wordWrap
Uploads a file to a specified path in the user's dropbox, with options for handling existing files.
```


**Action Parameters**

<ParamField path="autorename" type="boolean">
</ParamField>

<ParamField path="content" type="object" required={true}>
</ParamField>

<ParamField path="mode" type="string" default="add">
</ParamField>

<ParamField path="mute" type="boolean">
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>

<ParamField path="strict_conflict" type="boolean">
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
