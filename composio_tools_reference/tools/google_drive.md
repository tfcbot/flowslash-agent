---
title: Googledrive
subtitle: Learn how to use Googledrive with Composio
category: Document & File Management
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Googledrive%20with%20Composio'
---


## Overview

**SLUG**: `GOOGLEDRIVE`

### Description
Google Drive is a cloud storage solution for uploading, sharing, and collaborating on files across devices, with robust search and offline access

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string" default="https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/userinfo.email">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


<Accordion title="Bearer Token">
<ParamField path="token" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Googledrive
### Create an auth config
Use the dashboard to create an auth config for the Googledrive toolkit. This allows you to connect multiple Googledrive accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Googledrive](https://platform.composio.dev/marketplace/Googledrive)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Googledrive Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
googledrive_auth_config_id = "ac_YOUR_GOOGLEDRIVE_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Googledrive: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, googledrive_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const googledrive_auth_config_id = "ac_YOUR_GOOGLEDRIVE_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Googledrive: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, googledrive_auth_config_id);

// You can also verify the connection status using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


#### Using Bearer Token

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Auth config ID created above
googledrive_auth_config_id = "ac_YOUR_GOOGLEDRIVE_CONFIG_ID" 

# UUID from database/application
user_id = "0000-0000-0000"

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    # Replace this with a method to retrieve the Bearer Token from the user.
    bearer_token = input("[!] Enter bearer token")
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
        config={"auth_scheme": "BEARER_TOKEN", "val": bearer_token}
    )
    print(f"Successfully connected Googledrive for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, googledrive_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const googledrive_auth_config_id = "ac_YOUR_GOOGLEDRIVE_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the Bearer Token from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const bearerToken = await getUserBearerToken(userId);
  const bearerToken = "your_googledrive_bearer_token"; // Replace with actual bearer token
  
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId,
    {
      config: AuthScheme.BearerToken({
        token: bearerToken
      })
    }
  );
  
  // Bearer token authentication is immediate - no redirect needed
  console.log(`Successfully connected Googledrive for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, googledrive_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Googledrive toolkit's playground](https://app.composio.dev/app/Googledrive)

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

tools = composio.tools.get(user_id=user_id, toolkits=["GOOGLEDRIVE"])

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

// Get tools for Googledrive
const tools = await composio.tools.get(userId, {
  toolkits: ["GOOGLEDRIVE"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Googledrive?', // Your task here!
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

# Get tools for Googledrive
tools = composio.tools.get(user_id, toolkits=["GOOGLEDRIVE"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Googledrive?")
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

// Get tools for Googledrive
const tools = await composio.tools.get(userId, { 
  toolkits: ["GOOGLEDRIVE"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Googledrive?", // Your task here!
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
<Accordion title="GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE">
**Tool Name:** Add file sharing preference

**Description**

```text wordWrap
Modifies sharing permissions for an existing google drive file, granting a specified role to a user, group, domain, or 'anyone'.
```


**Action Parameters**

<ParamField path="domain" type="string">
</ParamField>

<ParamField path="email_address" type="string">
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="role" type="string" required={true}>
</ParamField>

<ParamField path="type" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_COPY_FILE">
**Tool Name:** Copy file

**Description**

```text wordWrap
Duplicates an existing file in google drive, identified by its `file id`.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="new_title" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_CREATE_COMMENT">
**Tool Name:** Create Comment

**Description**

```text wordWrap
Tool to create a comment on a file. use when you need to add a new comment to a specific file in google drive.
```


**Action Parameters**

<ParamField path="anchor" type="string">
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="quoted_file_content_mime_type" type="string">
</ParamField>

<ParamField path="quoted_file_content_value" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_CREATE_DRIVE">
**Tool Name:** Create Shared Drive

**Description**

```text wordWrap
Tool to create a new shared drive. use when you need to programmatically create a new shared drive for collaboration or storage.
```


**Action Parameters**

<ParamField path="backgroundImageFile" type="object">
</ParamField>

<ParamField path="colorRgb" type="string">
</ParamField>

<ParamField path="hidden" type="boolean">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="requestId" type="string" required={true}>
</ParamField>

<ParamField path="themeId" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_CREATE_FILE">
**Tool Name:** Create File or Folder

**Description**

```text wordWrap
Creates a new file or folder with metadata. use to create empty files or folders, or files with content by providing it in the request body (though this action primarily focuses on metadata creation).
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="fields" type="string">
</ParamField>

<ParamField path="mimeType" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="parents" type="array">
</ParamField>

<ParamField path="starred" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_CREATE_FILE_FROM_TEXT">
**Tool Name:** Create a File from Text

**Description**

```text wordWrap
Creates a new file in google drive from provided text content (up to 10mb), supporting various formats including automatic conversion to google workspace types.
```


**Action Parameters**

<ParamField path="file_name" type="string" required={true}>
</ParamField>

<ParamField path="mime_type" type="string" default="text/plain">
</ParamField>

<ParamField path="parent_id" type="string">
</ParamField>

<ParamField path="text_content" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_CREATE_FOLDER">
**Tool Name:** Create a folder

**Description**

```text wordWrap
Creates a new folder in google drive, optionally within a parent folder specified by its id or name; if a parent name is provided but not found, the action will fail.
```


**Action Parameters**

<ParamField path="folder_name" type="string" required={true}>
</ParamField>

<ParamField path="parent_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_CREATE_REPLY">
**Tool Name:** Create Reply

**Description**

```text wordWrap
Tool to create a reply to a comment in google drive. use when you need to respond to an existing comment on a file.
```


**Action Parameters**

<ParamField path="action" type="string">
</ParamField>

<ParamField path="comment_id" type="string" required={true}>
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="fields" type="string">
</ParamField>

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

<Accordion title="GOOGLEDRIVE_CREATE_SHORTCUT_TO_FILE">
**Tool Name:** Create Shortcut to File/Folder

**Description**

```text wordWrap
Tool to create a shortcut to a file or folder in google drive. use when you need to link to an existing drive item from another location without duplicating it.
```


**Action Parameters**

<ParamField path="ignoreDefaultVisibility" type="boolean">
</ParamField>

<ParamField path="includeLabels" type="string">
</ParamField>

<ParamField path="includePermissionsForView" type="string">
</ParamField>

<ParamField path="keepRevisionForever" type="boolean">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>

<ParamField path="target_id" type="string" required={true}>
</ParamField>

<ParamField path="target_mime_type" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_DELETE_COMMENT">
**Tool Name:** Delete Comment

**Description**

```text wordWrap
Deletes a comment from a file. use when you need to remove a specific comment from a google drive file.
```


**Action Parameters**

<ParamField path="comment_id" type="string" required={true}>
</ParamField>

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

<Accordion title="GOOGLEDRIVE_DELETE_DRIVE">
**Tool Name:** Delete Shared Drive

**Description**

```text wordWrap
Tool to permanently delete a shared drive. use when you need to remove a shared drive and its contents (if specified).
```


**Action Parameters**

<ParamField path="allowItemDeletion" type="boolean">
</ParamField>

<ParamField path="driveId" type="string" required={true}>
</ParamField>

<ParamField path="useDomainAdminAccess" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_DELETE_PERMISSION">
**Tool Name:** Delete Permission

**Description**

```text wordWrap
Deletes a permission from a file by permission id. use when you need to revoke access for a specific user or group from a file.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="permission_id" type="string" required={true}>
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>

<ParamField path="useDomainAdminAccess" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_DELETE_REPLY">
**Tool Name:** Delete Reply

**Description**

```text wordWrap
Tool to delete a specific reply by reply id. use when you need to remove a reply from a comment on a file.
```


**Action Parameters**

<ParamField path="comment_id" type="string" required={true}>
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="reply_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_DOWNLOAD_FILE">
**Tool Name:** Download a file from Google Drive

**Description**

```text wordWrap
Downloads a file from google drive by its id. for google workspace documents (docs, sheets, slides), optionally exports to a specified `mime type`. for other file types, downloads in their native format regardless of mime type.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="mime_type" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_EDIT_FILE">
**Tool Name:** Edit File

**Description**

```text wordWrap
Updates an existing google drive file by overwriting its entire content with new text (max 10mb).
```


**Action Parameters**

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="mime_type" type="string" default="text/plain">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_EMPTY_TRASH">
**Tool Name:** Empty Trash

**Description**

```text wordWrap
Tool to permanently delete all of the user's trashed files. use when you want to empty the trash in google drive.
```


**Action Parameters**

<ParamField path="driveId" type="string">
</ParamField>

<ParamField path="enforceSingleParent" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_FILES_MODIFY_LABELS">
**Tool Name:** Modify File Labels

**Description**

```text wordWrap
Modifies the set of labels applied to a file. returns a list of the labels that were added or modified. use when you need to programmatically change labels on a google drive file, such as adding, updating, or removing them.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="kind" type="string" default="drive#modifyLabelsRequest">
</ParamField>

<ParamField path="label_modifications" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_FIND_FILE">
**Tool Name:** Find file

**Description**

```text wordWrap
Tool to list or search for files and folders in google drive. use when you need to find specific files based on query criteria or list contents of a drive/folder.
```


**Action Parameters**

<ParamField path="corpora" type="string">
</ParamField>

<ParamField path="driveId" type="string">
</ParamField>

<ParamField path="fields" type="string" default="*">
</ParamField>

<ParamField path="includeItemsFromAllDrives" type="boolean">
</ParamField>

<ParamField path="orderBy" type="string">
</ParamField>

<ParamField path="pageSize" type="integer" default="100">
</ParamField>

<ParamField path="pageToken" type="string">
</ParamField>

<ParamField path="q" type="string">
</ParamField>

<ParamField path="spaces" type="string" default="drive">
</ParamField>

<ParamField path="supportsAllDrives" type="boolean" default="True">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_FIND_FOLDER">
**Tool Name:** Find folder

**Description**

```text wordWrap
Tool to find a folder in google drive by its name and optionally a parent folder. use when you need to locate a specific folder to perform further actions like creating files in it or listing its contents.
```


**Action Parameters**

<ParamField path="full_text_contains" type="string">
</ParamField>

<ParamField path="full_text_not_contains" type="string">
</ParamField>

<ParamField path="modified_after" type="string">
</ParamField>

<ParamField path="name_contains" type="string">
</ParamField>

<ParamField path="name_exact" type="string">
</ParamField>

<ParamField path="name_not_contains" type="string">
</ParamField>

<ParamField path="starred" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GENERATE_IDS">
**Tool Name:** Generate File IDs

**Description**

```text wordWrap
Generates a set of file ids which can be provided in create or copy requests. use when you need to pre-allocate ids for new files or copies.
```


**Action Parameters**

<ParamField path="count" type="integer">
</ParamField>

<ParamField path="space" type="string">
</ParamField>

<ParamField path="type" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GET_ABOUT">
**Tool Name:** Get about

**Description**

```text wordWrap
Tool to retrieve information about the user, the user's drive, and system capabilities. use when you need to check storage quotas, user details, or supported import/export formats.
```


**Action Parameters**

<ParamField path="fields" type="string" default="*">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GET_CHANGES_START_PAGE_TOKEN">
**Tool Name:** Get Changes Start Page Token

**Description**

```text wordWrap
Tool to get the starting pagetoken for listing future changes in google drive. use this when you need to track changes to files and folders.
```


**Action Parameters**

<ParamField path="driveId" type="string">
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>

<ParamField path="supportsTeamDrives" type="boolean">
</ParamField>

<ParamField path="teamDriveId" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GET_COMMENT">
**Tool Name:** Get Comment

**Description**

```text wordWrap
Tool to get a comment by id. use when you need to retrieve a specific comment from a google drive file and have both the file id and comment id.
```


**Action Parameters**

<ParamField path="commentId" type="string" required={true}>
</ParamField>

<ParamField path="fileId" type="string" required={true}>
</ParamField>

<ParamField path="includeDeleted" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GET_DRIVE">
**Tool Name:** Get Shared Drive

**Description**

```text wordWrap
Tool to get a shared drive by id. use when you need to retrieve information about a specific shared drive.
```


**Action Parameters**

<ParamField path="drive_id" type="string" required={true}>
</ParamField>

<ParamField path="use_domain_admin_access" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GET_FILE_METADATA">
**Tool Name:** Get File Metadata

**Description**

```text wordWrap
Tool to get a file's metadata by id. use when you need to retrieve the metadata for a specific file in google drive.
```


**Action Parameters**

<ParamField path="acknowledgeAbuse" type="boolean">
</ParamField>

<ParamField path="fileId" type="string" required={true}>
</ParamField>

<ParamField path="includeLabels" type="string">
</ParamField>

<ParamField path="includePermissionsForView" type="string">
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GET_PERMISSION">
**Tool Name:** Get Permission

**Description**

```text wordWrap
Gets a permission by id. use this tool to retrieve a specific permission for a file or shared drive.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="permission_id" type="string" required={true}>
</ParamField>

<ParamField path="supports_all_drives" type="boolean">
</ParamField>

<ParamField path="use_domain_admin_access" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GET_REPLY">
**Tool Name:** Get Reply

**Description**

```text wordWrap
Tool to get a specific reply to a comment on a file. use when you need to retrieve the details of a particular reply.
```


**Action Parameters**

<ParamField path="commentId" type="string" required={true}>
</ParamField>

<ParamField path="fileId" type="string" required={true}>
</ParamField>

<ParamField path="includeDeleted" type="boolean">
</ParamField>

<ParamField path="replyId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GET_REVISION">
**Tool Name:** Get Revision

**Description**

```text wordWrap
Tool to get a specific revision's metadata by revision id. use when you need to retrieve information about a particular version of a file.
```


**Action Parameters**

<ParamField path="acknowledge_abuse" type="boolean">
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="revision_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_GOOGLE_DRIVE_DELETE_FOLDER_OR_FILE_ACTION">
**Tool Name:** Delete folder or file

**Description**

```text wordWrap
Tool to delete a file or folder in google drive. use when you need to permanently remove a specific file or folder using its id. note: this action is irreversible.
```


**Action Parameters**

<ParamField path="fileId" type="string" required={true}>
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_HIDE_DRIVE">
**Tool Name:** Hide Shared Drive

**Description**

```text wordWrap
Tool to hide a shared drive from the default view. use when you want to remove a shared drive from the user's main google drive interface without deleting it.
```


**Action Parameters**

<ParamField path="drive_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_LIST_CHANGES">
**Tool Name:** List Changes

**Description**

```text wordWrap
Tool to list the changes for a user or shared drive. use when you need to track modifications to files and folders, such as creations, deletions, or permission changes. this action requires a `pagetoken` which can be initially obtained using the `get changes start page token` action or from a previous `list changes` response.
```


**Action Parameters**

<ParamField path="driveId" type="string">
</ParamField>

<ParamField path="includeCorpusRemovals" type="boolean">
</ParamField>

<ParamField path="includeItemsFromAllDrives" type="boolean">
</ParamField>

<ParamField path="includeLabels" type="string">
</ParamField>

<ParamField path="includePermissionsForView" type="string">
</ParamField>

<ParamField path="includeRemoved" type="boolean" default="True">
</ParamField>

<ParamField path="pageSize" type="integer" default="100">
</ParamField>

<ParamField path="pageToken" type="string" required={true}>
</ParamField>

<ParamField path="restrictToMyDrive" type="boolean">
</ParamField>

<ParamField path="spaces" type="string" default="drive">
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_LIST_COMMENTS">
**Tool Name:** List Comments

**Description**

```text wordWrap
Tool to list all comments for a file in google drive. use when you need to retrieve comments associated with a specific file.
```


**Action Parameters**

<ParamField path="fields" type="string" default="*">
</ParamField>

<ParamField path="fileId" type="string" required={true}>
</ParamField>

<ParamField path="includeDeleted" type="boolean">
</ParamField>

<ParamField path="pageSize" type="integer" default="20">
</ParamField>

<ParamField path="pageToken" type="string">
</ParamField>

<ParamField path="startModifiedTime" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_LIST_FILE_LABELS">
**Tool Name:** List File Labels

**Description**

```text wordWrap
Tool to list the labels on a file. use when you need to retrieve all labels associated with a specific file in google drive.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer">
</ParamField>

<ParamField path="page_token" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_LIST_FILES">
**Tool Name:** List Files and Folders

**Description**

```text wordWrap
Tool to list a user's files and folders in google drive. use this to search or browse for files and folders based on various criteria.
```


**Action Parameters**

<ParamField path="corpora" type="string">
</ParamField>

<ParamField path="driveId" type="string">
</ParamField>

<ParamField path="fields" type="string">
</ParamField>

<ParamField path="folderId" type="string">
</ParamField>

<ParamField path="includeItemsFromAllDrives" type="boolean">
</ParamField>

<ParamField path="includeLabels" type="string">
</ParamField>

<ParamField path="includePermissionsForView" type="string">
</ParamField>

<ParamField path="orderBy" type="string">
</ParamField>

<ParamField path="pageSize" type="integer" default="100">
</ParamField>

<ParamField path="pageToken" type="string">
</ParamField>

<ParamField path="q" type="string">
</ParamField>

<ParamField path="spaces" type="string">
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_LIST_PERMISSIONS">
**Tool Name:** List Permissions

**Description**

```text wordWrap
Tool to list a file's permissions. use when you need to retrieve all permissions associated with a specific file or shared drive.
```


**Action Parameters**

<ParamField path="fileId" type="string" required={true}>
</ParamField>

<ParamField path="includePermissionsForView" type="string">
</ParamField>

<ParamField path="pageSize" type="integer">
</ParamField>

<ParamField path="pageToken" type="string">
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>

<ParamField path="useDomainAdminAccess" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_LIST_REPLIES_TO_COMMENT">
**Tool Name:** List Replies to Comment

**Description**

```text wordWrap
Tool to list replies to a comment in google drive. use this when you need to retrieve all replies associated with a specific comment on a file.
```


**Action Parameters**

<ParamField path="comment_id" type="string" required={true}>
</ParamField>

<ParamField path="fields" type="string" default="*">
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="include_deleted" type="boolean">
</ParamField>

<ParamField path="page_size" type="integer">
</ParamField>

<ParamField path="page_token" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_LIST_REVISIONS">
**Tool Name:** List File Revisions

**Description**

```text wordWrap
Tool to list a file's revisions. use when you need to retrieve the revision history of a specific file in google drive.
```


**Action Parameters**

<ParamField path="fileId" type="string" required={true}>
</ParamField>

<ParamField path="pageSize" type="integer">
</ParamField>

<ParamField path="pageToken" type="string">
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_LIST_SHARED_DRIVES">
**Tool Name:** List Shared Drives

**Description**

```text wordWrap
Tool to list the user's shared drives. use when you need to get a list of all shared drives accessible to the authenticated user.
```


**Action Parameters**

<ParamField path="pageSize" type="integer">
</ParamField>

<ParamField path="pageToken" type="string">
</ParamField>

<ParamField path="q" type="string">
</ParamField>

<ParamField path="useDomainAdminAccess" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_MOVE_FILE">
**Tool Name:** Move File

**Description**

```text wordWrap
Tool to move a file from one folder to another in google drive. use when you need to reorganize files by changing their parent folder(s).
```


**Action Parameters**

<ParamField path="add_parents" type="string">
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="include_labels" type="string">
</ParamField>

<ParamField path="include_permissions_for_view" type="string">
</ParamField>

<ParamField path="keep_revision_forever" type="boolean">
</ParamField>

<ParamField path="ocr_language" type="string">
</ParamField>

<ParamField path="remove_parents" type="string">
</ParamField>

<ParamField path="supports_all_drives" type="boolean">
</ParamField>

<ParamField path="use_content_as_indexable_text" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_PARSE_FILE">
**Tool Name:** Export or download a file

**Description**

```text wordWrap
Deprecated: exports google workspace files (max 10mb) to a specified format using `mime type`, or downloads other file types; use `googledrive download file` instead.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="mime_type" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_STOP_WATCH_CHANNEL">
**Tool Name:** Stop Watch Channel

**Description**

```text wordWrap
Tool to stop watching resources through a specified channel. use this when you want to stop receiving notifications for a previously established watch.
```


**Action Parameters**

<ParamField path="address" type="string">
</ParamField>

<ParamField path="channelType" type="string">
</ParamField>

<ParamField path="expiration" type="string">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="kind" type="string" default="api#channel">
</ParamField>

<ParamField path="params" type="object">
</ParamField>

<ParamField path="payload" type="boolean">
</ParamField>

<ParamField path="resourceId" type="string" required={true}>
</ParamField>

<ParamField path="resourceUri" type="string">
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

<Accordion title="GOOGLEDRIVE_UNHIDE_DRIVE">
**Tool Name:** Unhide Shared Drive

**Description**

```text wordWrap
Tool to unhide a shared drive. use when you need to restore a shared drive to the default view.
```


**Action Parameters**

<ParamField path="driveId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_UNTRASH_FILE">
**Tool Name:** Untrash File

**Description**

```text wordWrap
Tool to restore a file from the trash. use when you need to recover a deleted file. this action updates the file's metadata to set the 'trashed' property to false.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_UPDATE_COMMENT">
**Tool Name:** Update Comment

**Description**

```text wordWrap
Tool to update an existing comment on a google drive file. use when you need to change the content or status (e.g., resolve) of a comment.
```


**Action Parameters**

<ParamField path="comment_id" type="string" required={true}>
</ParamField>

<ParamField path="content" type="string">
</ParamField>

<ParamField path="fields" type="string">
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="resolved" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_UPDATE_DRIVE">
**Tool Name:** Update Shared Drive

**Description**

```text wordWrap
Tool to update the metadata for a shared drive. use when you need to modify properties like the name, theme, background image, or restrictions of a shared drive.
```


**Action Parameters**

<ParamField path="backgroundImageFile" type="object">
</ParamField>

<ParamField path="colorRgb" type="string">
</ParamField>

<ParamField path="driveId" type="string" required={true}>
</ParamField>

<ParamField path="hidden" type="boolean">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="restrictions" type="object">
</ParamField>

<ParamField path="themeId" type="string">
</ParamField>

<ParamField path="useDomainAdminAccess" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_UPDATE_FILE_PUT">
**Tool Name:** Update File (Metadata)

**Description**

```text wordWrap
Updates file metadata. uses patch semantics (partial update) as per google drive api v3. use this tool to modify attributes of an existing file like its name, description, or parent folders. note: this action currently supports metadata updates only. file content updates require multipart/related upload and are not yet implemented.
```


**Action Parameters**

<ParamField path="add_parents" type="string">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="keep_revision_forever" type="boolean">
</ParamField>

<ParamField path="mime_type" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="ocr_language" type="string">
</ParamField>

<ParamField path="remove_parents" type="string">
</ParamField>

<ParamField path="starred" type="boolean">
</ParamField>

<ParamField path="supports_all_drives" type="boolean">
</ParamField>

<ParamField path="use_domain_admin_access" type="boolean">
</ParamField>

<ParamField path="viewers_can_copy_content" type="boolean">
</ParamField>

<ParamField path="writers_can_share" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_UPDATE_FILE_REVISION_METADATA">
**Tool Name:** Update File Revision Metadata

**Description**

```text wordWrap
Updates metadata of a file revision (e.g., keepforever, publish). use this tool to modify the metadata of a specific revision of a file in google drive.
```


**Action Parameters**

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="keep_forever" type="boolean">
</ParamField>

<ParamField path="publishAuto" type="boolean">
</ParamField>

<ParamField path="published" type="boolean">
</ParamField>

<ParamField path="publishedOutsideDomain" type="boolean">
</ParamField>

<ParamField path="revision_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_UPDATE_PERMISSION">
**Tool Name:** Update Permission

**Description**

```text wordWrap
Tool to update a permission with patch semantics. use when you need to modify an existing permission for a file or shared drive.
```


**Action Parameters**

<ParamField path="enforceExpansiveAccess" type="boolean">
</ParamField>

<ParamField path="fileId" type="string" required={true}>
</ParamField>

<ParamField path="permission" type="object" required={true}>
</ParamField>

<ParamField path="permissionId" type="string" required={true}>
</ParamField>

<ParamField path="removeExpiration" type="boolean">
</ParamField>

<ParamField path="supportsAllDrives" type="boolean">
</ParamField>

<ParamField path="transferOwnership" type="boolean">
</ParamField>

<ParamField path="useDomainAdminAccess" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_UPDATE_REPLY">
**Tool Name:** Update Reply

**Description**

```text wordWrap
Tool to update a reply to a comment on a google drive file. use when you need to modify the content of an existing reply.
```


**Action Parameters**

<ParamField path="comment_id" type="string" required={true}>
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="fields" type="string" required={true}>
</ParamField>

<ParamField path="file_id" type="string" required={true}>
</ParamField>

<ParamField path="reply_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_UPLOAD_FILE">
**Tool Name:** Upload File

**Description**

```text wordWrap
Uploads a file (max 5mb) to google drive, moving it to a specified folder if a valid folder id is provided, otherwise uploads to root.
```


**Action Parameters**

<ParamField path="file_to_upload" type="object" required={true}>
</ParamField>

<ParamField path="folder_to_upload_to" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLEDRIVE_WATCH_CHANGES">
**Tool Name:** Watch Drive Changes

**Description**

```text wordWrap
Tool to subscribe to changes for a user or shared drive in google drive. use when you need to monitor a google drive for modifications and receive notifications at a specified webhook url.
```


**Action Parameters**

<ParamField path="address" type="string" required={true}>
</ParamField>

<ParamField path="drive_id" type="string">
</ParamField>

<ParamField path="expiration" type="integer">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="include_corpus_removals" type="boolean">
</ParamField>

<ParamField path="include_items_from_all_drives" type="boolean">
</ParamField>

<ParamField path="include_labels" type="string">
</ParamField>

<ParamField path="include_permissions_for_view" type="string">
</ParamField>

<ParamField path="include_removed" type="boolean" default="True">
</ParamField>

<ParamField path="page_size" type="integer" default="100">
</ParamField>

<ParamField path="page_token" type="string">
</ParamField>

<ParamField path="params" type="object">
</ParamField>

<ParamField path="restrict_to_my_drive" type="boolean">
</ParamField>

<ParamField path="spaces" type="string" default="drive">
</ParamField>

<ParamField path="supports_all_drives" type="boolean">
</ParamField>

<ParamField path="token" type="string">
</ParamField>

<ParamField path="type" type="string" required={true}>
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
