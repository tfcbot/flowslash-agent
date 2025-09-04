---
title: Gmail
subtitle: Learn how to use Gmail with Composio
category: Collaboration & Communication
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Gmail%20with%20Composio'
---


## Overview

**SLUG**: `GMAIL`

### Description
Gmail is Google’s email service, featuring spam protection, search functions, and seamless integration with other G Suite apps for productivity

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string" default="https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/userinfo.profile,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/contacts.readonly,https://www.googleapis.com/auth/contacts.other.readonly,https://www.googleapis.com/auth/profile.language.read,https://www.googleapis.com/auth/user.addresses.read,https://www.googleapis.com/auth/user.birthday.read,https://www.googleapis.com/auth/user.emails.read,https://www.googleapis.com/auth/user.phonenumbers.read,https://www.googleapis.com/auth/profile.emails.read">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


<Accordion title="Bearer Token">
<ParamField path="token" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Gmail
### Create an auth config
Use the dashboard to create an auth config for the Gmail toolkit. This allows you to connect multiple Gmail accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Gmail](https://platform.composio.dev/marketplace/Gmail)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Gmail Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
gmail_auth_config_id = "ac_YOUR_GMAIL_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Gmail: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, gmail_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const gmail_auth_config_id = "ac_YOUR_GMAIL_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Gmail: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, gmail_auth_config_id);

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
gmail_auth_config_id = "ac_YOUR_GMAIL_CONFIG_ID" 

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
    print(f"Successfully connected Gmail for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, gmail_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const gmail_auth_config_id = "ac_YOUR_GMAIL_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the Bearer Token from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const bearerToken = await getUserBearerToken(userId);
  const bearerToken = "your_gmail_bearer_token"; // Replace with actual bearer token
  
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
  console.log(`Successfully connected Gmail for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, gmail_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Gmail toolkit's playground](https://app.composio.dev/app/Gmail)

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

tools = composio.tools.get(user_id=user_id, toolkits=["GMAIL"])

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

// Get tools for Gmail
const tools = await composio.tools.get(userId, {
  toolkits: ["GMAIL"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Gmail?', // Your task here!
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

# Get tools for Gmail
tools = composio.tools.get(user_id, toolkits=["GMAIL"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Gmail?")
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

// Get tools for Gmail
const tools = await composio.tools.get(userId, { 
  toolkits: ["GMAIL"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Gmail?", // Your task here!
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
<Accordion title="GMAIL_ADD_LABEL_TO_EMAIL">
**Tool Name:** Modify email labels

**Description**

```text wordWrap
Adds and/or removes specified gmail labels for a message; ensure `message id` and all `label ids` are valid (use 'listlabels' for custom label ids).
```


**Action Parameters**

<ParamField path="add_label_ids" type="array">
</ParamField>

<ParamField path="message_id" type="string" required={true}>
</ParamField>

<ParamField path="remove_label_ids" type="array">
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_CREATE_EMAIL_DRAFT">
**Tool Name:** Create email draft

**Description**

```text wordWrap
Creates a gmail email draft, supporting to/cc/bcc, subject, plain/html body (ensure `is html=true` for html), attachments, and threading.
```


**Action Parameters**

<ParamField path="attachment" type="object">
</ParamField>

<ParamField path="bcc" type="array">
</ParamField>

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="cc" type="array">
</ParamField>

<ParamField path="extra_recipients" type="array">
</ParamField>

<ParamField path="is_html" type="boolean">
</ParamField>

<ParamField path="recipient_email" type="string" required={true}>
</ParamField>

<ParamField path="subject" type="string" required={true}>
</ParamField>

<ParamField path="thread_id" type="string">
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_CREATE_LABEL">
**Tool Name:** Create label

**Description**

```text wordWrap
Creates a new label with a unique name in the specified user's gmail account.
```


**Action Parameters**

<ParamField path="background_color" type="string">
</ParamField>

<ParamField path="label_list_visibility" type="string" default="labelShow">
</ParamField>

<ParamField path="label_name" type="string" required={true}>
</ParamField>

<ParamField path="message_list_visibility" type="string" default="show">
</ParamField>

<ParamField path="text_color" type="string">
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_DELETE_DRAFT">
**Tool Name:** Delete Draft

**Description**

```text wordWrap
Permanently deletes a specific gmail draft using its id; ensure the draft exists and the user has necessary permissions for the given `user id`.
```


**Action Parameters**

<ParamField path="draft_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_DELETE_MESSAGE">
**Tool Name:** Delete message

**Description**

```text wordWrap
Permanently deletes a specific email message by its id from a gmail mailbox; for `user id`, use 'me' for the authenticated user or an email address to which the authenticated user has delegated access.
```


**Action Parameters**

<ParamField path="message_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_FETCH_EMAILS">
**Tool Name:** Fetch emails

**Description**

```text wordWrap
Fetches a list of email messages from a gmail account, supporting filtering, pagination, and optional full content retrieval.
```


**Action Parameters**

<ParamField path="ids_only" type="boolean">
</ParamField>

<ParamField path="include_payload" type="boolean" default="True">
</ParamField>

<ParamField path="include_spam_trash" type="boolean">
</ParamField>

<ParamField path="label_ids" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="1">
</ParamField>

<ParamField path="page_token" type="string">
</ParamField>

<ParamField path="query" type="string">
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>

<ParamField path="verbose" type="boolean" default="True">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID">
**Tool Name:** Fetch message by message ID

**Description**

```text wordWrap
Fetches a specific email message by its id, provided the `message id` exists and is accessible to the authenticated `user id`.
```


**Action Parameters**

<ParamField path="format" type="string" default="full">
</ParamField>

<ParamField path="message_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_FETCH_MESSAGE_BY_THREAD_ID">
**Tool Name:** Fetch Message by Thread ID

**Description**

```text wordWrap
Retrieves messages from a gmail thread using its `thread id`, where the thread must be accessible by the specified `user id`.
```


**Action Parameters**

<ParamField path="page_token" type="string">
</ParamField>

<ParamField path="thread_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_GET_ATTACHMENT">
**Tool Name:** Get Gmail attachment

**Description**

```text wordWrap
Retrieves a specific attachment by id from a message in a user's gmail mailbox, requiring valid message and attachment ids.
```


**Action Parameters**

<ParamField path="attachment_id" type="string" required={true}>
</ParamField>

<ParamField path="file_name" type="string" required={true}>
</ParamField>

<ParamField path="message_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_GET_CONTACTS">
**Tool Name:** Get contacts

**Description**

```text wordWrap
Fetches contacts (connections) for the authenticated google account, allowing selection of specific data fields and pagination.
```


**Action Parameters**

<ParamField path="include_other_contacts" type="boolean" default="True">
</ParamField>

<ParamField path="page_token" type="string">
</ParamField>

<ParamField path="person_fields" type="string" default="emailAddresses,names,birthdays,genders">
</ParamField>

<ParamField path="resource_name" type="string" default="people/me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_GET_PEOPLE">
**Tool Name:** Get People

**Description**

```text wordWrap
Retrieves either a specific person's details (using `resource name`) or lists 'other contacts' (if `other contacts` is true), with `person fields` specifying the data to return.
```


**Action Parameters**

<ParamField path="other_contacts" type="boolean">
</ParamField>

<ParamField path="page_size" type="integer" default="10">
</ParamField>

<ParamField path="page_token" type="string">
</ParamField>

<ParamField path="person_fields" type="string" default="emailAddresses,names,birthdays,genders">
</ParamField>

<ParamField path="resource_name" type="string" default="people/me">
</ParamField>

<ParamField path="sync_token" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_GET_PROFILE">
**Tool Name:** Get Profile

**Description**

```text wordWrap
Retrieves key gmail profile information (email address, message/thread totals, history id) for a user.
```


**Action Parameters**

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_LIST_DRAFTS">
**Tool Name:** List drafts

**Description**

```text wordWrap
Retrieves a paginated list of email drafts from a user's gmail account. use verbose=true to get full draft details including subject, body, sender, and timestamp.
```


**Action Parameters**

<ParamField path="max_results" type="integer" default="1">
</ParamField>

<ParamField path="page_token" type="string">
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>

<ParamField path="verbose" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_LIST_LABELS">
**Tool Name:** List Gmail labels

**Description**

```text wordWrap
Retrieves a list of all system and user-created labels for the specified gmail account.
```


**Action Parameters**

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_LIST_THREADS">
**Tool Name:** List threads

**Description**

```text wordWrap
Retrieves a list of email threads from a gmail account, identified by `user id` (email address or 'me'), supporting filtering and pagination.
```


**Action Parameters**

<ParamField path="max_results" type="integer" default="10">
</ParamField>

<ParamField path="page_token" type="string">
</ParamField>

<ParamField path="query" type="string">
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>

<ParamField path="verbose" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_MODIFY_THREAD_LABELS">
**Tool Name:** Modify thread labels

**Description**

```text wordWrap
Adds or removes specified existing label ids from a gmail thread, affecting all its messages; ensure the thread id is valid.
```


**Action Parameters**

<ParamField path="add_label_ids" type="array">
</ParamField>

<ParamField path="remove_label_ids" type="array">
</ParamField>

<ParamField path="thread_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_MOVE_TO_TRASH">
**Tool Name:** Move to Trash

**Description**

```text wordWrap
Moves an existing, non-deleted email message to the trash for the specified user.
```


**Action Parameters**

<ParamField path="message_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_PATCH_LABEL">
**Tool Name:** Patch Label

**Description**

```text wordWrap
Patches the specified label.
```


**Action Parameters**

<ParamField path="color" type="object">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="labelListVisibility" type="string">
</ParamField>

<ParamField path="messageListVisibility" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="userId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_REMOVE_LABEL">
**Tool Name:** Remove label

**Description**

```text wordWrap
Permanently deletes a specific, existing user-created gmail label by its id for a user; cannot delete system labels.
```


**Action Parameters**

<ParamField path="label_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_REPLY_TO_THREAD">
**Tool Name:** Reply to email thread

**Description**

```text wordWrap
Sends a reply within a specific gmail thread using the original thread's subject, requiring a valid `thread id` and correctly formatted email addresses. supports attachments via the `attachment` parameter with valid `s3key`, `mimetype`, and `name`.
```


**Action Parameters**

<ParamField path="attachment" type="object">
</ParamField>

<ParamField path="bcc" type="array">
</ParamField>

<ParamField path="cc" type="array">
</ParamField>

<ParamField path="extra_recipients" type="array">
</ParamField>

<ParamField path="is_html" type="boolean">
</ParamField>

<ParamField path="message_body" type="string" required={true}>
</ParamField>

<ParamField path="recipient_email" type="string" required={true}>
</ParamField>

<ParamField path="thread_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_SEARCH_PEOPLE">
**Tool Name:** Search People

**Description**

```text wordWrap
Searches contacts by matching the query against names, nicknames, emails, phone numbers, and organizations, optionally including 'other contacts'.
```


**Action Parameters**

<ParamField path="other_contacts" type="boolean" default="True">
</ParamField>

<ParamField path="pageSize" type="integer" default="10">
</ParamField>

<ParamField path="person_fields" type="string" default="emailAddresses,names,phoneNumbers">
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

<Accordion title="GMAIL_SEND_DRAFT">
**Tool Name:** Send Draft

**Description**

```text wordWrap
Sends the specified, existing draft to the recipients in the to, cc, and bcc headers.
```


**Action Parameters**

<ParamField path="draft_id" type="string" required={true}>
</ParamField>

<ParamField path="user_id" type="string" default="me">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GMAIL_SEND_EMAIL">
**Tool Name:** Send Email

**Description**

```text wordWrap
Sends an email via gmail api using the authenticated user's google profile display name, requiring `is html=true` if the body contains html and valid `s3key`, `mimetype`, `name` for any attachment.
```


**Action Parameters**

<ParamField path="attachment" type="object">
</ParamField>

<ParamField path="bcc" type="array">
</ParamField>

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="cc" type="array">
</ParamField>

<ParamField path="extra_recipients" type="array">
</ParamField>

<ParamField path="is_html" type="boolean">
</ParamField>

<ParamField path="recipient_email" type="string" required={true}>
</ParamField>

<ParamField path="subject" type="string">
</ParamField>

<ParamField path="user_id" type="string" default="me">
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
