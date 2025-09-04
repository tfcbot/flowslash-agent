---
title: Twitter
subtitle: Learn how to use Twitter with Composio
category: social
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Twitter%20with%20Composio'
---


## Overview

**SLUG**: `TWITTER`

### Description
Twitter, Inc. was an American social media company based in San Francisco, California, which operated and was named for named for its flagship social media network prior to its rebrand as X.

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="full" type="string" required={true} default="https://api.x.com">
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string" default="dm.write dm.read mute.read mute.write space.read tweet.write tweet.read tweet.moderate.write users.read follows.read follows.write like.read like.write list.read list.write block.read block.write bookmark.read bookmark.write offline.access">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


<Accordion title="Bearer Token">
<ParamField path="token" type="string" required={true}>
</ParamField>

</Accordion>


## Connecting to Twitter
### Create an auth config
Use the dashboard to create an auth config for the Twitter toolkit. This allows you to connect multiple Twitter accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Twitter](https://platform.composio.dev/marketplace/Twitter)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Twitter Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
twitter_auth_config_id = "ac_YOUR_TWITTER_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Twitter: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, twitter_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const twitter_auth_config_id = "ac_YOUR_TWITTER_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Twitter: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, twitter_auth_config_id);

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
twitter_auth_config_id = "ac_YOUR_TWITTER_CONFIG_ID" 

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
    print(f"Successfully connected Twitter for user {user_id}")
    print(f"Connection status: {connection_request.status}")
    
    return connection_request.id


connection_id = authenticate_toolkit(user_id, twitter_auth_config_id)

