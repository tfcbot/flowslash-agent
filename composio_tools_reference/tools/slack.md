---
title: Slack
subtitle: Learn how to use Slack with Composio
category: productivity
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Slack%20with%20Composio'
---


## Overview

**SLUG**: `SLACK`

### Description
Slack is a channel-based messaging platform. With Slack, people can work together more effectively, connect all their software tools and services, and find the information they need to do their best work — all within a secure, enterprise-grade environment.

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="user_scopes" type="string" default="calls:read,calls:write,channels:history,channels:read,channels:write,chat:write,dnd:read,dnd:write,emoji:read,files:read,files:write,groups:history,groups:read,groups:write,im:history,im:read,im:write,links:read,links:write,mpim:history,mpim:read,mpim:write,pins:read,pins:write,reactions:read,reactions:write,reminders:read,reminders:write,remote_files:read,remote_files:share,search:read,stars:read,stars:write,team:read,usergroups:read,usergroups:write,users.profile:read,users.profile:write,users:read,users:read.email,users:write">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

<ParamField path="verification_token" type="string">
</ParamField>

</Accordion>


<Accordion title="Bearer Token">
<ParamField path="verification_token" type="string">
</ParamField>

<ParamField path="token" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Slack
### Create an auth config
Use the dashboard to create an auth config for the Slack toolkit. This allows you to connect multiple Slack accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Slack](https://platform.composio.dev/marketplace/Slack)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Slack Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
slack_auth_config_id = "ac_YOUR_SLACK_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Slack: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, slack_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const slack_auth_config_id = "ac_YOUR_SLACK_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Slack: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, slack_auth_config_id);

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
slack_auth_config_id = "ac_YOUR_SLACK_CONFIG_ID" 

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
    print(f"Successfully connected Slack for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, slack_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const slack_auth_config_id = "ac_YOUR_SLACK_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the Bearer Token from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const bearerToken = await getUserBearerToken(userId);
  const bearerToken = "your_slack_bearer_token"; // Replace with actual bearer token
  
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
  console.log(`Successfully connected Slack for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, slack_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Slack toolkit's playground](https://app.composio.dev/app/Slack)

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

tools = composio.tools.get(user_id=user_id, toolkits=["SLACK"])

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

// Get tools for Slack
const tools = await composio.tools.get(userId, {
  toolkits: ["SLACK"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Slack?', // Your task here!
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

# Get tools for Slack
tools = composio.tools.get(user_id, toolkits=["SLACK"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Slack?")
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

// Get tools for Slack
const tools = await composio.tools.get(userId, { 
  toolkits: ["SLACK"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Slack?", // Your task here!
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
<Accordion title="SLACK_ACTIVATE_OR_MODIFY_DO_NOT_DISTURB_DURATION">
**Tool Name:** Set snooze duration

**Description**

```text wordWrap
Deprecated: turns on do not disturb mode for the current user, or changes its duration. use `set dnd duration` instead.
```


**Action Parameters**

<ParamField path="num_minutes" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_ADD_A_CUSTOM_EMOJI_TO_A_SLACK_TEAM">
**Tool Name:** Add a custom emoji to a Slack team

**Description**

```text wordWrap
Deprecated: adds a custom emoji to a slack workspace given a unique name and an image url. use `add emoji` instead.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="token" type="string" required={true}>
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

<Accordion title="SLACK_ADD_AN_EMOJI_ALIAS_IN_SLACK">
**Tool Name:** Add an emoji alias

**Description**

```text wordWrap
Adds an alias for an existing custom emoji in a slack enterprise grid organization.
```


**Action Parameters**

<ParamField path="alias_for" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="token" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_ADD_A_REMOTE_FILE_FROM_A_SERVICE">
**Tool Name:** Add a remote file

**Description**

```text wordWrap
Adds a reference to an external file (e.g., google drive, dropbox) to slack for discovery and sharing, requiring a unique `external id` and an `external url` accessible by slack.
```


**Action Parameters**

<ParamField path="external_id" type="string">
</ParamField>

<ParamField path="external_url" type="string">
</ParamField>

<ParamField path="filetype" type="string">
</ParamField>

<ParamField path="indexable_file_contents" type="string">
</ParamField>

<ParamField path="preview_image" type="string">
</ParamField>

<ParamField path="title" type="string">
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

<Accordion title="SLACK_ADD_A_STAR_TO_AN_ITEM">
**Tool Name:** Add a star to an item

**Description**

```text wordWrap
Stars a channel, file, file comment, or a specific message in slack.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>

<ParamField path="file_comment" type="string">
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

<Accordion title="SLACK_ADD_CALL_PARTICIPANTS">
**Tool Name:** Add call participants

**Description**

```text wordWrap
Registers new participants added to a slack call.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="users" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_ADD_EMOJI">
**Tool Name:** Add emoji

**Description**

```text wordWrap
Adds a custom emoji to a slack workspace given a unique name and an image url; subject to workspace emoji limits.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="token" type="string" required={true}>
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

<Accordion title="SLACK_ADD_REACTION_TO_AN_ITEM">
**Tool Name:** Add reaction to message

**Description**

```text wordWrap
Adds a specified emoji reaction to an existing message in a slack channel, identified by its timestamp; does not remove or retrieve reactions.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="timestamp" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_ARCHIVE_A_PUBLIC_OR_PRIVATE_CHANNEL">
**Tool Name:** Archive a public or private channel

**Description**

```text wordWrap
Archives a slack public or private channel, making it read-only; the primary 'general' channel cannot be archived.
```


**Action Parameters**

<ParamField path="channel_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_ARCHIVE_A_SLACK_CONVERSATION">
**Tool Name:** Archive a Slack conversation

**Description**

```text wordWrap
Archives a slack conversation by its id, rendering it read-only and hidden while retaining history, ideal for cleaning up inactive channels; be aware that some channels (like #general or certain dms) cannot be archived and this may impact connected integrations.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_CHAT_POST_MESSAGE">
**Tool Name:** Post message to channel

**Description**

```text wordWrap
Deprecated: posts a message to a slack channel, direct message, or private channel. use `send message` instead.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="attachments" type="string">
</ParamField>

<ParamField path="blocks" type="string">
</ParamField>

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="icon_emoji" type="string">
</ParamField>

<ParamField path="icon_url" type="string">
</ParamField>

<ParamField path="link_names" type="boolean">
</ParamField>

<ParamField path="markdown_text" type="string">
</ParamField>

<ParamField path="mrkdwn" type="boolean">
</ParamField>

<ParamField path="parse" type="string">
</ParamField>

<ParamField path="reply_broadcast" type="boolean">
</ParamField>

<ParamField path="text" type="string">
</ParamField>

<ParamField path="thread_ts" type="string">
</ParamField>

<ParamField path="unfurl_links" type="boolean">
</ParamField>

<ParamField path="unfurl_media" type="boolean">
</ParamField>

<ParamField path="username" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_CLOSE_DM_OR_MULTI_PERSON_DM">
**Tool Name:** Close conversation channel

**Description**

```text wordWrap
Closes a slack direct message (dm) or multi-person direct message (mpdm) channel, removing it from the user's sidebar without deleting history; this action affects only the calling user's view.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_CREATE_A_REMINDER">
**Tool Name:** Create a reminder

**Description**

```text wordWrap
Creates a slack reminder with specified text and time; time accepts unix timestamps, seconds from now, or natural language (e.g., 'in 15 minutes', 'every thursday at 2pm').
```


**Action Parameters**

<ParamField path="text" type="string" required={true}>
</ParamField>

<ParamField path="time" type="string" required={true}>
</ParamField>

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_CREATE_A_SLACK_USER_GROUP">
**Tool Name:** Create a Slack user group

**Description**

```text wordWrap
Creates a new user group (often referred to as a subteam) in a slack workspace.
```


**Action Parameters**

<ParamField path="channels" type="string">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="handle" type="string">
</ParamField>

<ParamField path="include_count" type="boolean">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_CREATE_CHANNEL">
**Tool Name:** Create channel

**Description**

```text wordWrap
Initiates a public or private channel-based conversation
```


**Action Parameters**

<ParamField path="is_private" type="boolean">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="team_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_CREATE_CHANNEL_BASED_CONVERSATION">
**Tool Name:** Create a channel-based conversation

**Description**

```text wordWrap
Creates a new public or private slack channel with a unique name; the channel can be org-wide, or team-specific if `team id` is given (required if `org wide` is false or not provided).
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="is_private" type="boolean" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org_wide" type="boolean">
</ParamField>

<ParamField path="team_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_CUSTOMIZE_URL_UNFURL">
**Tool Name:** Customize URL unfurl

**Description**

```text wordWrap
Customizes url previews (unfurling) in a specific slack message using a url-encoded json in `unfurls` to define custom content or remove existing previews.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="ts" type="string" required={true}>
</ParamField>

<ParamField path="unfurls" type="string">
</ParamField>

<ParamField path="user_auth_message" type="string">
</ParamField>

<ParamField path="user_auth_required" type="boolean">
</ParamField>

<ParamField path="user_auth_url" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_CUSTOMIZE_URL_UNFURLING_IN_MESSAGES">
**Tool Name:** Customize URL unfurling in messages

**Description**

```text wordWrap
Deprecated: customizes url previews (unfurling) in a specific slack message. use `customize url unfurl` instead.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="ts" type="string" required={true}>
</ParamField>

<ParamField path="unfurls" type="string">
</ParamField>

<ParamField path="user_auth_message" type="string">
</ParamField>

<ParamField path="user_auth_required" type="boolean">
</ParamField>

<ParamField path="user_auth_url" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_DELETE_A_COMMENT_ON_A_FILE">
**Tool Name:** Delete file comment

**Description**

```text wordWrap
Deletes a specific comment from a file in slack; this action is irreversible.
```


**Action Parameters**

<ParamField path="file" type="string">
</ParamField>

<ParamField path="id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_DELETE_A_FILE_BY_ID">
**Tool Name:** Delete a file by ID

**Description**

```text wordWrap
Permanently deletes an existing file from a slack workspace using its unique file id; this action is irreversible and also removes any associated comments or shares.
```


**Action Parameters**

<ParamField path="file" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_DELETE_A_PUBLIC_OR_PRIVATE_CHANNEL">
**Tool Name:** Delete a public or private channel

**Description**

```text wordWrap
Permanently and irreversibly deletes a specified public or private channel, including all its messages and files, within a slack enterprise grid organization.
```


**Action Parameters**

<ParamField path="channel_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_DELETE_A_SCHEDULED_MESSAGE_IN_A_CHAT">
**Tool Name:** Delete scheduled chat message

**Description**

```text wordWrap
Deletes a pending, unsent scheduled message from the specified slack channel, identified by its `scheduled message id`.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="scheduled_message_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_DELETE_A_SLACK_REMINDER">
**Tool Name:** Delete a Slack reminder

**Description**

```text wordWrap
Deletes an existing slack reminder, typically when it is no longer relevant or a task is completed; this operation is irreversible.
```


**Action Parameters**

<ParamField path="reminder" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_DELETES_A_MESSAGE_FROM_A_CHAT">
**Tool Name:** Delete a message from a chat

**Description**

```text wordWrap
Deletes a message, identified by its channel id and timestamp, from a slack channel, private group, or direct message conversation; the authenticated user or bot must be the original poster.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="ts" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_DELETE_USER_PROFILE_PHOTO">
**Tool Name:** Delete user profile photo

**Description**

```text wordWrap
Deletes the slack profile photo for the user identified by the token, reverting them to the default avatar; this action is irreversible and succeeds even if no custom photo was set.
```


**Action Parameters**

<ParamField path="token" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_DISABLE_AN_EXISTING_SLACK_USER_GROUP">
**Tool Name:** Disable a Slack user group

**Description**

```text wordWrap
Disables a specified, currently enabled slack user group by its unique id, effectively archiving it by setting its 'date delete' timestamp; the group is not permanently deleted and can be re-enabled.
```


**Action Parameters**

<ParamField path="include_count" type="boolean">
</ParamField>

<ParamField path="usergroup" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_ENABLE_A_SPECIFIED_USER_GROUP">
**Tool Name:** Enable a user group

**Description**

```text wordWrap
Enables a disabled user group in slack using its id, reactivating it for mentions and permissions; this action only changes the enabled status and cannot create new groups or modify other properties.
```


**Action Parameters**

<ParamField path="include_count" type="boolean">
</ParamField>

<ParamField path="usergroup" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_ENABLE_PUBLIC_SHARING_OF_A_FILE">
**Tool Name:** Share file public url

**Description**

```text wordWrap
Enables public sharing for an existing slack file by generating a publicly accessible url; this action does not create new files.
```


**Action Parameters**

<ParamField path="file" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_END_A_CALL_WITH_DURATION_AND_ID">
**Tool Name:** End a call

**Description**

```text wordWrap
Ends an ongoing slack call, identified by its id (obtained from `calls.add`), optionally specifying the call's duration.
```


**Action Parameters**

<ParamField path="duration" type="integer">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_END_SNOOZE">
**Tool Name:** End snooze

**Description**

```text wordWrap
Ends the current user's snooze mode immediately.
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

<Accordion title="SLACK_END_USER_DO_NOT_DISTURB_SESSION">
**Tool Name:** End DND session

**Description**

```text wordWrap
Ends the authenticated user's current do not disturb (dnd) session in slack, affecting only dnd status and making them available; if dnd is not active, slack acknowledges the request without changing status.
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

<Accordion title="SLACK_END_USER_SNOOZE_MODE_IMMEDIATELY">
**Tool Name:** End snooze mode immediately

**Description**

```text wordWrap
Deprecated: ends the current user's snooze mode immediately. use `end snooze` instead.
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

<Accordion title="SLACK_FETCH_BOT_USER_INFORMATION">
**Tool Name:** Fetch bot user information

**Description**

```text wordWrap
Fetches information for a specified, existing slack bot user; will not work for regular user accounts or other integration types.
```


**Action Parameters**

<ParamField path="bot" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FETCH_CONVERSATION_HISTORY">
**Tool Name:** Fetch conversation history

**Description**

```text wordWrap
Fetches a chronological list of messages and events from a specified slack conversation, accessible by the authenticated user/bot, with options for pagination and time range filtering.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="inclusive" type="boolean">
</ParamField>

<ParamField path="latest" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="oldest" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FETCH_CURRENT_TEAM_INFO_WITH_OPTIONAL_TEAM_SCOPE">
**Tool Name:** Fetch team information

**Description**

```text wordWrap
Deprecated: fetches comprehensive metadata about the current slack team. use `fetch team info` instead.
```


**Action Parameters**

<ParamField path="team" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FETCH_DND_STATUS_FOR_MULTIPLE_TEAM_MEMBERS">
**Tool Name:** Get Do Not Disturb status for users

**Description**

```text wordWrap
Deprecated: retrieves a user's current do not disturb status. use `get team dnd status` instead.
```


**Action Parameters**

<ParamField path="users" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FETCH_ITEM_REACTIONS">
**Tool Name:** Fetch item reactions

**Description**

```text wordWrap
Fetches reactions for a slack message, file, or file comment, requiring one of: channel and timestamp; file id; or file comment id.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>

<ParamField path="file_comment" type="string">
</ParamField>

<ParamField path="full" type="boolean">
</ParamField>

<ParamField path="timestamp" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION">
**Tool Name:** Retrieve conversation replies

**Description**

```text wordWrap
Retrieves replies to a specific parent message in a slack conversation, using the channel id and the parent message's timestamp (`ts`).
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="inclusive" type="boolean">
</ParamField>

<ParamField path="latest" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="oldest" type="string">
</ParamField>

<ParamField path="ts" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FETCH_TEAM_INFO">
**Tool Name:** Fetch team info

**Description**

```text wordWrap
Fetches comprehensive metadata about the current slack team, or a specified team if the provided id is accessible.
```


**Action Parameters**

<ParamField path="team" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FETCH_WORKSPACE_SETTINGS_INFORMATION">
**Tool Name:** Fetch workspace settings information

**Description**

```text wordWrap
Retrieves detailed settings for a specific slack workspace, primarily for administrators in an enterprise grid organization to view or audit workspace configurations.
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

<Accordion title="SLACK_FIND_CHANNELS">
**Tool Name:** Find channels

**Description**

```text wordWrap
Find channels in a slack workspace by any criteria - name, topic, purpose, or description.
```


**Action Parameters**

<ParamField path="exact_match" type="boolean">
</ParamField>

<ParamField path="exclude_archived" type="boolean" default="True">
</ParamField>

<ParamField path="limit" type="integer" default="50">
</ParamField>

<ParamField path="member_only" type="boolean">
</ParamField>

<ParamField path="search_query" type="string" required={true}>
</ParamField>

<ParamField path="types" type="string" default="public_channel,private_channel">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FIND_USER_BY_EMAIL_ADDRESS">
**Tool Name:** Lookup users by email

**Description**

```text wordWrap
Retrieves the slack user object for an active user by their registered email address; fails with 'users not found' if the email is unregistered or the user is inactive.
```


**Action Parameters**

<ParamField path="email" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_FIND_USERS">
**Tool Name:** Find users

**Description**

```text wordWrap
Find users in a slack workspace by any criteria - email, name, display name, or other text. includes optimized email lookup for exact email matches.
```


**Action Parameters**

<ParamField path="exact_match" type="boolean">
</ParamField>

<ParamField path="include_bots" type="boolean">
</ParamField>

<ParamField path="include_deleted" type="boolean">
</ParamField>

<ParamField path="include_restricted" type="boolean" default="True">
</ParamField>

<ParamField path="limit" type="integer" default="50">
</ParamField>

<ParamField path="search_query" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_GET_CHANNEL_CONVERSATION_PREFERENCES">
**Tool Name:** Get channel conversation preferences

**Description**

```text wordWrap
Retrieves conversation preferences (e.g., who can post, who can thread) for a specified channel, primarily for use within slack enterprise grid environments.
```


**Action Parameters**

<ParamField path="channel_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_GET_REMINDER_INFORMATION">
**Tool Name:** Get reminder information

**Description**

```text wordWrap
Retrieves detailed information for an existing slack reminder specified by its id; this is a read-only operation.
```


**Action Parameters**

<ParamField path="reminder" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_GET_REMOTE_FILE">
**Tool Name:** Get remote file

**Description**

```text wordWrap
Retrieve information about a remote file added to slack.
```


**Action Parameters**

<ParamField path="external_id" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_GET_TEAM_DND_STATUS">
**Tool Name:** Get team DND status

**Description**

```text wordWrap
Retrieves a user's current do not disturb status.
```


**Action Parameters**

<ParamField path="users" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_GET_USER_PRESENCE_INFO">
**Tool Name:** Retrieve user presence

**Description**

```text wordWrap
Retrieves a slack user's current real-time presence (e.g., 'active', 'away') to determine their availability, noting this action does not provide historical data or status reasons.
```


**Action Parameters**

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_INITIATES_CHANNEL_BASED_CONVERSATIONS">
**Tool Name:** Create conversation

**Description**

```text wordWrap
Deprecated: initiates a public or private channel-based conversation. use `create channel` instead.
```


**Action Parameters**

<ParamField path="is_private" type="boolean">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="team_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_INVITE_USERS_TO_A_SLACK_CHANNEL">
**Tool Name:** Invite users to a Slack channel

**Description**

```text wordWrap
Invites users to an existing slack channel using their valid slack user ids.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="users" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_INVITE_USER_TO_CHANNEL">
**Tool Name:** Invite users to channel

**Description**

```text wordWrap
Invites users to a specified slack channel; this action is restricted to enterprise grid workspaces and requires the authenticated user to be a member of the target channel.
```


**Action Parameters**

<ParamField path="channel_id" type="string" required={true}>
</ParamField>

<ParamField path="user_ids" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_INVITE_USER_TO_WORKSPACE">
**Tool Name:** Invite user to workspace

**Description**

```text wordWrap
Invites a user to a slack workspace and specified channels by email; use `resend=true` to re-process an existing invitation for a user not yet signed up.
```


**Action Parameters**

<ParamField path="channel_ids" type="string" required={true}>
</ParamField>

<ParamField path="custom_message" type="string">
</ParamField>

<ParamField path="email" type="string" required={true}>
</ParamField>

<ParamField path="guest_expiration_ts" type="string">
</ParamField>

<ParamField path="is_restricted" type="boolean">
</ParamField>

<ParamField path="is_ultra_restricted" type="boolean">
</ParamField>

<ParamField path="real_name" type="string">
</ParamField>

<ParamField path="resend" type="boolean">
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

<Accordion title="SLACK_INVITE_USER_TO_WORKSPACE_WITH_OPTIONAL_CHANNEL_INVITES">
**Tool Name:** Invite user to workspace and channels

**Description**

```text wordWrap
Deprecated: invites a user to a slack workspace and specified channels by email. use `invite user to workspace` instead.
```


**Action Parameters**

<ParamField path="channel_ids" type="string" required={true}>
</ParamField>

<ParamField path="custom_message" type="string">
</ParamField>

<ParamField path="email" type="string" required={true}>
</ParamField>

<ParamField path="guest_expiration_ts" type="string">
</ParamField>

<ParamField path="is_restricted" type="boolean">
</ParamField>

<ParamField path="is_ultra_restricted" type="boolean">
</ParamField>

<ParamField path="real_name" type="string">
</ParamField>

<ParamField path="resend" type="boolean">
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

<Accordion title="SLACK_JOIN_AN_EXISTING_CONVERSATION">
**Tool Name:** Join conversation by channel id

**Description**

```text wordWrap
Joins an existing slack conversation (public channel, private channel, or multi-person direct message) by its id, if the authenticated user has permission.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LEAVE_A_CONVERSATION">
**Tool Name:** Leave conversation channel

**Description**

```text wordWrap
Leaves a slack conversation given its channel id; fails if leaving as the last member of a private channel or if used on a slack connect channel.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_ACCESSIBLE_CONVERSATIONS_FOR_A_USER">
**Tool Name:** List accessible conversations for a user

**Description**

```text wordWrap
Deprecated: retrieves conversations accessible to a specified user. use `list conversations` instead.
```


**Action Parameters**

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="exclude_archived" type="boolean">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="types" type="string">
</ParamField>

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_ALL_CHANNELS">
**Tool Name:** List all channels

**Description**

```text wordWrap
Lists conversations available to the user with various filters and search options.
```


**Action Parameters**

<ParamField path="channel_name" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="exclude_archived" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="1">
</ParamField>

<ParamField path="types" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_VARIOUS_FILTERS">
**Tool Name:** List conversations

**Description**

```text wordWrap
Deprecated: lists conversations available to the user with various filters and search options. use `list channels` instead.
```


**Action Parameters**

<ParamField path="channel_name" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="exclude_archived" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="1">
</ParamField>

<ParamField path="types" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_ALL_SLACK_TEAM_USERS_WITH_PAGINATION">
**Tool Name:** List all Slack team users with pagination

**Description**

```text wordWrap
Deprecated: retrieves a paginated list of all users in a slack workspace. use `list all users` instead.
```


**Action Parameters**

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="include_locale" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="1">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_ALL_USERS">
**Tool Name:** List all users

**Description**

```text wordWrap
Retrieves a paginated list of all users, including comprehensive details, profile information, status, and team memberships, in a slack workspace; data may not be real-time.
```


**Action Parameters**

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="include_locale" type="boolean">
</ParamField>

<ParamField path="limit" type="integer" default="1">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_ALL_USERS_IN_A_USER_GROUP">
**Tool Name:** List all users in a user group

**Description**

```text wordWrap
Retrieves a list of all user ids within a specified slack user group, with an option to include users from disabled groups.
```


**Action Parameters**

<ParamField path="include_disabled" type="boolean">
</ParamField>

<ParamField path="usergroup" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_CONVERSATIONS">
**Tool Name:** List conversations

**Description**

```text wordWrap
Retrieves conversations accessible to a specified user (or the authenticated user if no user id is provided), respecting shared membership for non-public channels.
```


**Action Parameters**

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="exclude_archived" type="boolean">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="types" type="string">
</ParamField>

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_FILES_WITH_FILTERS_IN_SLACK">
**Tool Name:** List Slack files

**Description**

```text wordWrap
Lists files and their metadata within a slack workspace, filterable by user, channel, timestamp, or type; this action returns metadata only, not file content.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="count" type="string">
</ParamField>

<ParamField path="page" type="string">
</ParamField>

<ParamField path="show_files_hidden_by_limit" type="boolean">
</ParamField>

<ParamField path="ts_from" type="integer">
</ParamField>

<ParamField path="ts_to" type="integer">
</ParamField>

<ParamField path="types" type="string">
</ParamField>

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_REMINDERS">
**Tool Name:** List reminders

**Description**

```text wordWrap
Lists all reminders with their details for the authenticated slack user; returns an empty list if no reminders exist.
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

<Accordion title="SLACK_LIST_REMOTE_FILES">
**Tool Name:** List remote files

**Description**

```text wordWrap
Retrieve information about a team's remote files.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="ts_from" type="number">
</ParamField>

<ParamField path="ts_to" type="number">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_SCHEDULED_MESSAGES">
**Tool Name:** List scheduled messages

**Description**

```text wordWrap
Retrieves a list of pending (not yet delivered) messages scheduled in a specific slack channel, or across all accessible channels if no channel id is provided, optionally filtered by time and paginated.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="latest" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="oldest" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_SCHEDULED_MESSAGES_IN_A_CHANNEL">
**Tool Name:** List scheduled messages in a channel

**Description**

```text wordWrap
Deprecated: retrieves a list of pending (not yet delivered) messages scheduled in a specific slack channel. use `list scheduled messages` instead.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="latest" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="oldest" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_SLACK_S_REMOTE_FILES_WITH_FILTERS">
**Tool Name:** List team remote files

**Description**

```text wordWrap
Deprecated: retrieve information about a team's remote files. use `list remote files` instead.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="ts_from" type="number">
</ParamField>

<ParamField path="ts_to" type="number">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LISTS_PINNED_ITEMS_IN_A_CHANNEL">
**Tool Name:** List pinned items in a channel

**Description**

```text wordWrap
Retrieves all messages and files pinned to a specified channel; the caller must have access to this channel.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_STARRED_ITEMS">
**Tool Name:** List starred items

**Description**

```text wordWrap
Lists items starred by a user.
```


**Action Parameters**

<ParamField path="count" type="integer">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="page" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LISTS_USER_S_STARRED_ITEMS_WITH_PAGINATION">
**Tool Name:** List starred items

**Description**

```text wordWrap
Deprecated: lists items starred by a user. use `list starred items` instead.
```


**Action Parameters**

<ParamField path="count" type="integer">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="page" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_TEAM_CUSTOM_EMOJIS">
**Tool Name:** List team custom emojis

**Description**

```text wordWrap
Retrieves all custom emojis for the slack workspace (image urls or aliases), not standard unicode emojis; does not include usage statistics or creation dates.
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

<Accordion title="SLACK_LIST_USER_GROUPS_FOR_TEAM_WITH_OPTIONS">
**Tool Name:** List user groups

**Description**

```text wordWrap
Lists user groups in a slack workspace, including user-created and default groups; results for large workspaces may be paginated.
```


**Action Parameters**

<ParamField path="include_count" type="boolean">
</ParamField>

<ParamField path="include_disabled" type="boolean">
</ParamField>

<ParamField path="include_users" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_USER_REACTIONS">
**Tool Name:** List user reactions

**Description**

```text wordWrap
Lists all reactions added by a specific user to messages, files, or file comments in slack, useful for engagement analysis when the item content itself is not required.
```


**Action Parameters**

<ParamField path="count" type="integer">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="full" type="boolean">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="page" type="integer">
</ParamField>

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_LIST_USER_REMINDERS_WITH_DETAILS">
**Tool Name:** List user reminders with details

**Description**

```text wordWrap
Deprecated: lists all reminders with their details for the authenticated slack user. use `list reminders` instead.
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

<Accordion title="SLACK_LIST_WORKSPACE_USERS">
**Tool Name:** List admin users

**Description**

```text wordWrap
Retrieves a paginated list of admin users for a specified slack workspace.
```


**Action Parameters**

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="limit" type="integer">
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

<Accordion title="SLACK_MANUALLY_SET_USER_PRESENCE">
**Tool Name:** Set user presence

**Description**

```text wordWrap
Manually sets a user's slack presence, overriding automatic detection; this setting persists across connections but can be overridden by user actions or slack's auto-away (e.g., after 10 mins of inactivity).
```


**Action Parameters**

<ParamField path="presence" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_MARK_REMINDER_AS_COMPLETE">
**Tool Name:** Mark reminder as complete

**Description**

```text wordWrap
Marks a specific slack reminder as complete using its `reminder` id; **deprecated**: this slack api endpoint ('reminders.complete') was deprecated in march 2023 and is not recommended for new applications.
```


**Action Parameters**

<ParamField path="reminder" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_OPEN_DM">
**Tool Name:** Open DM

**Description**

```text wordWrap
Opens or resumes a slack direct message (dm) or multi-person direct message (mpim) by providing either user ids or an existing channel id.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="return_im" type="boolean">
</ParamField>

<ParamField path="users" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_OPEN_OR_RESUME_DIRECT_OR_MULTI_PERSON_MESSAGES">
**Tool Name:** Open or resume direct or multi-person messages

**Description**

```text wordWrap
Deprecated: opens or resumes a slack direct message (dm) or multi-person direct message (mpim). use `open dm` instead.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="return_im" type="boolean">
</ParamField>

<ParamField path="users" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_PINS_AN_ITEM_TO_A_CHANNEL">
**Tool Name:** Pin an item to a channel

**Description**

```text wordWrap
Pins a message to a specified slack channel; the message must not already be pinned.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
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

<Accordion title="SLACK_REGISTER_CALL_PARTICIPANTS_REMOVAL">
**Tool Name:** Remove participants from call

**Description**

```text wordWrap
Deprecated: registers participants removed from a slack call. use `remove call participants` instead.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="users" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_REGISTERS_A_NEW_CALL_WITH_PARTICIPANTS">
**Tool Name:** Register a new call with participants

**Description**

```text wordWrap
Deprecated: registers a new call in slack using `calls.add` for third-party call integration. use `start call` instead.
```


**Action Parameters**

<ParamField path="created_by" type="string">
</ParamField>

<ParamField path="date_start" type="integer">
</ParamField>

<ParamField path="desktop_app_join_url" type="string">
</ParamField>

<ParamField path="external_display_id" type="string">
</ParamField>

<ParamField path="external_unique_id" type="string" required={true}>
</ParamField>

<ParamField path="join_url" type="string" required={true}>
</ParamField>

<ParamField path="title" type="string">
</ParamField>

<ParamField path="users" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_REGISTERS_NEW_CALL_PARTICIPANTS">
**Tool Name:** Register new call participants

**Description**

```text wordWrap
Deprecated: registers new participants added to a slack call. use `add call participants` instead.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="users" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_REMOVE_A_REMOTE_FILE">
**Tool Name:** Remove remote file

**Description**

```text wordWrap
Removes the slack reference to an external file (which must have been previously added via the remote files api), specified by either its `external id` or `file` id (one of which is required), without deleting the actual external file.
```


**Action Parameters**

<ParamField path="external_id" type="string">
</ParamField>

<ParamField path="file" type="string">
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

<Accordion title="SLACK_REMOVE_A_STAR_FROM_AN_ITEM">
**Tool Name:** Remove a star from an item

**Description**

```text wordWrap
Removes a star from a previously starred slack item (message, file, file comment, channel, group, or dm), requiring identification via `file`, `file comment`, `channel` (for channel/group/dm), or both `channel` and `timestamp` (for a message).
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>

<ParamField path="file_comment" type="string">
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

<Accordion title="SLACK_REMOVE_A_USER_FROM_A_CONVERSATION">
**Tool Name:** Remove user from conversation

**Description**

```text wordWrap
Removes a specified user from a slack conversation (channel); the caller must have permissions to remove users and cannot remove themselves using this action.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_REMOVE_CALL_PARTICIPANTS">
**Tool Name:** Remove call participants

**Description**

```text wordWrap
Registers participants removed from a slack call.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="users" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_REMOVE_REACTION_FROM_ITEM">
**Tool Name:** Remove reaction from item

**Description**

```text wordWrap
Removes an emoji reaction from a message, file, or file comment in slack.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>

<ParamField path="file_comment" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
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

<Accordion title="SLACK_RENAME_A_CONVERSATION">
**Tool Name:** Rename a conversation

**Description**

```text wordWrap
Renames a slack channel, automatically adjusting the new name to meet naming conventions (e.g., converting to lowercase), which may affect integrations using the old name.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

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

<Accordion title="SLACK_RENAME_AN_EMOJI">
**Tool Name:** Rename an emoji

**Description**

```text wordWrap
Renames an existing custom emoji in a slack workspace, updating all its instances.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="new_name" type="string" required={true}>
</ParamField>

<ParamField path="token" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RENAME_A_SLACK_CHANNEL">
**Tool Name:** Rename a Slack channel

**Description**

```text wordWrap
Renames a public or private slack channel; for enterprise grid workspaces, the user must be a workspace admin or channel manager.
```


**Action Parameters**

<ParamField path="channel_id" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_A_USER_S_IDENTITY_DETAILS">
**Tool Name:** Retrieve a user's identity details

**Description**

```text wordWrap
Retrieves the authenticated user's and their team's identity, with details varying based on oauth scopes (e.g., `identity.basic`, `identity.email`, `identity.avatar`).
```


**Action Parameters**



**Action Response**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_CALL_INFORMATION">
**Tool Name:** Retrieve call information

**Description**

```text wordWrap
Retrieves a point-in-time snapshot of a specific slack call's information.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_CONVERSATION_INFORMATION">
**Tool Name:** Retrieve conversation information

**Description**

```text wordWrap
Retrieves metadata for a slack conversation by id (e.g., name, purpose, creation date, with options for member count/locale), excluding message content; requires a valid channel id.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="include_locale" type="boolean">
</ParamField>

<ParamField path="include_num_members" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_CONVERSATION_MEMBERS_LIST">
**Tool Name:** Get conversation members

**Description**

```text wordWrap
Retrieves a paginated list of active member ids for a specified slack public channel, private channel, direct message (dm), or multi-person direct message (mpim).
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_CURRENT_USER_DND_STATUS">
**Tool Name:** Retrieve user DND status

**Description**

```text wordWrap
Retrieves a slack user's current do not disturb (dnd) status to determine their availability before interaction; any specified user id must be a valid slack user id.
```


**Action Parameters**

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_DETAILED_INFORMATION_ABOUT_A_FILE">
**Tool Name:** Retrieve detailed file information

**Description**

```text wordWrap
Retrieves detailed metadata and paginated comments for a specific slack file id; does not download file content.
```


**Action Parameters**

<ParamField path="count" type="string">
</ParamField>

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>

<ParamField path="limit" type="integer">
</ParamField>

<ParamField path="page" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_DETAILED_USER_INFORMATION">
**Tool Name:** Retrieve detailed user information

**Description**

```text wordWrap
Retrieves comprehensive information for a valid slack user id, excluding message history and channel memberships.
```


**Action Parameters**

<ParamField path="include_locale" type="boolean">
</ParamField>

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_MESSAGE_PERMALINK_URL">
**Tool Name:** Retrieve message permalink

**Description**

```text wordWrap
Retrieves a permalink url for a specific message in a slack channel or conversation; the permalink respects slack's privacy settings.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="message_ts" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_REMOTE_FILE_INFO_IN_SLACK">
**Tool Name:** Retrieve remote file info

**Description**

```text wordWrap
Deprecated: retrieve information about a remote file added to slack. use `get remote file` instead.
```


**Action Parameters**

<ParamField path="external_id" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_TEAM_PROFILE_DETAILS">
**Tool Name:** Retrieve team profile details

**Description**

```text wordWrap
Retrieves all profile field definitions for a slack team, optionally filtered by visibility, to understand the team's profile structure.
```


**Action Parameters**

<ParamField path="visibility" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_RETRIEVE_USER_PROFILE_INFORMATION">
**Tool Name:** Retrieve user profile information

**Description**

```text wordWrap
Retrieves profile information for a specified slack user (defaults to the authenticated user if `user` id is omitted); a provided `user` id must be valid.
```


**Action Parameters**

<ParamField path="include_labels" type="boolean">
</ParamField>

<ParamField path="user" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_REVERSE_A_CONVERSATION_S_ARCHIVAL_STATUS">
**Tool Name:** Unarchive conversation

**Description**

```text wordWrap
Deprecated: reverses conversation archival. use `unarchive channel` instead.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_REVOKE_PUBLIC_SHARING_ACCESS_FOR_A_FILE">
**Tool Name:** Revoke a file's public url

**Description**

```text wordWrap
Revokes a slack file's public url, making it private; this is a no-op if not already public and is irreversible.
```


**Action Parameters**

<ParamField path="file" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SCHEDULE_MESSAGE">
**Tool Name:** Schedule message

**Description**

```text wordWrap
Schedules a message to a slack channel, dm, or private group for a future time (`post at`), requiring `text`, `blocks`, or `attachments` for content; scheduling is limited to 120 days in advance.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="attachments" type="string">
</ParamField>

<ParamField path="blocks" type="string">
</ParamField>

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="link_names" type="boolean">
</ParamField>

<ParamField path="markdown_text" type="string">
</ParamField>

<ParamField path="parse" type="string">
</ParamField>

<ParamField path="post_at" type="string">
</ParamField>

<ParamField path="reply_broadcast" type="boolean">
</ParamField>

<ParamField path="text" type="string">
</ParamField>

<ParamField path="thread_ts" type="string">
</ParamField>

<ParamField path="unfurl_links" type="boolean">
</ParamField>

<ParamField path="unfurl_media" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SCHEDULES_A_MESSAGE_TO_A_CHANNEL_AT_A_SPECIFIED_TIME">
**Tool Name:** Schedule message in chat

**Description**

```text wordWrap
Deprecated: schedules a message to a slack channel, dm, or private group for a future time. use `schedule message` instead.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="attachments" type="string">
</ParamField>

<ParamField path="blocks" type="string">
</ParamField>

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="link_names" type="boolean">
</ParamField>

<ParamField path="markdown_text" type="string">
</ParamField>

<ParamField path="parse" type="string">
</ParamField>

<ParamField path="post_at" type="string">
</ParamField>

<ParamField path="reply_broadcast" type="boolean">
</ParamField>

<ParamField path="text" type="string">
</ParamField>

<ParamField path="thread_ts" type="string">
</ParamField>

<ParamField path="unfurl_links" type="boolean">
</ParamField>

<ParamField path="unfurl_media" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SEARCH_FOR_MESSAGES_WITH_QUERY">
**Tool Name:** Search Messages

**Description**

```text wordWrap
Deprecated: searches messages in a slack workspace using a query with optional modifiers. use `search messages` instead.
```


**Action Parameters**

<ParamField path="count" type="integer" default="1">
</ParamField>

<ParamField path="highlight" type="boolean">
</ParamField>

<ParamField path="page" type="integer">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string">
</ParamField>

<ParamField path="sort_dir" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SEARCH_MESSAGES">
**Tool Name:** Search messages

**Description**

```text wordWrap
Workspace‑wide slack message search with date ranges and filters. use `query` modifiers (e.g., in:#channel, from:@user, before/after:yyyy-mm-dd), sorting (score/timestamp), and pagination.
```


**Action Parameters**

<ParamField path="count" type="integer" default="1">
</ParamField>

<ParamField path="highlight" type="boolean">
</ParamField>

<ParamField path="page" type="integer">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string">
</ParamField>

<ParamField path="sort_dir" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SEND_EPHEMERAL_MESSAGE">
**Tool Name:** Send ephemeral message

**Description**

```text wordWrap
Sends an ephemeral message to a user in a channel.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="attachments" type="string">
</ParamField>

<ParamField path="blocks" type="string">
</ParamField>

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="icon_emoji" type="string">
</ParamField>

<ParamField path="icon_url" type="string">
</ParamField>

<ParamField path="link_names" type="boolean">
</ParamField>

<ParamField path="parse" type="string">
</ParamField>

<ParamField path="text" type="string">
</ParamField>

<ParamField path="thread_ts" type="string">
</ParamField>

<ParamField path="user" type="string" required={true}>
</ParamField>

<ParamField path="username" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SEND_MESSAGE">
**Tool Name:** Send message

**Description**

```text wordWrap
Posts a message to a slack channel, direct message, or private group; requires content via `text`, `blocks`, or `attachments`.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="attachments" type="string">
</ParamField>

<ParamField path="blocks" type="string">
</ParamField>

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="icon_emoji" type="string">
</ParamField>

<ParamField path="icon_url" type="string">
</ParamField>

<ParamField path="link_names" type="boolean">
</ParamField>

<ParamField path="markdown_text" type="string">
</ParamField>

<ParamField path="mrkdwn" type="boolean">
</ParamField>

<ParamField path="parse" type="string">
</ParamField>

<ParamField path="reply_broadcast" type="boolean">
</ParamField>

<ParamField path="text" type="string">
</ParamField>

<ParamField path="thread_ts" type="string">
</ParamField>

<ParamField path="unfurl_links" type="boolean">
</ParamField>

<ParamField path="unfurl_media" type="boolean">
</ParamField>

<ParamField path="username" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL">
**Tool Name:** Send a message to a Slack channel

**Description**

```text wordWrap
Deprecated: posts a message to a slack channel, direct message, or private group. use `send message` instead.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="attachments" type="string">
</ParamField>

<ParamField path="blocks" type="string">
</ParamField>

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="icon_emoji" type="string">
</ParamField>

<ParamField path="icon_url" type="string">
</ParamField>

<ParamField path="link_names" type="boolean">
</ParamField>

<ParamField path="markdown_text" type="string">
</ParamField>

<ParamField path="mrkdwn" type="boolean">
</ParamField>

<ParamField path="parse" type="string">
</ParamField>

<ParamField path="reply_broadcast" type="boolean">
</ParamField>

<ParamField path="text" type="string">
</ParamField>

<ParamField path="thread_ts" type="string">
</ParamField>

<ParamField path="unfurl_links" type="boolean">
</ParamField>

<ParamField path="unfurl_media" type="boolean">
</ParamField>

<ParamField path="username" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SENDS_EPHEMERAL_MESSAGES_TO_CHANNEL_USERS">
**Tool Name:** Send an ephemeral message

**Description**

```text wordWrap
Deprecated: sends an ephemeral message to a user in a channel. use `send ephemeral message` instead.
```


**Action Parameters**

<ParamField path="as_user" type="boolean">
</ParamField>

<ParamField path="attachments" type="string">
</ParamField>

<ParamField path="blocks" type="string">
</ParamField>

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="icon_emoji" type="string">
</ParamField>

<ParamField path="icon_url" type="string">
</ParamField>

<ParamField path="link_names" type="boolean">
</ParamField>

<ParamField path="parse" type="string">
</ParamField>

<ParamField path="text" type="string">
</ParamField>

<ParamField path="thread_ts" type="string">
</ParamField>

<ParamField path="user" type="string" required={true}>
</ParamField>

<ParamField path="username" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SET_A_CONVERSATION_S_PURPOSE">
**Tool Name:** Set a conversation's purpose

**Description**

```text wordWrap
Sets the purpose (a short description of its topic/goal, displayed in the header) for a slack conversation; the calling user must be a member.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="purpose" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SET_DND_DURATION">
**Tool Name:** Set DND duration

**Description**

```text wordWrap
Turns on do not disturb mode for the current user, or changes its duration.
```


**Action Parameters**

<ParamField path="num_minutes" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SET_PROFILE_PHOTO">
**Tool Name:** Set profile photo

**Description**

```text wordWrap
This method allows the user to set their profile image.
```


**Action Parameters**

<ParamField path="crop_w" type="integer">
</ParamField>

<ParamField path="crop_x" type="integer">
</ParamField>

<ParamField path="crop_y" type="integer">
</ParamField>

<ParamField path="image" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SET_READ_CURSOR_IN_A_CONVERSATION">
**Tool Name:** Set conversation read cursor

**Description**

```text wordWrap
Marks a message, specified by its timestamp (`ts`), as the most recently read for the authenticated user in the given `channel`, provided the user is a member of the channel and the message exists within it.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="ts" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SET_SLACK_USER_PROFILE_INFORMATION">
**Tool Name:** Set Slack user profile information

**Description**

```text wordWrap
Updates a slack user's profile, setting either individual fields or multiple fields via a json object.
```


**Action Parameters**

<ParamField path="name" type="string">
</ParamField>

<ParamField path="profile" type="string">
</ParamField>

<ParamField path="user" type="string">
</ParamField>

<ParamField path="value" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SET_THE_TOPIC_OF_A_CONVERSATION">
**Tool Name:** Set conversation topic

**Description**

```text wordWrap
Sets or updates the topic for a specified slack conversation.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="topic" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SET_USER_PROFILE_PHOTO_WITH_CROPPING_OPTIONS">
**Tool Name:** Set the user's profile image

**Description**

```text wordWrap
Deprecated: this method allows the user to set their profile image. use `set profile photo` instead.
```


**Action Parameters**

<ParamField path="crop_w" type="integer">
</ParamField>

<ParamField path="crop_x" type="integer">
</ParamField>

<ParamField path="crop_y" type="integer">
</ParamField>

<ParamField path="image" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SHARE_A_ME_MESSAGE_IN_A_CHANNEL">
**Tool Name:** Share a me message in a channel

**Description**

```text wordWrap
Sends a 'me message' (e.g., '/me is typing') to a slack channel, where it's displayed as a third-person user action; messages are plain text and the channel must exist and be accessible.
```


**Action Parameters**

<ParamField path="channel" type="string">
</ParamField>

<ParamField path="text" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_SHARE_REMOTE_FILE_IN_CHANNELS">
**Tool Name:** Share a remote file in channels

**Description**

```text wordWrap
Shares a remote file, which must already be registered with slack, into specified slack channels or direct message conversations.
```


**Action Parameters**

<ParamField path="channels" type="string">
</ParamField>

<ParamField path="external_id" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_START_CALL">
**Tool Name:** Start call

**Description**

```text wordWrap
Registers a new call in slack using `calls.add` for third-party call integration; `created by` is required if not using a user-specific token.
```


**Action Parameters**

<ParamField path="created_by" type="string">
</ParamField>

<ParamField path="date_start" type="integer">
</ParamField>

<ParamField path="desktop_app_join_url" type="string">
</ParamField>

<ParamField path="external_display_id" type="string">
</ParamField>

<ParamField path="external_unique_id" type="string" required={true}>
</ParamField>

<ParamField path="join_url" type="string" required={true}>
</ParamField>

<ParamField path="title" type="string">
</ParamField>

<ParamField path="users" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_START_REAL_TIME_MESSAGING_SESSION">
**Tool Name:** Start real time messaging session

**Description**

```text wordWrap
Initiates a slack rtm session providing a single-use websocket url (valid 30s) for event streaming; does not set initial presence status.
```


**Action Parameters**

<ParamField path="batch_presence_aware" type="boolean">
</ParamField>

<ParamField path="presence_sub" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_UNARCHIVE_A_PUBLIC_OR_PRIVATE_CHANNEL">
**Tool Name:** Unarchive a public or private channel

**Description**

```text wordWrap
Unarchives a specified public or private slack channel that is currently archived, using its channel id.
```


**Action Parameters**

<ParamField path="channel_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_UNARCHIVE_CHANNEL">
**Tool Name:** Unarchive channel

**Description**

```text wordWrap
Reverses conversation archival.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_UNPIN_ITEM_FROM_CHANNEL">
**Tool Name:** Unpin message from channel

**Description**

```text wordWrap
Unpins a message, identified by its timestamp, from a specified channel if the message is currently pinned there; this operation is destructive.
```


**Action Parameters**

<ParamField path="channel" type="string" required={true}>
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

<Accordion title="SLACK_UPDATE_AN_EXISTING_SLACK_USER_GROUP">
**Tool Name:** Update Slack user group

**Description**

```text wordWrap
Updates an existing slack user group, which must be specified by an existing `usergroup` id, with new optional details such as its name, description, handle, or default channels.
```


**Action Parameters**

<ParamField path="channels" type="string">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="handle" type="string">
</ParamField>

<ParamField path="include_count" type="boolean">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="usergroup" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_UPDATES_AN_EXISTING_REMOTE_FILE">
**Tool Name:** Update an existing remote file

**Description**

```text wordWrap
Updates metadata or content details for an existing remote file in slack; this action cannot upload new files or change the fundamental file type.
```


**Action Parameters**

<ParamField path="external_id" type="string">
</ParamField>

<ParamField path="external_url" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>

<ParamField path="filetype" type="string">
</ParamField>

<ParamField path="indexable_file_contents" type="string">
</ParamField>

<ParamField path="preview_image" type="string">
</ParamField>

<ParamField path="title" type="string">
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

<Accordion title="SLACK_UPDATES_A_SLACK_MESSAGE">
**Tool Name:** Update a Slack message

**Description**

```text wordWrap
Updates a slack message, identified by `channel` id and `ts` timestamp, by modifying its `text`, `attachments`, or `blocks`; provide at least one content field, noting `attachments`/`blocks` are replaced if included (`[]` clears them).
```


**Action Parameters**

<ParamField path="as_user" type="string">
</ParamField>

<ParamField path="attachments" type="string">
</ParamField>

<ParamField path="blocks" type="string">
</ParamField>

<ParamField path="channel" type="string" required={true}>
</ParamField>

<ParamField path="link_names" type="string">
</ParamField>

<ParamField path="markdown_text" type="string">
</ParamField>

<ParamField path="parse" type="string">
</ParamField>

<ParamField path="text" type="string">
</ParamField>

<ParamField path="ts" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_UPDATE_SLACK_CALL_INFORMATION">
**Tool Name:** Update call information

**Description**

```text wordWrap
Updates the title, join url, or desktop app join url for an existing slack call identified by its id.
```


**Action Parameters**

<ParamField path="desktop_app_join_url" type="string">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="join_url" type="string">
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

<Accordion title="SLACK_UPDATE_USER_GROUP_MEMBERS">
**Tool Name:** Update user group members

**Description**

```text wordWrap
Replaces all members of an existing slack user group with a new list of valid user ids.
```


**Action Parameters**

<ParamField path="include_count" type="boolean">
</ParamField>

<ParamField path="usergroup" type="string" required={true}>
</ParamField>

<ParamField path="users" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="SLACK_UPLOAD_OR_CREATE_A_FILE_IN_SLACK">
**Tool Name:** Upload or create a file in Slack

**Description**

```text wordWrap
Uploads a file to slack, requiring either `content` (for text) or `file` (for binary data), optionally sharing it in specified `channels` or as a reply via `thread ts`.
```


**Action Parameters**

<ParamField path="channels" type="string">
</ParamField>

<ParamField path="content" type="string">
</ParamField>

<ParamField path="file" type="string">
</ParamField>

<ParamField path="filename" type="string">
</ParamField>

<ParamField path="filetype" type="string">
</ParamField>

<ParamField path="initial_comment" type="string">
</ParamField>

<ParamField path="thread_ts" type="integer">
</ParamField>

<ParamField path="title" type="string">
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

</AccordionGroup>
