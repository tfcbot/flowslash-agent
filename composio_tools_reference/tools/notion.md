---
title: Notion
subtitle: Learn how to use Notion with Composio
category: Productivity & Project Management
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Notion%20with%20Composio'
---


## Overview

**SLUG**: `NOTION`

### Description
Notion centralizes notes, docs, wikis, and tasks in a unified workspace, letting teams build custom workflows for collaboration and knowledge management

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


<Accordion title="API Key">
<ParamField path="generic_api_key" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Notion
### Create an auth config
Use the dashboard to create an auth config for the Notion toolkit. This allows you to connect multiple Notion accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Notion](https://platform.composio.dev/marketplace/Notion)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Notion Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
notion_auth_config_id = "ac_YOUR_NOTION_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Notion: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, notion_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const notion_auth_config_id = "ac_YOUR_NOTION_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Notion: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, notion_auth_config_id);

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
notion_auth_config_id = "ac_YOUR_NOTION_CONFIG_ID" # Auth config ID created above
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
    print(f"Successfully connected Notion for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, notion_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const notion_auth_config_id = "ac_YOUR_NOTION_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the API key from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const userApiKey = await getUserApiKey(userId);
  const userApiKey = "your_notion_api_key"; // Replace with actual API key
  
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
  console.log(`Successfully connected Notion for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, notion_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Notion toolkit's playground](https://app.composio.dev/app/Notion)

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

tools = composio.tools.get(user_id=user_id, toolkits=["NOTION"])

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

// Get tools for Notion
const tools = await composio.tools.get(userId, {
  toolkits: ["NOTION"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Notion?', // Your task here!
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

# Get tools for Notion
tools = composio.tools.get(user_id, toolkits=["NOTION"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Notion?")
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

// Get tools for Notion
const tools = await composio.tools.get(userId, { 
  toolkits: ["NOTION"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Notion?", // Your task here!
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
<Accordion title="NOTION_ADD_MULTIPLE_PAGE_CONTENT">
**Tool Name:** Add multiple content blocks (bulk, user-friendly)

**Description**

```text wordWrap
Efficiently adds multiple standard content blocks to a notion page in a single api call with automatic markdown parsing. the 'content' field in notionrichtext blocks now automatically detects and parses markdown formatting including headers (# ## ###), bold (**text**), italic (*text*), strikethrough (~~text~~), inline code (`code`), links ([text](url)), and more. ideal for bulk content creation, ai agents, and replacing multiple individual add page content calls. supports automatic text formatting, content splitting, and up to 100 blocks per request.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="content_blocks" type="array" required={true}>
</ParamField>

<ParamField path="parent_block_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_ADD_PAGE_CONTENT">
**Tool Name:** Add content to Notion page

**Description**

```text wordWrap
Deprecated: appends a single content block to a notion page or a parent block (must be page, toggle, to-do, bulleted/numbered list, callout, or quote); invoke repeatedly to add multiple blocks.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="content_block" type="object" required={true}>
</ParamField>

<ParamField path="parent_block_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_APPEND_BLOCK_CHILDREN">
**Tool Name:** Append complex blocks (advanced, full control)

**Description**

```text wordWrap
Appends complex blocks with full notion block structure to a parent block or page. use for advanced scenarios requiring precise control: code blocks, tables, embeds, nested children within blocks, or when working with pre-built notion block objects. requires full notion api block schema - use add multiple page content for simpler content creation.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="block_id" type="string" required={true}>
</ParamField>

<ParamField path="children" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_ARCHIVE_NOTION_PAGE">
**Tool Name:** Archive Notion Page

**Description**

```text wordWrap
Archives (moves to trash) or unarchives (restores from trash) a specified notion page.
```


**Action Parameters**

<ParamField path="archive" type="boolean" default="True">
</ParamField>

<ParamField path="page_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_CREATE_COMMENT">
**Tool Name:** Create comment

**Description**

```text wordWrap
Adds a comment to a notion page (via `parent page id`) or to an existing discussion thread (via `discussion id`); cannot create new discussion threads on specific blocks (inline comments).
```


**Action Parameters**

<ParamField path="comment" type="object" required={true}>
</ParamField>

<ParamField path="discussion_id" type="string">
</ParamField>

<ParamField path="parent_page_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_CREATE_DATABASE">
**Tool Name:** Create Notion Database

**Description**

```text wordWrap
Creates a new notion database as a subpage under a specified parent page with a defined properties schema; use this action exclusively for creating new databases.
```


**Action Parameters**

<ParamField path="parent_id" type="string" required={true}>
</ParamField>

<ParamField path="properties" type="array" required={true}>
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

<Accordion title="NOTION_CREATE_NOTION_PAGE">
**Tool Name:** Create Notion page

**Description**

```text wordWrap
Creates a new empty page in a notion workspace.
```


**Action Parameters**

<ParamField path="cover" type="string">
</ParamField>

<ParamField path="icon" type="string">
</ParamField>

<ParamField path="parent_id" type="string" required={true}>
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

<Accordion title="NOTION_DELETE_BLOCK">
**Tool Name:** Delete a block

**Description**

```text wordWrap
Archives a notion block, page, or database using its id, which sets its 'archived' property to true (like moving to "trash" in the ui) and allows it to be restored later.
```


**Action Parameters**

<ParamField path="block_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_DUPLICATE_PAGE">
**Tool Name:** Duplicate page

**Description**

```text wordWrap
Duplicates a notion page, including all its content, properties, and nested blocks, under a specified parent page or workspace.
```


**Action Parameters**

<ParamField path="page_id" type="string" required={true}>
</ParamField>

<ParamField path="parent_id" type="string" required={true}>
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

<Accordion title="NOTION_FETCH_BLOCK_CONTENTS">
**Tool Name:** Fetch Notion Block Children

**Description**

```text wordWrap
Retrieves a paginated list of direct, first-level child block objects along with contents for a given parent notion block or page id; use block ids from the response for subsequent calls to access deeply nested content.
```


**Action Parameters**

<ParamField path="block_id" type="string" required={true}>
</ParamField>

<ParamField path="page_size" type="integer">
</ParamField>

<ParamField path="start_cursor" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_FETCH_BLOCK_METADATA">
**Tool Name:** Fetch Notion block metadata

**Description**

```text wordWrap
Fetches metadata for a notion block (or page, as pages are blocks) using its valid uuid; if the block has children, use fetch block contents to fetch their contents.
```


**Action Parameters**

<ParamField path="block_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_FETCH_COMMENTS">
**Tool Name:** Fetch comments

**Description**

```text wordWrap
Fetches unresolved comments for a specified notion block or page id.
```


**Action Parameters**

<ParamField path="block_id" type="string" required={true}>
</ParamField>

<ParamField path="page_size" type="integer" default="100">
</ParamField>

<ParamField path="start_cursor" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_FETCH_DATA">
**Tool Name:** Fetch Notion Data

**Description**

```text wordWrap
Fetches notion items (pages and/or databases) from the notion workspace, use this to get minimal data about the items in the workspace with a query or list all items in the workspace with minimal data
```


**Action Parameters**

<ParamField path="get_all" type="boolean">
</ParamField>

<ParamField path="get_databases" type="boolean">
</ParamField>

<ParamField path="get_pages" type="boolean">
</ParamField>

<ParamField path="page_size" type="integer" default="100">
</ParamField>

<ParamField path="query" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_FETCH_DATABASE">
**Tool Name:** Fetch Database

**Description**

```text wordWrap
Fetches a notion database's structural metadata (properties, title, etc.) via its `database id`, not the data entries; `database id` must reference an existing database.
```


**Action Parameters**

<ParamField path="database_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_FETCH_ROW">
**Tool Name:** Fetch database row

**Description**

```text wordWrap
Retrieves a notion database row's properties and metadata; use fetch block contents for page content blocks.
```


**Action Parameters**

<ParamField path="page_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_GET_ABOUT_ME">
**Tool Name:** Get About Me

**Description**

```text wordWrap
Retrieves the user object for the bot associated with the current notion integration token, typically to obtain the bot's user id for other api operations.
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

<Accordion title="NOTION_GET_ABOUT_USER">
**Tool Name:** Get about user

**Description**

```text wordWrap
Retrieves detailed information about a specific notion user, such as their name, avatar, and email, based on their unique user id.
```


**Action Parameters**

<ParamField path="user_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_GET_PAGE_PROPERTY_ACTION">
**Tool Name:** Get page property

**Description**

```text wordWrap
Call this to get a specific property from a notion page when you have a valid `page id` and `property id`; handles pagination for properties returning multiple items.
```


**Action Parameters**

<ParamField path="page_id" type="string" required={true}>
</ParamField>

<ParamField path="page_size" type="integer">
</ParamField>

<ParamField path="property_id" type="string" required={true}>
</ParamField>

<ParamField path="start_cursor" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_INSERT_ROW_DATABASE">
**Tool Name:** Insert row database

**Description**

```text wordWrap
Creates a new page (row) in a specified notion database.
```


**Action Parameters**

<ParamField path="child_blocks" type="array">
</ParamField>

<ParamField path="cover" type="string">
</ParamField>

<ParamField path="database_id" type="string" required={true}>
</ParamField>

<ParamField path="icon" type="string">
</ParamField>

<ParamField path="properties" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_LIST_USERS">
**Tool Name:** List users

**Description**

```text wordWrap
Retrieves a paginated list of users (excluding guests) from the notion workspace; the number of users returned per page may be less than the requested `page size`.
```


**Action Parameters**

<ParamField path="page_size" type="integer" default="30">
</ParamField>

<ParamField path="start_cursor" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_QUERY_DATABASE">
**Tool Name:** Query database

**Description**

```text wordWrap
Queries a notion database for pages (rows), where rows are pages and columns are properties; ensure sort property names correspond to existing database properties.
```


**Action Parameters**

<ParamField path="database_id" type="string" required={true}>
</ParamField>

<ParamField path="page_size" type="integer" default="2">
</ParamField>

<ParamField path="sorts" type="array">
</ParamField>

<ParamField path="start_cursor" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_RETRIEVE_COMMENT">
**Tool Name:** Retrieve Comment

**Description**

```text wordWrap
Tool to retrieve a specific comment by its id. use when you have a comment id and need to fetch its details.
```


**Action Parameters**

<ParamField path="comment_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_RETRIEVE_DATABASE_PROPERTY">
**Tool Name:** Retrieve Database Property

**Description**

```text wordWrap
Tool to retrieve a specific property object of a notion database. use when you need to get details about a single database column/property.
```


**Action Parameters**

<ParamField path="database_id" type="string" required={true}>
</ParamField>

<ParamField path="property_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_SEARCH_NOTION_PAGE">
**Tool Name:** Search Notion page

**Description**

```text wordWrap
Searches notion pages and databases by title; an empty query lists all accessible items, useful for discovering ids or as a fallback when a specific query yields no results.
```


**Action Parameters**

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="filter_property" type="string" default="object">
</ParamField>

<ParamField path="filter_value" type="string" default="page">
</ParamField>

<ParamField path="page_size" type="integer" default="2">
</ParamField>

<ParamField path="query" type="string">
</ParamField>

<ParamField path="start_cursor" type="string">
</ParamField>

<ParamField path="timestamp" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_UPDATE_BLOCK">
**Tool Name:** Update block

**Description**

```text wordWrap
Updates an existing notion block's textual content or type-specific properties (e.g., 'checked' status, 'color'), using its `block id` and the specified `block type`.
```


**Action Parameters**

<ParamField path="additional_properties" type="object">
</ParamField>

<ParamField path="block_id" type="string" required={true}>
</ParamField>

<ParamField path="block_type" type="string" required={true}>
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_UPDATE_PAGE">
**Tool Name:** Update Page

**Description**

```text wordWrap
Tool to update the properties, icon, cover, or archive status of a page. use when you need to modify existing page attributes.
```


**Action Parameters**

<ParamField path="archived" type="boolean">
</ParamField>

<ParamField path="cover" type="object">
</ParamField>

<ParamField path="icon" type="object">
</ParamField>

<ParamField path="page_id" type="string" required={true}>
</ParamField>

<ParamField path="properties" type="object">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_UPDATE_ROW_DATABASE">
**Tool Name:** Update row database

**Description**

```text wordWrap
Updates or archives an existing notion database row (page) using its `row id`, allowing modification of its icon, cover, and/or properties; ensure the target page is accessible and property details (names/ids and values) align with the database schema and specified formats.
```


**Action Parameters**

<ParamField path="cover" type="string">
</ParamField>

<ParamField path="delete_row" type="boolean">
</ParamField>

<ParamField path="icon" type="string">
</ParamField>

<ParamField path="properties" type="array">
</ParamField>

<ParamField path="row_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="NOTION_UPDATE_SCHEMA_DATABASE">
**Tool Name:** Update database schema

**Description**

```text wordWrap
Updates an existing notion database's title, description, and/or properties; at least one of these attributes must be provided to effect a change.
```


**Action Parameters**

<ParamField path="database_id" type="string" required={true}>
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="properties" type="array">
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