# You can verify the connection using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';
import { AuthScheme } from '@composio/core';
// Replace these with your actual values
const twitter_auth_config_id = "ac_YOUR_TWITTER_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  // TODO: Replace this with a method to retrieve the Bearer Token from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const bearerToken = await getUserBearerToken(userId);
  const bearerToken = "your_twitter_bearer_token"; // Replace with actual bearer token
  
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
  console.log(`Successfully connected Twitter for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, twitter_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Twitter toolkit's playground](https://app.composio.dev/app/Twitter)

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

tools = composio.tools.get(user_id=user_id, toolkits=["TWITTER"])

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

// Get tools for Twitter
const tools = await composio.tools.get(userId, {
  toolkits: ["TWITTER"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Twitter?', // Your task here!
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

# Get tools for Twitter
tools = composio.tools.get(user_id, toolkits=["TWITTER"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Twitter?")
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

// Get tools for Twitter
const tools = await composio.tools.get(userId, { 
  toolkits: ["TWITTER"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Twitter?", // Your task here!
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
<Accordion title="TWITTER_ADD_A_LIST_MEMBER">
**Tool Name:** Add a list member

**Description**

```text wordWrap
Adds a user to a specified twitter list; the list must be owned by the authenticated user.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

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

<Accordion title="TWITTER_ADD_POST_TO_BOOKMARKS">
**Tool Name:** Add post to bookmarks

**Description**

```text wordWrap
Adds a specified, existing, and accessible tweet to a user's bookmarks, with success indicated by the 'bookmarked' field in the response.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="tweet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_BOOKMARKS_BY_USER">
**Tool Name:** Get bookmarks by user

**Description**

```text wordWrap
Retrieves tweets bookmarked by the authenticated user, where the provided user id must match the authenticated user's id.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="2">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_CREATE_A_NEW_DM_CONVERSATION">
**Tool Name:** Create group DM conversation

**Description**

```text wordWrap
Creates a new group direct message (dm) conversation on twitter with specified participant ids and an initial message, which can include text and media attachments.
```


**Action Parameters**

<ParamField path="conversation_type" type="string" required={true}>
</ParamField>

<ParamField path="message" type="object" required={true}>
</ParamField>

<ParamField path="participant_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_CREATE_COMPLIANCE_JOB_REQUEST">
**Tool Name:** Create compliance job

**Description**

```text wordWrap
Creates a new compliance job to check the status of tweet or user ids; upload ids as a plain text file (one id per line) to the `upload url` received in the response.
```


**Action Parameters**

<ParamField path="name" type="string">
</ParamField>

<ParamField path="resumable" type="boolean">
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

<Accordion title="TWITTER_CREATE_LIST">
**Tool Name:** Create a list

**Description**

```text wordWrap
Creates a new, empty list on x (formerly twitter), for which the provided name must be unique for the authenticated user; accounts are added separately.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_CREATION_OF_A_POST">
**Tool Name:** Create a post

**Description**

```text wordWrap
Creates a tweet on twitter; `text` is required unless `card uri`, `media media ids`, `poll options`, or `quote tweet id` is provided.
```


**Action Parameters**

<ParamField path="card_uri" type="string">
</ParamField>

<ParamField path="direct_message_deep_link" type="string">
</ParamField>

<ParamField path="for_super_followers_only" type="boolean">
</ParamField>

<ParamField path="geo__place__id" type="string">
</ParamField>

<ParamField path="media__media__ids" type="array">
</ParamField>

<ParamField path="media__tagged__user__ids" type="array">
</ParamField>

<ParamField path="nullcast" type="boolean">
</ParamField>

<ParamField path="poll__duration__minutes" type="integer">
</ParamField>

<ParamField path="poll__options" type="array">
</ParamField>

<ParamField path="poll__reply__settings" type="string">
</ParamField>

<ParamField path="quote_tweet_id" type="string">
</ParamField>

<ParamField path="reply__exclude__reply__user__ids" type="array">
</ParamField>

<ParamField path="reply__in__reply__to__tweet__id" type="string">
</ParamField>

<ParamField path="reply_settings" type="string">
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

<Accordion title="TWITTER_DELETE_DM">
**Tool Name:** Delete direct message

**Description**

```text wordWrap
Permanently deletes a specific twitter direct message (dm) event using its `event id` if the authenticated user sent it; this action is irreversible and does not delete entire conversations.
```


**Action Parameters**

<ParamField path="event_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_DELETE_LIST">
**Tool Name:** Delete list

**Description**

```text wordWrap
Permanently deletes a specified twitter list using its id, which must be owned by the authenticated user; this action is irreversible and the list must already exist.
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

<Accordion title="TWITTER_FETCH_LIST_MEMBERS_BY_ID">
**Tool Name:** Fetch list members by id

**Description**

```text wordWrap
Fetches members of a specific twitter list, identified by its unique id.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_FETCH_SPACE_TICKET_BUYERS_LIST">
**Tool Name:** Fetch space ticket buyers list

**Description**

```text wordWrap
Retrieves a list of users who purchased tickets for a specific, valid, and ticketed twitter space.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_FOLLOW_A_LIST">
**Tool Name:** Follow a list

**Description**

```text wordWrap
Allows the authenticated user (`id`) to follow a specific twitter list (`list id`) they are permitted to access, subscribing them to the list's timeline; this does not automatically follow individual list members.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_FOLLOWERS_BY_USER_ID">
**Tool Name:** Get followers by user id

**Description**

```text wordWrap
Retrieves a list of users who follow a specified public twitter user id.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_FOLLOWING_BY_USER_ID">
**Tool Name:** Get following by user ID

**Description**

```text wordWrap
Retrieves users followed by a specific twitter user, allowing pagination and customization of returned user and tweet data fields via expansions.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_FOLLOW_USER">
**Tool Name:** Follow a user

**Description**

```text wordWrap
Allows an authenticated user (path `id`) to follow another user (`target user id`), which results in a pending request if the target user's tweets are protected.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="target_user_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_FULL_ARCHIVE_SEARCH">
**Tool Name:** Search full archive of tweets

**Description**

```text wordWrap
Searches the full archive of public tweets from march 2006 onwards; use 'start time' and 'end time' together for a defined time window.
```


**Action Parameters**

<ParamField path="end_time" type="string">
</ParamField>

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="10">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="next_token" type="string">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="since_id" type="string">
</ParamField>

<ParamField path="sort_order" type="string">
</ParamField>

<ParamField path="start_time" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="until_id" type="string">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_FULL_ARCHIVE_SEARCH_COUNTS">
**Tool Name:** Get full archive search counts

**Description**

```text wordWrap
Returns a count of tweets from the full archive that match a specified query, aggregated by day, hour, or minute; `start time` must be before `end time` if both are provided, and `since id`/`until id` cannot be used with `start time`/`end time`.
```


**Action Parameters**

<ParamField path="end_time" type="string">
</ParamField>

<ParamField path="granularity" type="string" default="hour">
</ParamField>

<ParamField path="next_token" type="string">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="search__count__fields" type="array">
</ParamField>

<ParamField path="since_id" type="string">
</ParamField>

<ParamField path="start_time" type="string">
</ParamField>

<ParamField path="until_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_A_USER_S_LIST_MEMBERSHIPS">
**Tool Name:** Get a user's list memberships

**Description**

```text wordWrap
Retrieves all twitter lists a specified user is a member of, including public lists and private lists the authenticated user is authorized to view.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list__fields" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_A_USER_S_OWNED_LISTS">
**Tool Name:** Get a user's owned lists

**Description**

```text wordWrap
Call this action to retrieve lists created (owned) by a specific twitter user, not lists they follow or are subscribed to.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list__fields" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_A_USER_S_PINNED_LISTS">
**Tool Name:** Get a user's pinned lists

**Description**

```text wordWrap
Retrieves the lists a specific, existing twitter user has pinned to their profile to highlight them.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_BLOCKED_USERS">
**Tool Name:** Get users blocked by user ID

**Description**

```text wordWrap
Retrieves user objects for accounts blocked by the specified user id; this is a read-only view of a user's block list.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_DM_EVENTS_BY_ID">
**Tool Name:** Get DM events by ID

**Description**

```text wordWrap
Fetches a specific direct message (dm) event by its unique id, allowing optional expansion of related data like users or tweets; ensure the `event id` refers to an existing dm event accessible to the authenticated user.
```


**Action Parameters**

<ParamField path="dm__event__fields" type="array">
</ParamField>

<ParamField path="event_id" type="string" required={true}>
</ParamField>

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_DM_EVENTS_FOR_A_DM_CONVERSATION">
**Tool Name:** Get DM events for a DM conversation

**Description**

```text wordWrap
Fetches direct message (dm) events for a one-on-one conversation with a specified participant id, ordered chronologically newest to oldest; does not support group dms.
```


**Action Parameters**

<ParamField path="dm__event__fields" type="array">
</ParamField>

<ParamField path="event_types" type="array" default="['MessageCreate', 'ParticipantsLeave', 'ParticipantsJoin']">
</ParamField>

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="participant_id" type="string" required={true}>
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_LIST_FOLLOWERS">
**Tool Name:** Get list followers

**Description**

```text wordWrap
Fetches a list of users who follow a specific twitter list, identified by its id; ensure the authenticated user has access if the list is private.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_MUTED_USERS">
**Tool Name:** Get muted users

**Description**

```text wordWrap
Returns user objects muted by the x user identified by the `id` path parameter.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_POST_RETWEETERS_ACTION">
**Tool Name:** Get post retweeters

**Description**

```text wordWrap
Retrieves users who publicly retweeted a specified public post id, excluding quote tweets and retweets from private accounts.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_RECENT_DM_EVENTS">
**Tool Name:** Get recent direct message events

**Description**

```text wordWrap
Returns recent direct message events for the authenticated user, such as new messages or changes in conversation participants.
```


**Action Parameters**

<ParamField path="dm__event__fields" type="array">
</ParamField>

<ParamField path="event_types" type="array" default="['MessageCreate', 'ParticipantsLeave', 'ParticipantsJoin']">
</ParamField>

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_GET_USER_S_FOLLOWED_LISTS">
**Tool Name:** Get user's followed lists

**Description**

```text wordWrap
Returns metadata (not tweets) for lists a specific twitter user follows, optionally including expanded owner details.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list__fields" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_HIDE_REPLIES">
**Tool Name:** Set reply visibility

**Description**

```text wordWrap
Hides or unhides an existing reply tweet.
```


**Action Parameters**

<ParamField path="hidden" type="boolean" required={true}>
</ParamField>

<ParamField path="tweet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_LIST_LOOKUP_BY_LIST_ID">
**Tool Name:** Lookup list by ID

**Description**

```text wordWrap
Returns metadata for a specific twitter list, identified by its id; does not return list members but can expand the owner's user object via the `expansions` parameter.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_LIST_POST_LIKERS">
**Tool Name:** List post likers

**Description**

```text wordWrap
Retrieves users who have liked the post (tweet) identified by the provided id.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_LIST_POSTS_TIMELINE_BY_LIST_ID">
**Tool Name:** List posts timeline by list ID

**Description**

```text wordWrap
Fetches the most recent tweets posted by members of a specified twitter list.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_MUTE_USER_BY_USER_ID">
**Tool Name:** Mute user by ID

**Description**

```text wordWrap
Mutes a target user on behalf of an authenticated user, preventing the target's tweets and retweets from appearing in the authenticated user's home timeline without notifying the target.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="target_user_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_PIN_A_LIST">
**Tool Name:** Pin a list

**Description**

```text wordWrap
Pins a specified list to the authenticated user's profile, provided the list exists, the user has access rights, and the pin limit (typically 5 lists) is not exceeded.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_POST_DELETE_BY_POST_ID">
**Tool Name:** Delete tweet

**Description**

```text wordWrap
Irreversibly deletes a specific tweet by its id; the tweet may persist in third-party caches after deletion.
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

<Accordion title="TWITTER_POST_LOOKUP_BY_POST_ID">
**Tool Name:** Look up post by id

**Description**

```text wordWrap
Fetches comprehensive details for a single tweet by its unique id, provided the tweet exists and is accessible.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_POST_LOOKUP_BY_POST_IDS">
**Tool Name:** Get tweets by IDs

**Description**

```text wordWrap
Retrieves detailed information for one or more posts (tweets) identified by their unique ids, allowing selection of specific fields and expansions.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="ids" type="array" required={true}>
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_POSTS_LABEL_STREAM">
**Tool Name:** Get tweets label stream

**Description**

```text wordWrap
Establishes a persistent stream of real-time events for when tweet labels are applied or removed, offering insights into content categorization.
```


**Action Parameters**

<ParamField path="backfill_minutes" type="integer">
</ParamField>

<ParamField path="end_time" type="string">
</ParamField>

<ParamField path="start_time" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_POST_USAGE">
**Tool Name:** Fetch tweet usage data

**Description**

```text wordWrap
Fetches tweet usage statistics for a project (e.g., consumption, caps, daily breakdowns for project & client apps) to monitor api limits; data can be retrieved for 1 to 90 days.
```


**Action Parameters**

<ParamField path="days" type="integer" default="7">
</ParamField>

<ParamField path="usage__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_RECENT_SEARCH">
**Tool Name:** Search recent tweets

**Description**

```text wordWrap
Searches tweets from the last 7 days matching a query (using x's search syntax), ideal for real-time analysis, trend monitoring, or retrieving posts from specific users (e.g., `from:username`)
```


**Action Parameters**

<ParamField path="end_time" type="string">
</ParamField>

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="10">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="next_token" type="string">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="since_id" type="string">
</ParamField>

<ParamField path="sort_order" type="string">
</ParamField>

<ParamField path="start_time" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="until_id" type="string">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_RECENT_SEARCH_COUNTS">
**Tool Name:** Fetch recent tweet counts

**Description**

```text wordWrap
Retrieves the count of tweets matching a specified search query within the last 7 days, aggregated by 'minute', 'hour', or 'day'.
```


**Action Parameters**

<ParamField path="end_time" type="string">
</ParamField>

<ParamField path="granularity" type="string" default="hour">
</ParamField>

<ParamField path="next_token" type="string">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="search__count__fields" type="array">
</ParamField>

<ParamField path="since_id" type="string">
</ParamField>

<ParamField path="start_time" type="string">
</ParamField>

<ParamField path="until_id" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_REMOVE_A_BOOKMARKED_POST">
**Tool Name:** Remove a bookmarked post

**Description**

```text wordWrap
Removes a tweet, specified by `tweet id`, from the authenticated user's bookmarks; the tweet must have been previously bookmarked by the user for the action to have an effect.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="tweet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_REMOVE_A_LIST_MEMBER">
**Tool Name:** Remove a list member

**Description**

```text wordWrap
Removes a user from a twitter list; the response `is member` field will be `false` if removal was successful or the user was not a member, and the updated list of members is not returned.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

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

<Accordion title="TWITTER_RETRIEVE_COMPLIANCE_JOB_BY_ID">
**Tool Name:** Retrieve compliance job by id

**Description**

```text wordWrap
Retrieves status, download/upload urls, and other details for an existing twitter compliance job specified by its unique id.
```


**Action Parameters**

<ParamField path="compliance__job__fields" type="array">
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

<Accordion title="TWITTER_RETRIEVE_COMPLIANCE_JOBS">
**Tool Name:** Retrieve compliance jobs

**Description**

```text wordWrap
Returns a list of recent compliance jobs, filtered by type (tweets or users) and optionally by status.
```


**Action Parameters**

<ParamField path="compliance__job__fields" type="array">
</ParamField>

<ParamField path="status" type="string">
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

<Accordion title="TWITTER_RETRIEVE_DM_CONVERSATION_EVENTS">
**Tool Name:** Retrieve DM conversation events

**Description**

```text wordWrap
Retrieves direct message (dm) events for a specific conversation id on twitter, useful for analyzing messages and participant activities.
```


**Action Parameters**

<ParamField path="dm__event__fields" type="array">
</ParamField>

<ParamField path="event_types" type="array" default="['MessageCreate', 'ParticipantsLeave', 'ParticipantsJoin']">
</ParamField>

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_RETRIEVE_POSTS_FROM_A_SPACE">
**Tool Name:** Retrieve posts from a space

**Description**

```text wordWrap
Retrieves tweets from a specified twitter space id; the space must be accessible and results are batched (not streamed).
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_RETRIEVE_POSTS_THAT_QUOTE_A_POST">
**Tool Name:** Retrieve posts that quote a post

**Description**

```text wordWrap
Retrieves tweets that quote a specified tweet, requiring a valid tweet id.
```


**Action Parameters**

<ParamField path="exclude" type="array">
</ParamField>

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="10">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_RETRIEVE_POSTS_THAT_REPOST_A_POST">
**Tool Name:** Retrieve retweets of a post

**Description**

```text wordWrap
Retrieves tweets that retweeted a specified public or authenticated-user-accessible tweet id, optionally customizing the response with fields and expansions.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_RETURNS_POST_OBJECTS_LIKED_BY_THE_PROVIDED_USER_ID">
**Tool Name:** Retrieve liked tweets by user ID

**Description**

```text wordWrap
Retrieves tweets liked by a specified twitter user, provided their liked tweets are public or accessible.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_RETURNS_THE_OPEN_API_SPECIFICATION_DOCUMENT">
**Tool Name:** Fetch OpenAPI specification

**Description**

```text wordWrap
Fetches the openapi specification (json) for twitter's api v2, used to programmatically understand the api's structure for developing client libraries or tools.
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

<Accordion title="TWITTER_RETWEET_POST">
**Tool Name:** Retweet post

**Description**

```text wordWrap
Retweets a tweet (`tweet id`) for a given user (`id`), provided the tweet is public (or user follows if protected), not already retweeted by the user, and its author has not blocked the user.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="tweet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_SEARCH_FOR_SPACES">
**Tool Name:** Search for spaces

**Description**

```text wordWrap
Searches for twitter spaces by a textual query, optionally filtering by state (live, scheduled, all) to discover audio conversations.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="max_results" type="integer" default="100">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="space__fields" type="array">
</ParamField>

<ParamField path="state" type="string" default="all">
</ParamField>

<ParamField path="topic__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_SEND_A_NEW_MESSAGE_TO_A_DM_CONVERSATION">
**Tool Name:** Send a new message to a DM conversation

**Description**

```text wordWrap
Sends a message, with optional text and/or media attachments (using pre-uploaded `media id`s), to a specified twitter direct message conversation.
```


**Action Parameters**

<ParamField path="attachments" type="array">
</ParamField>

<ParamField path="dm_conversation_id" type="string" required={true}>
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

<Accordion title="TWITTER_SEND_A_NEW_MESSAGE_TO_A_USER">
**Tool Name:** Send a new message to a user

**Description**

```text wordWrap
Sends a new direct message with text and/or media (media id for attachments must be pre-uploaded) to a specified twitter user; this creates a new dm and does not modify existing messages.
```


**Action Parameters**

<ParamField path="attachments" type="array">
</ParamField>

<ParamField path="participant_id" type="string" required={true}>
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

<Accordion title="TWITTER_SPACE_LOOKUP_BY_SPACE_ID">
**Tool Name:** Look up space by ID

**Description**

```text wordWrap
Retrieves details for a twitter space by its id, allowing for customization and expansion of related data, provided the space id is valid and accessible.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="space__fields" type="array">
</ParamField>

<ParamField path="topic__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_SPACE_LOOKUP_BY_THEIR_CREATORS">
**Tool Name:** Get spaces by creator IDs

**Description**

```text wordWrap
Retrieves twitter spaces created by a list of specified user ids, with options to customize returned data fields.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="space__fields" type="array">
</ParamField>

<ParamField path="topic__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>

<ParamField path="user_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_SPACE_LOOKUP_UP_SPACE_IDS">
**Tool Name:** Get space information by IDs

**Description**

```text wordWrap
Fetches detailed information for one or more twitter spaces (live, scheduled, or ended) by their unique ids; at least one space id must be provided.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="ids" type="array" required={true}>
</ParamField>

<ParamField path="space__fields" type="array">
</ParamField>

<ParamField path="topic__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_UNFOLLOW_A_LIST">
**Tool Name:** Unfollow a list

**Description**

```text wordWrap
Enables a user (via `id`) to unfollow a specific twitter list (via `list id`), which removes its tweets from their timeline and stops related notifications; the action reports `following: false` on success, even if the user was not initially following the list.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_UNFOLLOW_USER">
**Tool Name:** Unfollow user

**Description**

```text wordWrap
Allows the authenticated `source user id` to unfollow an existing twitter user (`target user id`), which removes the follow relationship.
```


**Action Parameters**

<ParamField path="source_user_id" type="string" required={true}>
</ParamField>

<ParamField path="target_user_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_UNLIKE_POST">
**Tool Name:** Unlike post

**Description**

```text wordWrap
Allows an authenticated user (`id`) to remove their like from a specific post (`tweet id`); the action is idempotent and completes successfully even if the post was not liked.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="tweet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_UNMUTE_USER_BY_USER_ID">
**Tool Name:** Unmute a user by user ID

**Description**

```text wordWrap
Unmutes a `target user id` for the `source user id` (authenticated user), allowing the source user to see tweets and notifications from the target user again.
```


**Action Parameters**

<ParamField path="source_user_id" type="string" required={true}>
</ParamField>

<ParamField path="target_user_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_UNPIN_A_LIST">
**Tool Name:** Unpin a list

**Description**

```text wordWrap
Unpins a list (specified by list id) from a user's profile (specified by id), provided the list is currently pinned by that user.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="list_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_UNRETWEET_POST">
**Tool Name:** Unretweet post

**Description**

```text wordWrap
Removes a user's retweet of a specified post, if the user had previously retweeted it.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="source_tweet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_UPDATE_LIST">
**Tool Name:** Update list attributes

**Description**

```text wordWrap
Updates an existing twitter list's name, description, or privacy status, requiring the list id and at least one mutable property.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_USER_HOME_TIMELINE_BY_USER_ID">
**Tool Name:** Get user reverse chronological timeline

**Description**

```text wordWrap
Retrieves the home timeline/feed for a specified twitter user, showing tweets from accounts they follow - not their own posts - in reverse chronological order; useful for displaying their personalized feed without algorithmic sorting.
```


**Action Parameters**

<ParamField path="end_time" type="string">
</ParamField>

<ParamField path="exclude" type="array">
</ParamField>

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="max_results" type="integer">
</ParamField>

<ParamField path="media__fields" type="array">
</ParamField>

<ParamField path="pagination_token" type="string">
</ParamField>

<ParamField path="place__fields" type="array">
</ParamField>

<ParamField path="poll__fields" type="array">
</ParamField>

<ParamField path="since_id" type="string">
</ParamField>

<ParamField path="start_time" type="string">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="until_id" type="string">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_USER_LIKE_POST">
**Tool Name:** Like a tweet

**Description**

```text wordWrap
Allows the authenticated user (`id`) to like a specific, accessible tweet (`tweet id`), provided neither user has blocked the other and the authenticated user is not restricted from liking.
```


**Action Parameters**

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="tweet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_USER_LOOKUP_BY_ID">
**Tool Name:** Look up user by ID

**Description**

```text wordWrap
Retrieves detailed public information for a twitter user by their id, optionally expanding related data (e.g., pinned tweets) and specifying particular user or tweet fields to return.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="id" type="string" required={true}>
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_USER_LOOKUP_BY_IDS">
**Tool Name:** Look up users by IDs

**Description**

```text wordWrap
Retrieves detailed information for specified x (formerly twitter) user ids, optionally customizing returned fields and expanding related entities.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="ids" type="array" required={true}>
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_USER_LOOKUP_BY_USERNAME">
**Tool Name:** Look up user by username

**Description**

```text wordWrap
Fetches public profile information for a valid and existing twitter user by their username, optionally expanding related data like pinned tweets; results may be limited for protected profiles not followed by the authenticated user.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>

<ParamField path="username" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_USER_LOOKUP_BY_USERNAMES">
**Tool Name:** Look up users by username

**Description**

```text wordWrap
Retrieves detailed information for 1 to 100 twitter users by their usernames (each 1-15 alphanumeric characters/underscores), allowing customizable user/tweet fields and expansion of related data like pinned tweets.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
</ParamField>

<ParamField path="usernames" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="TWITTER_USER_LOOKUP_ME">
**Tool Name:** Get authenticated user

**Description**

```text wordWrap
Returns profile information for the currently authenticated x user, customizable via request fields.
```


**Action Parameters**

<ParamField path="expansions" type="array">
</ParamField>

<ParamField path="tweet__fields" type="array">
</ParamField>

<ParamField path="user__fields" type="array">
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
