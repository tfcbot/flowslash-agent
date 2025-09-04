---
title: Instagram
subtitle: Learn how to use Instagram with Composio
category: Social Media
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Instagram%20with%20Composio'
---


## Overview

**SLUG**: `INSTAGRAM`

### Description
Instagram is a social media platform for sharing photos, videos, and stories.

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string" default="instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


<Accordion title="Bearer Token">
<ParamField path="token" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Instagram
### Create an auth config
Use the dashboard to create an auth config for the Instagram toolkit. This allows you to connect multiple Instagram accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Instagram](https://platform.composio.dev/marketplace/Instagram)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Instagram Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
instagram_auth_config_id = "ac_YOUR_INSTAGRAM_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Instagram: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, instagram_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const instagram_auth_config_id = "ac_YOUR_INSTAGRAM_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Instagram: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, instagram_auth_config_id);

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
instagram_auth_config_id = "ac_YOUR_INSTAGRAM_CONFIG_ID" 

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
    print(f"Successfully connected Instagram for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, instagram_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const instagram_auth_config_id = "ac_YOUR_INSTAGRAM_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the Bearer Token from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const bearerToken = await getUserBearerToken(userId);
  const bearerToken = "your_instagram_bearer_token"; // Replace with actual bearer token
  
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
  console.log(`Successfully connected Instagram for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, instagram_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Instagram toolkit's playground](https://app.composio.dev/app/Instagram)

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

tools = composio.tools.get(user_id=user_id, toolkits=["INSTAGRAM"])

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

// Get tools for Instagram
const tools = await composio.tools.get(userId, {
  toolkits: ["INSTAGRAM"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Instagram?', // Your task here!
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

# Get tools for Instagram
tools = composio.tools.get(user_id, toolkits=["INSTAGRAM"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Instagram?")
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

// Get tools for Instagram
const tools = await composio.tools.get(userId, { 
  toolkits: ["INSTAGRAM"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Instagram?", // Your task here!
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
<Accordion title="INSTAGRAM_CREATE_CAROUSEL_CONTAINER">
**Tool Name:** Create Carousel Container

**Description**

```text wordWrap
Create a draft carousel post with multiple images/videos before publishing.
```


**Action Parameters**

<ParamField path="caption" type="string">
</ParamField>

<ParamField path="children" type="array" required={true}>
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_user_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_CREATE_MEDIA_CONTAINER">
**Tool Name:** Create Media Container

**Description**

```text wordWrap
Create a draft media container for photos/videos/reels before publishing.
```


**Action Parameters**

<ParamField path="caption" type="string">
</ParamField>

<ParamField path="content_type" type="string">
</ParamField>

<ParamField path="cover_url" type="string">
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_user_id" type="string" required={true}>
</ParamField>

<ParamField path="image_url" type="string">
</ParamField>

<ParamField path="is_carousel_item" type="boolean">
</ParamField>

<ParamField path="media_type" type="string">
</ParamField>

<ParamField path="video_url" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_CREATE_POST">
**Tool Name:** Create Post

**Description**

```text wordWrap
Publish a draft media container to instagram (final publishing step).
```


**Action Parameters**

<ParamField path="creation_id" type="string" required={true}>
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_user_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_GET_CONVERSATION">
**Tool Name:** Get Conversation

**Description**

```text wordWrap
Get details about a specific instagram dm conversation (participants, etc).
```


**Action Parameters**

<ParamField path="conversation_id" type="string" required={true}>
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_GET_POST_COMMENTS">
**Tool Name:** Get Post Comments

**Description**

```text wordWrap
Get comments on an instagram post.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_post_id" type="string" required={true}>
</ParamField>

<ParamField path="limit" type="integer" default="25">
</ParamField>


**Action Response**

<ParamField path="data" type="array">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="paging" type="object">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

<ParamField path="summary" type="object">
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_GET_POST_INSIGHTS">
**Tool Name:** Get Post Insights

**Description**

```text wordWrap
Get instagram post insights/analytics (impressions, reach, engagement, etc.).
```


**Action Parameters**

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_post_id" type="string" required={true}>
</ParamField>

<ParamField path="metric" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="array">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="paging" type="object">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_GET_POST_STATUS">
**Tool Name:** Get Post Status

**Description**

```text wordWrap
Check the processing status of a draft post container.
```


**Action Parameters**

<ParamField path="creation_id" type="string" required={true}>
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_GET_USER_INFO">
**Tool Name:** Get User Info

**Description**

```text wordWrap
Get instagram user info including profile details and statistics.
```


**Action Parameters**

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_user_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_GET_USER_INSIGHTS">
**Tool Name:** Get User Insights

**Description**

```text wordWrap
Get instagram account-level insights/analytics (profile views, reach, impressions, etc.).
```


**Action Parameters**

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_user_id" type="string">
</ParamField>

<ParamField path="metric" type="array">
</ParamField>

<ParamField path="period" type="string" default="day">
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="until" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="array">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="paging" type="object">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_GET_USER_MEDIA">
**Tool Name:** Get User Media

**Description**

```text wordWrap
Get instagram user's media (posts, photos, videos).
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_user_id" type="string">
</ParamField>

<ParamField path="limit" type="integer" default="25">
</ParamField>


**Action Response**

<ParamField path="data" type="array">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="paging" type="object">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_LIST_ALL_CONVERSATIONS">
**Tool Name:** List All Conversations

**Description**

```text wordWrap
List all instagram dm conversations for the authenticated user.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_user_id" type="string">
</ParamField>

<ParamField path="limit" type="integer" default="25">
</ParamField>


**Action Response**

<ParamField path="data" type="array">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="paging" type="object">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_LIST_ALL_MESSAGES">
**Tool Name:** List All Messages

**Description**

```text wordWrap
List all messages from a specific instagram dm conversation.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="conversation_id" type="string" required={true}>
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="limit" type="integer" default="25">
</ParamField>


**Action Response**

<ParamField path="data" type="array">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="paging" type="object">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_MARK_SEEN">
**Tool Name:** Mark Seen

**Description**

```text wordWrap
Mark instagram dm messages as read/seen for a specific user.
```


**Action Parameters**

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="recipient_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_REPLY_TO_COMMENT">
**Tool Name:** Reply To Comment

**Description**

```text wordWrap
Reply to a comment on instagram media.
```


**Action Parameters**

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_comment_id" type="string" required={true}>
</ParamField>

<ParamField path="message" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_SEND_IMAGE">
**Tool Name:** Send Image

**Description**

```text wordWrap
Send an image via instagram dm to a specific user.
```


**Action Parameters**

<ParamField path="caption" type="string">
</ParamField>

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="image_url" type="string" required={true}>
</ParamField>

<ParamField path="recipient_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="INSTAGRAM_SEND_TEXT_MESSAGE">
**Tool Name:** Send Text Message

**Description**

```text wordWrap
Send a text message to an instagram user via dm.
```


**Action Parameters**

<ParamField path="graph_api_version" type="string" default="v21.0">
</ParamField>

<ParamField path="ig_user_id" type="string">
</ParamField>

<ParamField path="recipient_id" type="string" required={true}>
</ParamField>

<ParamField path="reply_to_message_id" type="string">
</ParamField>

<ParamField path="text" type="string" required={true}>
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
