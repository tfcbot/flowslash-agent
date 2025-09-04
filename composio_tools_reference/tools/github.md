---
title: GitHub
subtitle: Learn how to use GitHub with Composio
category: Developer Tools & DevOps
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20GitHub%20with%20Composio'
---


## Overview

**SLUG**: `GITHUB`

### Description
GitHub is a code hosting platform for version control and collaboration, offering Git-based repository management, issue tracking, and continuous integration features

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string" default="repo,user,gist,notifications,project,workflow,codespace">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


## Connecting to GitHub
### Create an auth config
Use the dashboard to create an auth config for the GitHub toolkit. This allows you to connect multiple GitHub accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[GitHub](https://platform.composio.dev/marketplace/GitHub)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create GitHub Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
github_auth_config_id = "ac_YOUR_GITHUB_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate GitHub: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, github_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const github_auth_config_id = "ac_YOUR_GITHUB_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate GitHub: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, github_auth_config_id);

// You can also verify the connection status using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [GitHub toolkit's playground](https://app.composio.dev/app/GitHub)

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

tools = composio.tools.get(user_id=user_id, toolkits=["GITHUB"])

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

// Get tools for GitHub
const tools = await composio.tools.get(userId, {
  toolkits: ["GITHUB"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with GitHub?', // Your task here!
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

# Get tools for GitHub
tools = composio.tools.get(user_id, toolkits=["GITHUB"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with GitHub?")
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

// Get tools for GitHub
const tools = await composio.tools.get(userId, { 
  toolkits: ["GITHUB"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with GitHub?", // Your task here!
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
<Accordion title="GITHUB_ACCEPT_A_REPOSITORY_INVITATION">
**Tool Name:** Accept a repository invitation

**Description**

```text wordWrap
Accepts a pending repository invitation that has been issued to the authenticated user.
```


**Action Parameters**

<ParamField path="invitation_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ACTIVITY_LIST_REPO_S_STARRED_BY_AUTHENTICATED_USER">
**Tool Name:** List repositories starred by the authenticated user

**Description**

```text wordWrap
Deprecated: lists repositories starred by the authenticated user, including star creation timestamps; use 'list repositories starred by the authenticated user' instead.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ACTIVITY_LIST_STARGAZERS_FOR_REPO">
**Tool Name:** List stargazers

**Description**

```text wordWrap
Deprecated: lists users who have starred a repository; use `list stargazers` instead.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ACTIVITY_STAR_REPO_FOR_AUTHENTICATED_USER">
**Tool Name:** Star a repository for the authenticated user

**Description**

```text wordWrap
Deprecated: stars a repository for the authenticated user; use `star a repository for the authenticated user` instead.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_AN_EMAIL_ADDRESS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Add email for auth user

**Description**

```text wordWrap
Adds one or more email addresses (which will be initially unverified) to the authenticated user's github account; use this to associate new emails, noting an email verified for another account will error, while an existing email for the current user is accepted.
```


**Action Parameters**

<ParamField path="emails" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_APP_ACCESS_RESTRICTIONS">
**Tool Name:** Add app access restrictions

**Description**

```text wordWrap
Replaces github app access restrictions for an existing protected branch; requires a json array of app slugs in the request body, where apps must be installed and have 'contents' write permissions.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_A_REPOSITORY_COLLABORATOR">
**Tool Name:** Add a repository collaborator

**Description**

```text wordWrap
Adds a github user as a repository collaborator, or updates their permission if already a collaborator; `permission` applies to organization-owned repositories (personal ones default to 'push' and ignore this field), and an invitation may be created or permissions updated directly.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="permission" type="string" default="push">
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_ADD_A_REPOSITORY_TO_AN_APP_INSTALLATION">
**Tool Name:** Add a repository to an app installation

**Description**

```text wordWrap
Adds a repository to a github app installation, granting the app access; requires authenticated user to have admin rights for the repository and access to the installation.
```


**Action Parameters**

<ParamField path="installation_id" type="integer" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_A_SELECTED_REPOSITORY_TO_A_USER_SECRET">
**Tool Name:** Add a selected repository to a user secret

**Description**

```text wordWrap
Grants a specified repository access to an authenticated user's existing codespaces secret, enabling codespaces created for that repository to use the secret.
```


**Action Parameters**

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_ASSIGNEES_TO_AN_ISSUE">
**Tool Name:** Add assignees to an issue

**Description**

```text wordWrap
Adds or removes assignees for a github issue; changes are silently ignored if the authenticated user lacks push access to the repository.
```


**Action Parameters**

<ParamField path="assignees" type="array">
</ParamField>

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_LABELS_TO_AN_ISSUE">
**Tool Name:** Add labels to an issue

**Description**

```text wordWrap
Adds labels (provided in the request body) to a repository issue; labels that do not already exist are created.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_ORG_RUNNER_LABELS">
**Tool Name:** Add org runner labels

**Description**

```text wordWrap
Adds new custom labels to an existing self-hosted runner for an organization; existing labels are not removed, and duplicates are not added.
```


**Action Parameters**

<ParamField path="labels" type="array" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_OR_UPDATE_TEAM_MEMBERSHIP_FOR_A_USER">
**Tool Name:** Add or update team membership for a user

**Description**

```text wordWrap
Adds a github user to a team or updates their role (member or maintainer), inviting them to the organization if not already a member; idempotent, returning current details if no change is made.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="role" type="string" default="member">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
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

<Accordion title="GITHUB_ADD_OR_UPDATE_TEAM_PROJECT_PERMISSIONS">
**Tool Name:** Add or update team project permissions

**Description**

```text wordWrap
Grants or updates a team's permissions ('read', 'write', or 'admin') for a specific project, which must exist within the specified organization and be linked to it.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="permission" type="string">
</ParamField>

<ParamField path="project_id" type="integer" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_OR_UPDATE_TEAM_REPOSITORY_PERMISSIONS">
**Tool Name:** Add or update team repository permissions

**Description**

```text wordWrap
Sets or updates a team's permission level for a repository within an organization; the team must be a member of the organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="permission" type="string" default="push">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_PROJECT_COLLABORATOR">
**Tool Name:** Add project collaborator

**Description**

```text wordWrap
Adds a specified github user as a collaborator to an existing organization project with a given permission level.
```


**Action Parameters**

<ParamField path="permission" type="string" default="write">
</ParamField>

<ParamField path="project_id" type="integer" required={true}>
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

<Accordion title="GITHUB_ADD_REPO_TO_ORG_SECRET_WITH_SELECTED_ACCESS">
**Tool Name:** Add repo to org secret with selected access

**Description**

```text wordWrap
Adds a repository to an existing organization-level github actions secret that is configured for 'selected' repository access.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_REPO_TO_ORG_SECRET_WITH_SELECTED_VISIBILITY">
**Tool Name:** Add selected repo to org secret

**Description**

```text wordWrap
Grants an existing repository access to an existing organization-level dependabot secret; the repository must belong to the organization, and the call succeeds without change if access already exists.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_RUNNER_LABELS">
**Tool Name:** Add runner labels

**Description**

```text wordWrap
Adds and appends custom labels to a self-hosted repository runner, which must be registered and active.
```


**Action Parameters**

<ParamField path="labels" type="array" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_SELECTED_REPOSITORY_TO_AN_ORGANIZATION_SECRET">
**Tool Name:** Add selected repository to an organization secret

**Description**

```text wordWrap
Adds a repository to an organization secret's access list when the secret's visibility is 'selected'; this operation is idempotent.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_SELECTED_REPOSITORY_TO_AN_ORGANIZATION_VARIABLE">
**Tool Name:** Add selected repository to an organization variable

**Description**

```text wordWrap
Grants a repository access to an organization-level github actions variable, if that variable's visibility is set to 'selected repositories'.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_SOCIAL_ACCOUNTS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Add social accounts for the authenticated user

**Description**

```text wordWrap
Adds one or more social media links (which must be valid, full urls for platforms supported by github) to the authenticated user's public github profile.
```


**Action Parameters**

<ParamField path="account_urls" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_STATUS_CHECK_CONTEXTS">
**Tool Name:** Add status check contexts

**Description**

```text wordWrap
Adds status check contexts (provided in the request body, e.g., `{"contexts": ["new-context"]}`) to a protected branch, requiring these contexts to have been previously reported.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_TEAM_ACCESS_RESTRICTIONS">
**Tool Name:** Add team access restrictions

**Description**

```text wordWrap
Overwrites the list of teams (and their child teams) granted push access to a protected branch; the list of team slugs must be provided in the http post request body.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_USER_ACCESS_RESTRICTIONS">
**Tool Name:** Add user access restrictions

**Description**

```text wordWrap
Sets/replaces list of users allowed to push to a protected branch; usernames (e.g., `["user1"]`) must be a json array in request body (not schema parameters), an empty array `[]` removes all restrictions.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ADD_USERS_TO_CODESPACES_ACCESS_FOR_AN_ORGANIZATION">
**Tool Name:** Add users to codespaces access for an organization

**Description**

```text wordWrap
Sets or replaces the list of organization members granted codespaces access billed to the organization; ensure the organization's billing settings allow access for selected members.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="selected_usernames" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_APPROVE_A_WORKFLOW_RUN_FOR_A_FORK_PULL_REQUEST">
**Tool Name:** Approve a workflow run for a fork pull request

**Description**

```text wordWrap
Approves a workflow run from a forked repository's pull request; call this when such a run requires manual approval due to workflow configuration.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ASSIGN_AN_ORGANIZATION_ROLE_TO_A_TEAM">
**Tool Name:** Assign an organization role to a team

**Description**

```text wordWrap
Assigns an existing organization-level role (identified by `role id`) to a team (identified by `team slug`) within a github organization (`org`), provided the organization, team, and role already exist.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ASSIGN_AN_ORGANIZATION_ROLE_TO_A_USER">
**Tool Name:** Assign an organization role to a user

**Description**

```text wordWrap
Assigns a specific organization role to a user who is a member or an outside collaborator in a github organization, using a valid role id.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
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

<Accordion title="GITHUB_AUTH_USER_DOCKER_CONFLICT_PACKAGES_LIST">
**Tool Name:** Authuserdockerconflictpackageslist

**Description**

```text wordWrap
Lists docker packages for the authenticated user that encountered conflicts during the docker migration process.
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

<Accordion title="GITHUB_BLOCK_A_USER">
**Tool Name:** Block a user

**Description**

```text wordWrap
Blocks an existing individual github user (not an organization or your own account), preventing them from interacting with your account and repositories.
```


**Action Parameters**

<ParamField path="username" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_BLOCK_A_USER_FROM_AN_ORGANIZATION">
**Tool Name:** Block a user from an organization

**Description**

```text wordWrap
Blocks an existing github user from an existing organization, preventing their contributions, collaboration, and forking of the organization's repositories.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_CANCEL_A_GITHUB_PAGES_DEPLOYMENT">
**Tool Name:** Cancel a GitHub Pages deployment

**Description**

```text wordWrap
Cancels an existing, ongoing or queued github pages deployment for a repository using its `pages deployment id`.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pages_deployment_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CANCEL_A_WORKFLOW_RUN">
**Tool Name:** Cancel a workflow run

**Description**

```text wordWrap
Cancels a workflow run in a github repository if it is in a cancellable state (e.g., 'in progress' or 'queued').
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_A_TOKEN">
**Tool Name:** Check a token

**Description**

```text wordWrap
Checks if a github app or oauth access token is valid for the specified client id and retrieves its details, typically to verify its active status and grants.
```


**Action Parameters**

<ParamField path="access_token" type="string" required={true}>
</ParamField>

<ParamField path="client_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_IF_A_GIST_IS_STARRED">
**Tool Name:** Check if a gist is starred

**Description**

```text wordWrap
Checks if a gist, identified by `gist id`, is starred by the authenticated user, returning an empty response (204) if starred, or a 404 error if not starred or not found.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_IF_A_PERSON_IS_FOLLOWED_BY_THE_AUTHENTICATED_USER">
**Tool Name:** Check if person is followed by authenticated user

**Description**

```text wordWrap
Checks if the authenticated github user follows a target github user; an http 204 status indicates the user is followed, while an http 404 status indicates the user is not followed or the target user does not exist.
```


**Action Parameters**

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

<Accordion title="GITHUB_CHECK_IF_A_PULL_REQUEST_HAS_BEEN_MERGED">
**Tool Name:** Check if pull request merged

**Description**

```text wordWrap
Checks if a specified github pull request has been merged, indicated by a 204 http status (merged) or 404 (not merged/found).
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_IF_A_REPOSITORY_IS_STARRED_BY_THE_AUTHENTICATED_USER">
**Tool Name:** Check if repo starred by auth user

**Description**

```text wordWrap
Use to determine if the authenticated user has starred a specific github repository, which is confirmed by an http 204 status (resulting in an empty dictionary in the response data); the action fails (e.g., http 404) if the repository is not starred or does not exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_IF_A_USER_CAN_BE_ASSIGNED">
**Tool Name:** Check if a user can be assigned

**Description**

```text wordWrap
Verifies if a github user can be assigned to issues in a repository; assignability is confirmed by an http 204 (no content) response, resulting in an empty 'data' field in the response.
```


**Action Parameters**

<ParamField path="assignee" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_IF_A_USER_CAN_BE_ASSIGNED_TO_A_ISSUE">
**Tool Name:** Check if a user can be assigned to an issue

**Description**

```text wordWrap
Checks if a specified github user can be assigned to a given issue within a repository.
```


**Action Parameters**

<ParamField path="assignee" type="string" required={true}>
</ParamField>

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_IF_A_USER_FOLLOWS_ANOTHER_USER">
**Tool Name:** Check if a user follows another user

**Description**

```text wordWrap
Checks if a github user `username` follows `target user`; returns a 204 http status if true, 404 if not or if users are invalid.
```


**Action Parameters**

<ParamField path="target_user" type="string" required={true}>
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

<Accordion title="GITHUB_CHECK_IF_A_USER_IS_A_REPOSITORY_COLLABORATOR">
**Tool Name:** Check if a user is a repository collaborator

**Description**

```text wordWrap
Checks if a user is a collaborator on a specified github repository, returning a 204 status if they are, or a 404 status if they are not or if the repository/user does not exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_CHECK_IF_A_USER_IS_BLOCKED_BY_AN_ORGANIZATION">
**Tool Name:** Check if a user is blocked by an organization

**Description**

```text wordWrap
Checks if a github user is blocked by an organization; a successful response (204 no content) indicates the user is blocked, while a 404 not found error indicates the user is not blocked.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_CHECK_IF_A_USER_IS_BLOCKED_BY_THE_AUTHENTICATED_USER">
**Tool Name:** Check if a user is blocked by the authenticated user

**Description**

```text wordWrap
Checks if the specified github user is blocked by the authenticated user; a 204 no content response indicates the user is blocked, while a 404 not found indicates they are not.
```


**Action Parameters**

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

<Accordion title="GITHUB_CHECK_PRIVATE_VULNERABILITY_REPORTING_STATUS">
**Tool Name:** Check private vulnerability reporting status

**Description**

```text wordWrap
Checks if private vulnerability reporting is enabled for the specified repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_TEAM_PERMISSIONS_FOR_A_PROJECT">
**Tool Name:** Check team permissions for a project

**Description**

```text wordWrap
Checks if a team has 'read', 'write', or 'admin' permissions for an organization's specific classic project, returning the project's details if access is confirmed.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="project_id" type="integer" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CHECK_TEAM_PERMISSIONS_FOR_A_REPOSITORY">
**Tool Name:** Check team permissions for a repository

**Description**

```text wordWrap
Checks a team's permissions for a specific repository within an organization, including permissions inherited from parent teams.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CLEAR_REPOSITORY_CACHE_BY_KEY">
**Tool Name:** Clear repository cache by key

**Description**

```text wordWrap
Deletes github actions caches from a repository matching a specific `key` and an optional git `ref`, used to manage storage or clear outdated/corrupted caches; the action succeeds even if no matching caches are found to delete.
```


**Action Parameters**

<ParamField path="key" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CLEAR_SELF_HOSTED_RUNNER_ORG_LABELS">
**Tool Name:** Clear self-hosted runner org labels

**Description**

```text wordWrap
Removes all custom labels from a self-hosted runner for an organization; default labels (e.g., 'self-hosted', 'linux', 'x64') will remain.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_COMPARE_TWO_COMMITS">
**Tool Name:** Compare two commits

**Description**

```text wordWrap
Compares two commit points (commits, branches, tags, or shas) within a repository or across forks, using `base...head` or `owner:ref...owner:ref` format for the `basehead` parameter.
```


**Action Parameters**

<ParamField path="basehead" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CONFIGURE_JITRUNNER_FOR_ORG">
**Tool Name:** Configure JIT runner for an org

**Description**

```text wordWrap
Generates a jit configuration for a github organization's new self-hosted runner to run a single job then unregister; the runner group id must exist.
```


**Action Parameters**

<ParamField path="labels" type="array" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="runner_group_id" type="integer" required={true}>
</ParamField>

<ParamField path="work_folder" type="string" default="_work">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CONFIGURE_OIDCSUBJECT_CLAIM_TEMPLATE">
**Tool Name:** Configure OIDC subject claim template

**Description**

```text wordWrap
Sets or updates the oidc subject claim customization template for an existing github organization by specifying which claims (e.g., 'repo', 'actor') form the oidc token's subject (`sub`).
```


**Action Parameters**

<ParamField path="include_claim_keys" type="array" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CONVERT_AN_ORGANIZATION_MEMBER_TO_OUTSIDE_COLLABORATOR">
**Tool Name:** Convert an organization member to outside collaborator

**Description**

```text wordWrap
Converts an existing organization member, who is not an owner, to an outside collaborator, restricting their access to explicitly granted repositories.
```


**Action Parameters**

<ParamField path="async" type="boolean">
</ParamField>

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_CREATE_A_BLOB">
**Tool Name:** Create a blob

**Description**

```text wordWrap
Creates a git blob in a repository, requiring content and encoding ('utf-8' or 'base64').
```


**Action Parameters**

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="encoding" type="string" default="utf-8">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_CHECK_RUN">
**Tool Name:** Create a check run

**Description**

```text wordWrap
Creates a new check run for a specific commit in a repository, used by external services to report status, detailed feedback, annotations, and images directly within the github ui.
```


**Action Parameters**

<ParamField path="actions" type="array">
</ParamField>

<ParamField path="completed_at" type="string">
</ParamField>

<ParamField path="conclusion" type="string">
</ParamField>

<ParamField path="details_url" type="string">
</ParamField>

<ParamField path="external_id" type="string">
</ParamField>

<ParamField path="head_sha" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="output__annotations" type="array">
</ParamField>

<ParamField path="output__images" type="array">
</ParamField>

<ParamField path="output__summary" type="string">
</ParamField>

<ParamField path="output__text" type="string">
</ParamField>

<ParamField path="output__title" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="started_at" type="string">
</ParamField>

<ParamField path="status" type="string" default="queued">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_CHECK_SUITE">
**Tool Name:** Create a check suite

**Description**

```text wordWrap
Creates a new check suite for a specific commit (`head sha`) in an original repository (not a fork); github dispatches a `check suite` webhook event with the `requested` action upon success.
```


**Action Parameters**

<ParamField path="head_sha" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_CODESPACE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Create a codespace for the authenticated user

**Description**

```text wordWrap
Creates a github codespace for the authenticated user, requiring a json request body with either `repository id` (integer) or a `pull request` object (containing `pull request number` (integer) and `repository id` (integer)).
```


**Action Parameters**

<ParamField path="pull_request" type="object">
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repository_id" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_CODESPACE_FROM_A_PULL_REQUEST">
**Tool Name:** Create a codespace from a pull request

**Description**

```text wordWrap
Creates a github codespace for an open pull request in a codespaces-enabled repository, with options to customize its configuration.
```


**Action Parameters**

<ParamField path="client_ip" type="string">
</ParamField>

<ParamField path="devcontainer_path" type="string">
</ParamField>

<ParamField path="display_name" type="string">
</ParamField>

<ParamField path="geo" type="string">
</ParamField>

<ParamField path="idle_timeout_minutes" type="integer">
</ParamField>

<ParamField path="location" type="string">
</ParamField>

<ParamField path="machine" type="string">
</ParamField>

<ParamField path="multi_repo_permissions_opt_out" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="retention_period_minutes" type="integer">
</ParamField>

<ParamField path="working_directory" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_CODESPACE_IN_A_REPOSITORY">
**Tool Name:** Create a codespace in a repository

**Description**

```text wordWrap
Creates a github codespace for the authenticated user in a specified repository, which must be accessible and use a valid `devcontainer.json` if `devcontainer path` is specified.
```


**Action Parameters**

<ParamField path="client_ip" type="string">
</ParamField>

<ParamField path="devcontainer_path" type="string">
</ParamField>

<ParamField path="display_name" type="string">
</ParamField>

<ParamField path="geo" type="string">
</ParamField>

<ParamField path="idle_timeout_minutes" type="integer">
</ParamField>

<ParamField path="location" type="string">
</ParamField>

<ParamField path="machine" type="string">
</ParamField>

<ParamField path="multi_repo_permissions_opt_out" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="retention_period_minutes" type="integer">
</ParamField>

<ParamField path="working_directory" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_COMMIT">
**Tool Name:** Create a commit

**Description**

```text wordWrap
Creates a new commit in a github repository; the `tree` sha and any `parents` shas must already exist in the repository.
```


**Action Parameters**

<ParamField path="author__date" type="string">
</ParamField>

<ParamField path="author__email" type="string">
</ParamField>

<ParamField path="author__name" type="string">
</ParamField>

<ParamField path="committer__date" type="string">
</ParamField>

<ParamField path="committer__email" type="string">
</ParamField>

<ParamField path="committer__name" type="string">
</ParamField>

<ParamField path="message" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="parents" type="array">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="signature" type="string">
</ParamField>

<ParamField path="tree" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_COMMIT_COMMENT">
**Tool Name:** Create a commit comment

**Description**

```text wordWrap
Creates a comment on a specific commit, or on a specific line if `path` and `position` are provided.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="commit_sha" type="string" required={true}>
</ParamField>

<ParamField path="line" type="integer">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="path" type="string">
</ParamField>

<ParamField path="position" type="integer">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_COMMIT_STATUS">
**Tool Name:** Create a commit status

**Description**

```text wordWrap
Sets a commit's status (e.g., error, failure, pending, success from ci/cd) for a given sha; max 1000 statuses per sha/context.
```


**Action Parameters**

<ParamField path="context" type="string" default="default">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string" required={true}>
</ParamField>

<ParamField path="target_url" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_CUSTOM_ORGANIZATION_ROLE">
**Tool Name:** Create a custom organization role

**Description**

```text wordWrap
Creates a custom role with defined permissions within a github organization.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="permissions" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_DEPLOY_KEY">
**Tool Name:** Create a deploy key

**Description**

```text wordWrap
Creates a deploy key for a repository; the repository must exist and be accessible, and the provided key must be a valid public ssh key.
```


**Action Parameters**

<ParamField path="key" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="read_only" type="boolean">
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_CREATE_A_DEPLOYMENT">
**Tool Name:** Create a deployment

**Description**

```text wordWrap
Creates a github deployment for an existing repository, targeting a specific ref (branch, tag, or sha) that must also exist within the repository.
```


**Action Parameters**

<ParamField path="auto_merge" type="boolean" default="True">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="environment" type="string" default="production">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="payload" type="string">
</ParamField>

<ParamField path="production_environment" type="boolean">
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="required_contexts" type="array">
</ParamField>

<ParamField path="task" type="string" default="deploy">
</ParamField>

<ParamField path="transient_environment" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_DEPLOYMENT_BRANCH_POLICY">
**Tool Name:** Create a deployment branch policy

**Description**

```text wordWrap
Creates a deployment branch or tag policy for an existing environment in a github repository, using a ruby file.fnmatch pattern (where `*` doesn't match `/`) to specify which branches or tags are deployable.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_CREATE_A_DEPLOYMENT_STATUS">
**Tool Name:** Create a deployment status

**Description**

```text wordWrap
Creates a status for an existing deployment, updating its operational state, associated urls, and description.
```


**Action Parameters**

<ParamField path="auto_inactive" type="boolean">
</ParamField>

<ParamField path="deployment_id" type="integer" required={true}>
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="environment" type="string">
</ParamField>

<ParamField path="environment_url" type="string">
</ParamField>

<ParamField path="log_url" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string" required={true}>
</ParamField>

<ParamField path="target_url" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_DISCUSSION">
**Tool Name:** Create a discussion

**Description**

```text wordWrap
Creates a new discussion post on a specific team's page within an organization.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
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

<Accordion title="GITHUB_CREATE_A_DISCUSSION_COMMENT">
**Tool Name:** Create a discussion comment

**Description**

```text wordWrap
Creates a new comment on an existing team discussion within a github organization.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_FORK">
**Tool Name:** Create a fork

**Description**

```text wordWrap
Creates a fork of an accessible repository, optionally into a specific organization, with a new name, or copying only the default branch.
```


**Action Parameters**

<ParamField path="default_branch_only" type="boolean">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="organization" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_GIST">
**Tool Name:** Create a gist

**Description**

```text wordWrap
Creates a new gist on github with provided files, an optional description, and public/secret visibility.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="files" type="object" required={true}>
</ParamField>

<ParamField path="public" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_GIST_COMMENT">
**Tool Name:** Create a gist comment

**Description**

```text wordWrap
Creates a new comment on a specified github gist.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_GITHUB_APP_FROM_A_MANIFEST">
**Tool Name:** Create a GitHub App from a manifest

**Description**

```text wordWrap
Use this action to finalize a github app's creation by exchanging the temporary `code` (received as a url parameter during the app manifest setup redirection) for the app's full configuration details.
```


**Action Parameters**

<ParamField path="code" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_GITHUB_PAGES_DEPLOYMENT">
**Tool Name:** Create a github pages deployment

**Description**

```text wordWrap
Creates a github pages deployment for a repository using a specified artifact and oidc token, provided github pages is enabled and the artifact (containing static assets) is accessible.
```


**Action Parameters**

<ParamField path="artifact_id" type="integer">
</ParamField>

<ParamField path="artifact_url" type="string">
</ParamField>

<ParamField path="environment" type="string" default="github-pages">
</ParamField>

<ParamField path="oidc_token" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pages_build_version" type="string" default="GITHUB_SHA">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_GITHUB_PAGES_SITE">
**Tool Name:** Create a github pages site

**Description**

```text wordWrap
Configures or updates github pages for a repository, setting build type and source; ensure a pages workflow exists for 'workflow' `build type`, or `source branch` exists for 'legacy' or unspecified `build type`.
```


**Action Parameters**

<ParamField path="build_type" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="source__branch" type="string">
</ParamField>

<ParamField path="source__path" type="string" default="/">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_LABEL">
**Tool Name:** Create a label

**Description**

```text wordWrap
Creates a new label in a specified github repository, provided the repository exists and the user has write permissions.
```


**Action Parameters**

<ParamField path="color" type="string">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_MILESTONE">
**Tool Name:** Create a milestone

**Description**

```text wordWrap
Creates a milestone in a github repository for tracking progress on issues or pull requests; requires repository existence and user write permissions.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="due_on" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string" default="open">
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

<Accordion title="GITHUB_CREATE_AN_AUTOLINK_REFERENCE_FOR_A_REPOSITORY">
**Tool Name:** Create an autolink reference for a repository

**Description**

```text wordWrap
Creates a repository autolink to automatically convert text references (e.g., 'ticket-123') into hyperlinks, using a unique `key prefix` and a `url template` that includes `<num>`.
```


**Action Parameters**

<ParamField path="is_alphanumeric" type="boolean" default="True">
</ParamField>

<ParamField path="key_prefix" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="url_template" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_AN_ENVIRONMENT_VARIABLE">
**Tool Name:** Create an environment variable

**Description**

```text wordWrap
Creates an encrypted environment variable for a pre-existing environment within a github repository; will fail if the variable name already exists.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="value" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_AN_ISSUE">
**Tool Name:** Create an issue

**Description**

```text wordWrap
Creates a new issue in a github repository, requiring the repository to exist and have issues enabled; specific fields like assignees, milestone, or labels may require push access.
```


**Action Parameters**

<ParamField path="assignee" type="string">
</ParamField>

<ParamField path="assignees" type="array">
</ParamField>

<ParamField path="body" type="string">
</ParamField>

<ParamField path="labels" type="array">
</ParamField>

<ParamField path="milestone" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_CREATE_AN_ISSUE_COMMENT">
**Tool Name:** Create an issue comment

**Description**

```text wordWrap
Creates a new comment on an existing github issue or pull request within the specified repository.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_AN_ORGANIZATION_PROJECT">
**Tool Name:** Create an organization project

**Description**

```text wordWrap
Creates a new classic project board within a specified github organization.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_AN_ORGANIZATION_REPOSITORY">
**Tool Name:** Create an organization repository

**Description**

```text wordWrap
Creates a new repository within a specified github organization, with options for detailed configuration including visibility, features, merge strategies, initial commit, and templates.
```


**Action Parameters**

<ParamField path="allow_auto_merge" type="boolean">
</ParamField>

<ParamField path="allow_merge_commit" type="boolean" default="True">
</ParamField>

<ParamField path="allow_rebase_merge" type="boolean" default="True">
</ParamField>

<ParamField path="allow_squash_merge" type="boolean" default="True">
</ParamField>

<ParamField path="auto_init" type="boolean">
</ParamField>

<ParamField path="custom_properties" type="object">
</ParamField>

<ParamField path="delete_branch_on_merge" type="boolean">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="gitignore_template" type="string">
</ParamField>

<ParamField path="has_downloads" type="boolean" default="True">
</ParamField>

<ParamField path="has_issues" type="boolean" default="True">
</ParamField>

<ParamField path="has_projects" type="boolean" default="True">
</ParamField>

<ParamField path="has_wiki" type="boolean" default="True">
</ParamField>

<ParamField path="homepage" type="string">
</ParamField>

<ParamField path="is_template" type="boolean">
</ParamField>

<ParamField path="license_template" type="string">
</ParamField>

<ParamField path="merge_commit_message" type="string">
</ParamField>

<ParamField path="merge_commit_title" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>

<ParamField path="squash_merge_commit_message" type="string">
</ParamField>

<ParamField path="squash_merge_commit_title" type="string">
</ParamField>

<ParamField path="team_id" type="integer">
</ParamField>

<ParamField path="use_squash_pr_title_as_default" type="boolean">
</ParamField>

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

<Accordion title="GITHUB_CREATE_AN_ORGANIZATION_VARIABLE">
**Tool Name:** Create an organization variable

**Description**

```text wordWrap
Creates a new, uniquely named github actions variable for an organization, with configurable repository access visibility (all, private, or selected).
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array">
</ParamField>

<ParamField path="value" type="string" required={true}>
</ParamField>

<ParamField path="visibility" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_AN_ORGANIZATION_WEBHOOK">
**Tool Name:** Create an organization webhook

**Description**

```text wordWrap
Creates a webhook for a github organization to deliver event notifications to a configured url.
```


**Action Parameters**

<ParamField path="active" type="boolean" default="True">
</ParamField>

<ParamField path="config__content__type" type="string">
</ParamField>

<ParamField path="config__insecure__ssl" type="string">
</ParamField>

<ParamField path="config__password" type="string">
</ParamField>

<ParamField path="config__secret" type="string">
</ParamField>

<ParamField path="config__url" type="string">
</ParamField>

<ParamField path="config__username" type="string">
</ParamField>

<ParamField path="events" type="array" default="['push']">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_PROJECT_CARD">
**Tool Name:** Create a project card

**Description**

```text wordWrap
Creates a project card in a github project column; the request body must contain either a `note` for a note-only card, or both `content id` (id of an issue or pull request) and `content type` (e.g., 'issue', 'pullrequest').
```


**Action Parameters**

<ParamField path="column_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_PROJECT_COLUMN">
**Tool Name:** Create a project column

**Description**

```text wordWrap
Creates a new column in a github project (classic).
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="project_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_PULL_REQUEST">
**Tool Name:** Create a pull request

**Description**

```text wordWrap
Creates a pull request in a github repository, requiring existing `base` and `head` branches; `title` or `issue` must be provided.
```


**Action Parameters**

<ParamField path="base" type="string" required={true}>
</ParamField>

<ParamField path="body" type="string">
</ParamField>

<ParamField path="draft" type="boolean">
</ParamField>

<ParamField path="head" type="string" required={true}>
</ParamField>

<ParamField path="head_repo" type="string">
</ParamField>

<ParamField path="issue" type="integer">
</ParamField>

<ParamField path="maintainer_can_modify" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_CREATE_A_REFERENCE">
**Tool Name:** Create a reference

**Description**

```text wordWrap
Creates a git reference (e.g., a branch or tag) in a repository; the repository must not be empty prior to this operation.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REGISTRATION_TOKEN_FOR_AN_ORGANIZATION">
**Tool Name:** Create a registration token for an organization

**Description**

```text wordWrap
Generates a temporary (one-hour) registration token to add a new self-hosted runner to an organization for github actions.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REGISTRATION_TOKEN_FOR_A_REPOSITORY">
**Tool Name:** Create a registration token for a repository

**Description**

```text wordWrap
Generates a time-limited token required to register a new self-hosted runner with a specific repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_RELEASE">
**Tool Name:** Create a release

**Description**

```text wordWrap
Creates a release in a github repository for a specified tag; the tag must be unique for published releases, and if a `discussion category name` is given, it must already exist.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="discussion_category_name" type="string">
</ParamField>

<ParamField path="draft" type="boolean">
</ParamField>

<ParamField path="generate_release_notes" type="boolean">
</ParamField>

<ParamField path="make_latest" type="string" default="true">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="prerelease" type="boolean">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tag_name" type="string" required={true}>
</ParamField>

<ParamField path="target_commitish" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REMOVE_TOKEN_FOR_AN_ORGANIZATION">
**Tool Name:** Create a remove token for an organization

**Description**

```text wordWrap
Generates a token, valid for one hour, to authenticate removing a self-hosted runner from an organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REMOVE_TOKEN_FOR_A_REPOSITORY">
**Tool Name:** Create a remove token for a repository

**Description**

```text wordWrap
Generates a temporary (one-hour validity) token required to unregister and remove a self-hosted runner from a repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REPLY_FOR_A_REVIEW_COMMENT">
**Tool Name:** Create a reply for a review comment

**Description**

```text wordWrap
Posts a reply to a specific review comment on a github pull request, requiring the repository, pull request, and original comment to exist, and a non-empty reply body.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REPOSITORY_DISPATCH_EVENT">
**Tool Name:** Create a repository dispatch event

**Description**

```text wordWrap
Triggers a github actions workflow or a webhook on a repository by creating a repository dispatch event, allowing programmatic triggering of workflows based on events outside of github.
```


**Action Parameters**

<ParamField path="client_payload" type="object">
</ParamField>

<ParamField path="event_type" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Create a repository for the authenticated user

**Description**

```text wordWrap
Creates a new repository for the authenticated user, optionally within an organization if `team id` is specified.
```


**Action Parameters**

<ParamField path="allow_auto_merge" type="boolean">
</ParamField>

<ParamField path="allow_merge_commit" type="boolean" default="True">
</ParamField>

<ParamField path="allow_rebase_merge" type="boolean" default="True">
</ParamField>

<ParamField path="allow_squash_merge" type="boolean" default="True">
</ParamField>

<ParamField path="auto_init" type="boolean">
</ParamField>

<ParamField path="delete_branch_on_merge" type="boolean">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="gitignore_template" type="string">
</ParamField>

<ParamField path="has_discussions" type="boolean">
</ParamField>

<ParamField path="has_downloads" type="boolean" default="True">
</ParamField>

<ParamField path="has_issues" type="boolean" default="True">
</ParamField>

<ParamField path="has_projects" type="boolean" default="True">
</ParamField>

<ParamField path="has_wiki" type="boolean" default="True">
</ParamField>

<ParamField path="homepage" type="string">
</ParamField>

<ParamField path="is_template" type="boolean">
</ParamField>

<ParamField path="license_template" type="string">
</ParamField>

<ParamField path="merge_commit_message" type="string">
</ParamField>

<ParamField path="merge_commit_title" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>

<ParamField path="squash_merge_commit_message" type="string">
</ParamField>

<ParamField path="squash_merge_commit_title" type="string">
</ParamField>

<ParamField path="team_id" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REPOSITORY_FROM_AN_UNPUBLISHED_CODESPACE">
**Tool Name:** Create a repository from an unpublished codespace

**Description**

```text wordWrap
Publishes the specified codespace to a new repository, using the codespace's current state as the initial commit.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
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

<Accordion title="GITHUB_CREATE_A_REPOSITORY_PROJECT">
**Tool Name:** Create a repository project

**Description**

```text wordWrap
Creates a new classic project board within a specified repository; classic projects must be enabled for the target repository.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REPOSITORY_RULESET">
**Tool Name:** Create a repository ruleset

**Description**

```text wordWrap
Creates a uniquely named ruleset for a repository, defining rules for branches or tags with specified enforcement, conditions, and bypass actors.
```


**Action Parameters**

<ParamField path="bypass_actors" type="array">
</ParamField>

<ParamField path="conditions__ref__name__exclude" type="array">
</ParamField>

<ParamField path="conditions__ref__name__include" type="array">
</ParamField>

<ParamField path="enforcement" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="rules" type="array">
</ParamField>

<ParamField path="target" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REPOSITORY_USING_A_TEMPLATE">
**Tool Name:** Create a repository using a template

**Description**

```text wordWrap
Creates a new repository from an existing template repository; the authenticated user must have access to the template and, if creating in an organization, repository creation permissions within it.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="include_all_branches" type="boolean">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string">
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>

<ParamField path="template_owner" type="string" required={true}>
</ParamField>

<ParamField path="template_repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REPOSITORY_VARIABLE">
**Tool Name:** Create a repository variable

**Description**

```text wordWrap
Creates a new, unencrypted variable in a repository for github actions workflows; fails if a variable with the same name already exists.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="value" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REPOSITORY_WEBHOOK">
**Tool Name:** Create a repository webhook

**Description**

```text wordWrap
Creates a webhook for a specified repository; requires admin permissions on the repository.
```


**Action Parameters**

<ParamField path="active" type="boolean" default="True">
</ParamField>

<ParamField path="config__content__type" type="string">
</ParamField>

<ParamField path="config__insecure__ssl" type="string">
</ParamField>

<ParamField path="config__secret" type="string">
</ParamField>

<ParamField path="config__url" type="string">
</ParamField>

<ParamField path="events" type="array" default="['push']">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REVIEW_COMMENT_FOR_A_PULL_REQUEST">
**Tool Name:** Create a review comment for a pull request

**Description**

```text wordWrap
Creates a review comment on a pull request's diff, targeting a specific line, range of lines, an entire file, or replying to an existing comment.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="commit_id" type="string" required={true}>
</ParamField>

<ParamField path="in_reply_to" type="integer">
</ParamField>

<ParamField path="line" type="integer">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>

<ParamField path="position" type="integer">
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="side" type="string">
</ParamField>

<ParamField path="start_line" type="integer">
</ParamField>

<ParamField path="start_side" type="string">
</ParamField>

<ParamField path="subject_type" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_REVIEW_FOR_A_PULL_REQUEST">
**Tool Name:** Create a review for a pull request

**Description**

```text wordWrap
Creates a pull request review, allowing approval, change requests, or comments; `body` is required if `event` is `request changes` or `comment`, and omitting `event` makes the review `pending`.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="comments" type="array">
</ParamField>

<ParamField path="commit_id" type="string">
</ParamField>

<ParamField path="event" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_SCOPED_ACCESS_TOKEN">
**Tool Name:** Create a scoped access token

**Description**

```text wordWrap
Exchanges a user-to-server token for a new, fine-grained scoped access token for a github app, requiring `client id`, `access token`, either `target` or `target id`, and at least one permission; for repository-specific scoping, provide either `repositories` (names) or `repository ids` (ids), but not both.
```


**Action Parameters**

<ParamField path="access_token" type="string" required={true}>
</ParamField>

<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="permissions__actions" type="string">
</ParamField>

<ParamField path="permissions__administration" type="string">
</ParamField>

<ParamField path="permissions__checks" type="string">
</ParamField>

<ParamField path="permissions__codespaces" type="string">
</ParamField>

<ParamField path="permissions__contents" type="string">
</ParamField>

<ParamField path="permissions__dependabot__secrets" type="string">
</ParamField>

<ParamField path="permissions__deployments" type="string">
</ParamField>

<ParamField path="permissions__email__addresses" type="string">
</ParamField>

<ParamField path="permissions__environments" type="string">
</ParamField>

<ParamField path="permissions__followers" type="string">
</ParamField>

<ParamField path="permissions__git__ssh__keys" type="string">
</ParamField>

<ParamField path="permissions__gpg__keys" type="string">
</ParamField>

<ParamField path="permissions__interaction__limits" type="string">
</ParamField>

<ParamField path="permissions__issues" type="string">
</ParamField>

<ParamField path="permissions__members" type="string">
</ParamField>

<ParamField path="permissions__metadata" type="string">
</ParamField>

<ParamField path="permissions__organization__administration" type="string">
</ParamField>

<ParamField path="permissions__organization__announcement__banners" type="string">
</ParamField>

<ParamField path="permissions__organization__copilot__seat__management" type="string">
</ParamField>

<ParamField path="permissions__organization__custom__org__roles" type="string">
</ParamField>

<ParamField path="permissions__organization__custom__properties" type="string">
</ParamField>

<ParamField path="permissions__organization__custom__roles" type="string">
</ParamField>

<ParamField path="permissions__organization__events" type="string">
</ParamField>

<ParamField path="permissions__organization__hooks" type="string">
</ParamField>

<ParamField path="permissions__organization__packages" type="string">
</ParamField>

<ParamField path="permissions__organization__personal__access__token__requests" type="string">
</ParamField>

<ParamField path="permissions__organization__personal__access__tokens" type="string">
</ParamField>

<ParamField path="permissions__organization__plan" type="string">
</ParamField>

<ParamField path="permissions__organization__projects" type="string">
</ParamField>

<ParamField path="permissions__organization__secrets" type="string">
</ParamField>

<ParamField path="permissions__organization__self__hosted__runners" type="string">
</ParamField>

<ParamField path="permissions__organization__user__blocking" type="string">
</ParamField>

<ParamField path="permissions__packages" type="string">
</ParamField>

<ParamField path="permissions__pages" type="string">
</ParamField>

<ParamField path="permissions__profile" type="string">
</ParamField>

<ParamField path="permissions__pull__requests" type="string">
</ParamField>

<ParamField path="permissions__repository__custom__properties" type="string">
</ParamField>

<ParamField path="permissions__repository__hooks" type="string">
</ParamField>

<ParamField path="permissions__repository__projects" type="string">
</ParamField>

<ParamField path="permissions__secret__scanning__alerts" type="string">
</ParamField>

<ParamField path="permissions__secrets" type="string">
</ParamField>

<ParamField path="permissions__security__events" type="string">
</ParamField>

<ParamField path="permissions__single__file" type="string">
</ParamField>

<ParamField path="permissions__starring" type="string">
</ParamField>

<ParamField path="permissions__statuses" type="string">
</ParamField>

<ParamField path="permissions__team__discussions" type="string">
</ParamField>

<ParamField path="permissions__vulnerability__alerts" type="string">
</ParamField>

<ParamField path="permissions__workflows" type="string">
</ParamField>

<ParamField path="repositories" type="array">
</ParamField>

<ParamField path="repository_ids" type="array">
</ParamField>

<ParamField path="target" type="string">
</ParamField>

<ParamField path="target_id" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_SNAPSHOT_OF_DEPENDENCIES_FOR_A_REPOSITORY">
**Tool Name:** Create a dependency snapshot

**Description**

```text wordWrap
Creates a snapshot of a repository's dependencies to populate the github dependency graph and enable security alerts; `sha` must be a 40-character commit id, `ref` a fully qualified git reference (e.g., `refs/heads/main`), and `scanned` an iso 8601 timestamp.
```


**Action Parameters**

<ParamField path="detector__name" type="string">
</ParamField>

<ParamField path="detector__url" type="string">
</ParamField>

<ParamField path="detector__version" type="string">
</ParamField>

<ParamField path="job__correlator" type="string">
</ParamField>

<ParamField path="job__html__url" type="string">
</ParamField>

<ParamField path="job__id" type="string">
</ParamField>

<ParamField path="manifests" type="object">
</ParamField>

<ParamField path="metadata" type="object">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="scanned" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string" required={true}>
</ParamField>

<ParamField path="version" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_TAG_OBJECT">
**Tool Name:** Create a tag object

**Description**

```text wordWrap
Creates an annotated git tag object in a repository, pointing to an existing git object (commit, tree, or blob) defined by its sha and ensuring the `type` field correctly specifies the object's type.
```


**Action Parameters**

<ParamField path="message" type="string" required={true}>
</ParamField>

<ParamField path="object" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tag" type="string" required={true}>
</ParamField>

<ParamField path="tagger__date" type="string">
</ParamField>

<ParamField path="tagger__email" type="string">
</ParamField>

<ParamField path="tagger__name" type="string">
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

<Accordion title="GITHUB_CREATE_A_TAG_PROTECTION_STATE_FOR_A_REPOSITORY">
**Tool Name:** Create a tag protection state for a repository

**Description**

```text wordWrap
Creates a tag protection rule for a repository using a glob pattern; note: tag protections are deprecated (sunset august 30, 2024), migrate to repository rulesets.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pattern" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_TEAM">
**Tool Name:** Create a team

**Description**

```text wordWrap
Creates a new team in an organization, optionally with maintainers, repositories, specific privacy, notification settings, or a parent team; if `parent team id` is given, `privacy` must be 'closed'.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="maintainers" type="array">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="notification_setting" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="parent_team_id" type="integer">
</ParamField>

<ParamField path="permission" type="string" default="pull">
</ParamField>

<ParamField path="privacy" type="string">
</ParamField>

<ParamField path="repo_names" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_TEMPORARY_PRIVATE_FORK">
**Tool Name:** Create a temporary private fork

**Description**

```text wordWrap
Creates a temporary private fork of the specified repository to address a security vulnerability, linking the fork to a ghsa id that must be specifically associated with this repository; the fork may take up to 5 minutes to become accessible.
```


**Action Parameters**

<ParamField path="ghsa_id" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_TREE">
**Tool Name:** Create a tree

**Description**

```text wordWrap
Creates a new git tree object in a repository, defining file/directory structure by specifying tree entries, optionally building on a `base tree` sha; all provided shas must be valid.
```


**Action Parameters**

<ParamField path="base_tree" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tree" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_A_USER_PROJECT">
**Tool Name:** Create a user project

**Description**

```text wordWrap
Creates a new github project board for the authenticated user to organize and track issues, pull requests, and notes.
```


**Action Parameters**

<ParamField path="body" type="string">
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

<Accordion title="GITHUB_CREATE_A_WORKFLOW_DISPATCH_EVENT">
**Tool Name:** Create a workflow dispatch event

**Description**

```text wordWrap
Manually triggers a github actions workflow identified by `workflow id` at a given `ref`, if the workflow is configured to accept `workflow dispatch` events.
```


**Action Parameters**

<ParamField path="inputs" type="object">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="workflow_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_COMMIT_SIGNATURE_PROTECTION">
**Tool Name:** Create commit signature protection

**Description**

```text wordWrap
Enables commit signature protection for a specified branch, requiring all new commits to be signed.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_DEPLOYMENT_PROTECTION_RULE">
**Tool Name:** Create a custom deployment protection rule on an environment

**Description**

```text wordWrap
Enables a custom deployment protection rule for an existing environment in a repository by linking a configured github app (via `integration id`) to control deployments.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="integration_id" type="integer">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_JIT_RUNNER_CONFIG">
**Tool Name:** Create JIT runner config for repo

**Description**

```text wordWrap
Generates a temporary just-in-time (jit) configuration for a new self-hosted github actions runner for a repository; any specified non-default `runner group id` must be an existing runner group accessible by the repository.
```


**Action Parameters**

<ParamField path="labels" type="array" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="runner_group_id" type="integer" required={true}>
</ParamField>

<ParamField path="work_folder" type="string" default="_work">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_A_CUSTOM_PROPERTY_FOR_AN_ORGANIZATION">
**Tool Name:** Create or update a custom property for an organization

**Description**

```text wordWrap
Creates a new custom property (name must be unique for creation) or updates an existing one for an organization to define metadata for its repositories.
```


**Action Parameters**

<ParamField path="allowed_values" type="array">
</ParamField>

<ParamField path="custom_property_name" type="string" required={true}>
</ParamField>

<ParamField path="default_value" type="string">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="required" type="boolean">
</ParamField>

<ParamField path="value_type" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_AN_ENVIRONMENT">
**Tool Name:** Create or update an environment

**Description**

```text wordWrap
Creates a new environment or updates an existing one in a github repository, allowing configuration of deployment protection rules such as wait timers and reviewers; ensure `environment name` is url-encoded if it contains special characters.
```


**Action Parameters**

<ParamField path="deployment__branch__policy__custom__branch__policies" type="boolean">
</ParamField>

<ParamField path="deployment__branch__policy__protected__branches" type="boolean">
</ParamField>

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="prevent_self_review" type="boolean">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="reviewers" type="array">
</ParamField>

<ParamField path="wait_timer" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_AN_ENVIRONMENT_SECRET">
**Tool Name:** Create or update an environment secret

**Description**

```text wordWrap
Creates or updates an environment secret with an `encrypted value` that was encrypted using the public key identified by `key id` for the specified environment.
```


**Action Parameters**

<ParamField path="encrypted_value" type="string" required={true}>
</ParamField>

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="key_id" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_AN_ORGANIZATION_SECRET">
**Tool Name:** Create or update an organization secret

**Description**

```text wordWrap
Creates or updates an organization secret for github actions, requiring its value to be pre-encrypted via libsodium using the organization's public key.
```


**Action Parameters**

<ParamField path="encrypted_value" type="string">
</ParamField>

<ParamField path="key_id" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array">
</ParamField>

<ParamField path="visibility" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_A_REPOSITORY_SECRET">
**Tool Name:** Create or update a repository secret

**Description**

```text wordWrap
Creates or updates a github actions secret within a specific repository; use `encrypted value` and `key id` to set or change its value.
```


**Action Parameters**

<ParamField path="encrypted_value" type="string">
</ParamField>

<ParamField path="key_id" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_A_SECRET_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Create or update a secret for the authenticated user

**Description**

```text wordWrap
Creates or updates a codespaces secret for the authenticated user; `encrypted value` must be encrypted with the public key (id: `key id`) from github's 'get public key for the authenticated user' endpoint.
```


**Action Parameters**

<ParamField path="encrypted_value" type="string">
</ParamField>

<ParamField path="key_id" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_CUSTOM_PROPERTIES_FOR_AN_ORGANIZATION">
**Tool Name:** Create or update custom properties for an organization

**Description**

```text wordWrap
Creates new custom property schemas or updates existing ones in bulk for a specified organization; each property definition must include `property name` and `value type`.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="properties" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_CUSTOM_PROPERTY_VALUES_FOR_A_REPOSITORY">
**Tool Name:** Create or update repository custom property values

**Description**

```text wordWrap
Creates or updates up to 30 custom property values for a repository; custom properties must be predefined at the organization or repository level, and setting a property's value to `null` removes it.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="properties" type="array" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS">
**Tool Name:** Create or update file contents

**Description**

```text wordWrap
Creates a new file or updates an existing file in a github repository; provide `sha` to update an existing file, otherwise a new file is created.
```


**Action Parameters**

<ParamField path="author__date" type="string">
</ParamField>

<ParamField path="author__email" type="string">
</ParamField>

<ParamField path="author__name" type="string">
</ParamField>

<ParamField path="branch" type="string">
</ParamField>

<ParamField path="committer__date" type="string">
</ParamField>

<ParamField path="committer__email" type="string">
</ParamField>

<ParamField path="committer__name" type="string">
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="message" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_OR_UPDATE_REPO_SECRET_WITH_ENCRYPTED_VALUE">
**Tool Name:** Create or update repo secret with encrypted value

**Description**

```text wordWrap
Creates or updates a dependabot secret in a repository using an `encrypted value` (pre-encrypted with libsodium using the repository's dependabot public key) and its corresponding `key id`.
```


**Action Parameters**

<ParamField path="encrypted_value" type="string">
</ParamField>

<ParamField path="key_id" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_REACTION_FOR_A_COMMIT_COMMENT">
**Tool Name:** Create reaction for a commit comment

**Description**

```text wordWrap
Creates an emoji reaction for a commit comment; if the user has already reacted with the same content, details of the existing reaction are returned.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_REACTION_FOR_AN_ISSUE">
**Tool Name:** Create reaction for an issue

**Description**

```text wordWrap
Creates a reaction for a specified issue within a github repository.
```


**Action Parameters**

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_REACTION_FOR_AN_ISSUE_COMMENT">
**Tool Name:** Create reaction for an issue comment

**Description**

```text wordWrap
Creates a reaction for a specific comment on an issue within a github repository.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_REACTION_FOR_A_PULL_REQUEST_REVIEW_COMMENT">
**Tool Name:** Create reaction for a pull request review comment

**Description**

```text wordWrap
Adds a specified reaction to a pull request review comment within a github repository.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_REACTION_FOR_A_RELEASE">
**Tool Name:** Create reaction for a release

**Description**

```text wordWrap
Creates an emoji reaction for a specific, existing release in a github repository.
```


**Action Parameters**

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="release_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_REACTION_FOR_A_TEAM_DISCUSSION">
**Tool Name:** Create reaction for a team discussion

**Description**

```text wordWrap
Creates a reaction for a team discussion within a github organization.
```


**Action Parameters**

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_REACTION_FOR_A_TEAM_DISCUSSION_COMMENT">
**Tool Name:** Create reaction for a team discussion comment

**Description**

```text wordWrap
Adds a reaction to a team discussion comment, requiring the specified organization, team, discussion, and comment to exist.
```


**Action Parameters**

<ParamField path="comment_number" type="integer" required={true}>
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CREATE_UPDATE_ORG_SECRET_WITH_LIB_SODIUM">
**Tool Name:** Create or Update Organization Secret with LibSodium

**Description**

```text wordWrap
Creates or updates a dependabot organization secret, requiring the secret value to be pre-encrypted with libsodium using the organization's public key obtained from the 'get an organization public key' endpoint.
```


**Action Parameters**

<ParamField path="encrypted_value" type="string">
</ParamField>

<ParamField path="key_id" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array">
</ParamField>

<ParamField path="visibility" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CUSTOMIZE_OIDC_SUBJECT_CLAIM_TEMPLATE">
**Tool Name:** Customize OIDC subject claim template

**Description**

```text wordWrap
Retrieves the openid connect (oidc) subject claim customization template for a repository, which defines the `sub` claim structure in oidc tokens for github actions workflows; returns the default configuration if no customization is applied.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CUSTOM_OIDCSUBJECT_CLAIM_TEMPLATE">
**Tool Name:** Get custom OIDC subject claim template

**Description**

```text wordWrap
Retrieves the openid connect (oidc) subject claim customization template for a github organization, which defines how the `sub` claim in oidc tokens for workflows is constructed.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_CUSTOM_OIDCSUBJECT_CLAIM_TEMPLATE_SETTER">
**Tool Name:** Set custom OIDC subject claim template

**Description**

```text wordWrap
Sets the openid connect (oidc) subject claim template for a github repository, allowing use of the default template or a custom one defined by `include claim keys` if `use default` is `false`.
```


**Action Parameters**

<ParamField path="include_claim_keys" type="array">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="use_default" type="boolean" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DECLINE_A_REPOSITORY_INVITATION">
**Tool Name:** Decline a repository invitation

**Description**

```text wordWrap
Declines a specific, pending repository invitation for the authenticated user, identified by its `invitation id`.
```


**Action Parameters**

<ParamField path="invitation_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_ACCESS_RESTRICTIONS">
**Tool Name:** Delete access restrictions

**Description**

```text wordWrap
Removes all user, team, and app-based access restrictions from a protected branch.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_CODE_SCANNING_ANALYSIS_FROM_A_REPOSITORY">
**Tool Name:** Delete a code scanning analysis from a repository

**Description**

```text wordWrap
Deletes a specific code scanning analysis by its id from a repository; `confirm delete` must be `true` if it's the last analysis of its type for a given tool and reference to prevent data loss.
```


**Action Parameters**

<ParamField path="analysis_id" type="integer" required={true}>
</ParamField>

<ParamField path="confirm_delete" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_CODESPACE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Delete a codespace for the authenticated user

**Description**

```text wordWrap
Deletes a specific codespace owned by the authenticated user; this is a destructive action and the codespace must exist.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_CODESPACE_FROM_THE_ORGANIZATION">
**Tool Name:** Delete a codespace from the organization

**Description**

```text wordWrap
Permanently deletes a specific codespace belonging to a member of the specified organization.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_DELETE_A_COMMIT_COMMENT">
**Tool Name:** Delete a commit comment

**Description**

```text wordWrap
Deletes a specific commit comment, identified by its `comment id`, from the specified repository; the comment must exist.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_COMMIT_COMMENT_REACTION">
**Tool Name:** Delete a commit comment reaction

**Description**

```text wordWrap
Deletes a reaction from a commit comment in a github repository.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="reaction_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_CUSTOM_ORGANIZATION_ROLE">
**Tool Name:** Delete a custom organization role

**Description**

```text wordWrap
Deletes a custom organization role (which should not be actively assigned) by its id; a 204 no content response indicates success.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_DEPLOY_KEY">
**Tool Name:** Delete a deploy key

**Description**

```text wordWrap
Deletes a specific deploy key from a repository; to change a key's properties or access scope, the existing key must be deleted and a new one created.
```


**Action Parameters**

<ParamField path="key_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_DEPLOYMENT">
**Tool Name:** Delete a deployment

**Description**

```text wordWrap
Permanently deletes a specified *inactive* deployment from a repository.
```


**Action Parameters**

<ParamField path="deployment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_DEPLOYMENT_BRANCH_POLICY">
**Tool Name:** Delete a deployment branch policy

**Description**

```text wordWrap
Deletes a specific deployment branch or tag policy, identified by its id, from a given environment within a repository.
```


**Action Parameters**

<ParamField path="branch_policy_id" type="integer" required={true}>
</ParamField>

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_DISCUSSION">
**Tool Name:** Delete a discussion

**Description**

```text wordWrap
Deletes a specific team discussion, identified by its number, from an organization's team.
```


**Action Parameters**

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_DISCUSSION_COMMENT">
**Tool Name:** Delete a discussion comment

**Description**

```text wordWrap
Deletes a specific comment from an existing team discussion within an organization, provided the specified organization, team, discussion, and comment all exist.
```


**Action Parameters**

<ParamField path="comment_number" type="integer" required={true}>
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_ADMIN_BRANCH_PROTECTION">
**Tool Name:** Delete admin branch protection

**Description**

```text wordWrap
Removes admin enforcement from a protected branch (branch name cannot contain wildcard characters) in a repository.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_FILE">
**Tool Name:** Delete a file

**Description**

```text wordWrap
Deletes a file by path from a github repository, requiring a commit message and the file's current blob sha to confirm the deletion.
```


**Action Parameters**

<ParamField path="author__email" type="string">
</ParamField>

<ParamField path="author__name" type="string">
</ParamField>

<ParamField path="branch" type="string">
</ParamField>

<ParamField path="committer__email" type="string">
</ParamField>

<ParamField path="committer__name" type="string">
</ParamField>

<ParamField path="message" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_GIST">
**Tool Name:** Delete a gist

**Description**

```text wordWrap
Permanently deletes an existing github gist, specified by its `gist id`; this action is destructive and cannot be undone.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_GIST_COMMENT">
**Tool Name:** Delete a gist comment

**Description**

```text wordWrap
Deletes a specific comment from a github gist using its `gist id` and `comment id`.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_GITHUB_PAGES_SITE">
**Tool Name:** Delete a GitHub Pages site

**Description**

```text wordWrap
Deletes the github pages site for the specified repository; completes without error if no site is currently enabled.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_LABEL">
**Tool Name:** Delete a label

**Description**

```text wordWrap
Permanently removes an existing label from a repository.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_MILESTONE">
**Tool Name:** Delete a milestone

**Description**

```text wordWrap
Deletes the specified milestone if it exists; this operation is idempotent, typically returning a 404 if the milestone is not found or already deleted.
```


**Action Parameters**

<ParamField path="milestone_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_APP_AUTHORIZATION">
**Tool Name:** Delete an app authorization

**Description**

```text wordWrap
Revokes a single, specific oauth access token for an oauth app, not all authorizations for the app.
```


**Action Parameters**

<ParamField path="access_token" type="string" required={true}>
</ParamField>

<ParamField path="client_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_APP_TOKEN">
**Tool Name:** Delete an app token

**Description**

```text wordWrap
Revokes an oauth access token for a github app, if the app exists and the token was issued to it.
```


**Action Parameters**

<ParamField path="access_token" type="string" required={true}>
</ParamField>

<ParamField path="client_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ARTIFACT">
**Tool Name:** Delete an artifact

**Description**

```text wordWrap
Deletes a github artifact by its id within a repository, typically resulting in an empty response (http 204 no content) on success.
```


**Action Parameters**

<ParamField path="artifact_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_AUTOLINK_REFERENCE_FROM_A_REPOSITORY">
**Tool Name:** Delete an autolink reference from a repository

**Description**

```text wordWrap
Deletes a specific autolink reference (which automatically links external resource ids like jira-123 to urls) from the specified repository.
```


**Action Parameters**

<ParamField path="autolink_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_EMAIL_ADDRESS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Delete authenticated user email address

**Description**

```text wordWrap
Sends an empty request body to `delete /user/emails` to attempt deletion of user email addresses; the api typically requires specific emails, so outcome may vary.
```


**Action Parameters**

<ParamField path="emails" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ENVIRONMENT">
**Tool Name:** Delete an environment

**Description**

```text wordWrap
Deletes an existing deployment environment from an existing repository.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ENVIRONMENT_SECRET">
**Tool Name:** Delete an environment secret

**Description**

```text wordWrap
Deletes an existing and accessible secret from a specified environment within a github repository, returning an empty dictionary on success or error details otherwise.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ENVIRONMENT_VARIABLE">
**Tool Name:** Delete an environment variable

**Description**

```text wordWrap
Deletes a named environment variable from a specified, existing environment within a github repository.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ISSUE_COMMENT">
**Tool Name:** Delete an issue comment

**Description**

```text wordWrap
Permanently deletes a specific comment by its id from an issue or pull request, if the repository exists and the comment id is valid.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ISSUE_COMMENT_REACTION">
**Tool Name:** Delete an issue comment reaction

**Description**

```text wordWrap
Deletes a reaction from an issue comment in a repository; the repository, comment, and reaction must exist.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="reaction_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ISSUE_REACTION">
**Tool Name:** Delete an issue reaction

**Description**

```text wordWrap
Permanently removes a specific reaction from an issue in a github repository.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="reaction_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ORGANIZATION">
**Tool Name:** Delete an organization

**Description**

```text wordWrap
Deletes a github organization and its repositories; this is a destructive action and the organization name will be unavailable for reuse for approximately 90 days.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ORGANIZATION_SECRET">
**Tool Name:** Delete an organization secret

**Description**

```text wordWrap
Permanently deletes a secret from a github organization, making it inaccessible to github actions workflows or other tools.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ORGANIZATION_VARIABLE">
**Tool Name:** Delete an organization variable

**Description**

```text wordWrap
Deletes a named github actions variable from a specified organization.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_AN_ORGANIZATION_WEBHOOK">
**Tool Name:** Delete an organization webhook

**Description**

```text wordWrap
Deletes a specific webhook, identified by `hook id`, from an existing organization.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_PACKAGE_FOR_AN_ORGANIZATION">
**Tool Name:** Delete a package for an organization

**Description**

```text wordWrap
Deletes a specific package in an organization; cannot delete public packages with over 5,000 downloads.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_PACKAGE_FOR_A_USER">
**Tool Name:** Delete a package for a user

**Description**

```text wordWrap
Deletes a package owned by the specified user, requiring admin permissions for the authenticated user; deletion of public packages with over 5,000 downloads may require github support.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
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

<Accordion title="GITHUB_DELETE_A_PACKAGE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Delete a package for the authenticated user

**Description**

```text wordWrap
Permanently deletes a specific package owned by the authenticated user; public packages downloaded over 5,000 times cannot be deleted via this api.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_PACKAGE_VERSION_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Delete a package version for the authenticated user

**Description**

```text wordWrap
Deletes an existing package version associated with the authenticated user.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_PENDING_REVIEW_FOR_A_PULL_REQUEST">
**Tool Name:** Delete a pending review for a pull request

**Description**

```text wordWrap
Deletes a pending (unsubmitted) review from a pull request; this is only possible if the review has not yet been submitted.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="review_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_PROJECT">
**Tool Name:** Delete a project

**Description**

```text wordWrap
Deletes the github project specified by `project id` if the project exists and the projects feature is enabled for its repository or organization; a successful deletion results in a 204 no content response.
```


**Action Parameters**

<ParamField path="project_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_PROJECT_CARD">
**Tool Name:** Delete a project card

**Description**

```text wordWrap
Deletes a project card from a github 'project (classic)'; this operation is idempotent.
```


**Action Parameters**

<ParamField path="card_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_PROJECT_COLUMN">
**Tool Name:** Delete a project column

**Description**

```text wordWrap
Deletes a project column by its id from a github project (classic); this is a destructive operation.
```


**Action Parameters**

<ParamField path="column_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_PULL_REQUEST_COMMENT_REACTION">
**Tool Name:** Delete a pull request comment reaction

**Description**

```text wordWrap
Deletes a specific reaction from a pull request review comment, provided the comment and reaction exist on that comment within the specified repository.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="reaction_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REFERENCE">
**Tool Name:** Delete a reference

**Description**

```text wordWrap
Deletes a git reference from a repository; 'ref' must be fully qualified (e.g., 'refs/heads/branch' or 'refs/tags/tag').
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_RELEASE">
**Tool Name:** Delete a release

**Description**

```text wordWrap
Permanently deletes a specific release, its assets, and potentially its associated git tag from a repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="release_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_RELEASE_ASSET">
**Tool Name:** Delete a release asset

**Description**

```text wordWrap
Deletes a specific release asset from a github repository; this action is idempotent.
```


**Action Parameters**

<ParamField path="asset_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_RELEASE_REACTION">
**Tool Name:** Delete a release reaction

**Description**

```text wordWrap
Deletes a reaction from a github release, provided the repository, release, and reaction exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="reaction_id" type="integer" required={true}>
</ParamField>

<ParamField path="release_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REPOSITORY">
**Tool Name:** Delete a repository

**Description**

```text wordWrap
Permanently deletes the specified repository; this is a destructive, irreversible action that requires admin privileges for the repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REPOSITORY_INVITATION">
**Tool Name:** Delete a repository invitation

**Description**

```text wordWrap
Deletes an active repository invitation, permanently revoking a user's access to collaborate on the specified repository.
```


**Action Parameters**

<ParamField path="invitation_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REPOSITORY_RULESET">
**Tool Name:** Delete a repository ruleset

**Description**

```text wordWrap
Permanently deletes a repository ruleset.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="ruleset_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REPOSITORY_SECRET">
**Tool Name:** Delete a repository secret

**Description**

```text wordWrap
Deletes a named github actions secret from a specified repository; this operation is destructive and idempotent, and requires the repository to exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REPOSITORY_SUBSCRIPTION">
**Tool Name:** Delete a repository subscription

**Description**

```text wordWrap
Deletes the authenticated user's subscription to a specified repository if it exists, effectively 'unwatching' it.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REPOSITORY_VARIABLE">
**Tool Name:** Delete a repository variable

**Description**

```text wordWrap
Deletes a named variable (e.g., for github actions workflows) from a repository; the repository and the variable must already exist.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REPOSITORY_WEBHOOK">
**Tool Name:** Delete a repository webhook

**Description**

```text wordWrap
Deletes a specific webhook from a repository.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_REVIEW_COMMENT_FOR_A_PULL_REQUEST">
**Tool Name:** Delete a review comment for a pull request

**Description**

```text wordWrap
Deletes a specific pull request review comment.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_SECRET_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Delete a secret for the authenticated user

**Description**

```text wordWrap
Deletes an existing codespaces secret for the authenticated user by `secret name`; this is a destructive, irreversible, and idempotent operation.
```


**Action Parameters**

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_SELF_HOSTED_RUNNER_FROM_AN_ORGANIZATION">
**Tool Name:** Delete a self hosted runner from an organization

**Description**

```text wordWrap
Deletes an existing and registered self-hosted runner from an organization, typically returning 204 no content on success.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_SELF_HOSTED_RUNNER_FROM_A_REPOSITORY">
**Tool Name:** Delete a self hosted runner from a repository

**Description**

```text wordWrap
Removes a specific self-hosted runner (by `runner id`) from a repository, if registered there; this is idempotent.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_TAG_PROTECTION_STATE_FOR_A_REPOSITORY">
**Tool Name:** Delete a tag protection state for a repository

**Description**

```text wordWrap
Permanently deletes a specific tag protection rule, identified by its id, from the given repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tag_protection_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_TEAM">
**Tool Name:** Delete a team

**Description**

```text wordWrap
Deletes a team (and any child teams) from an organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_THREAD_SUBSCRIPTION">
**Tool Name:** Delete a thread subscription

**Description**

```text wordWrap
Call this to mute a specific notification thread by deleting the user's subscription; notifications may still occur if the user is @mentioned, comments, or due to repository watch settings.
```


**Action Parameters**

<ParamField path="thread_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_A_WORKFLOW_RUN">
**Tool Name:** Delete a workflow run

**Description**

```text wordWrap
Deletes a specific workflow run from a repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_BRANCH_PROTECTION">
**Tool Name:** Delete branch protection

**Description**

```text wordWrap
Removes all protection rules from a specific branch in a github repository; the branch must currently have protection rules enabled.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_COMMIT_SIGNATURE_PROTECTION">
**Tool Name:** Delete commit signature protection

**Description**

```text wordWrap
Disables gpg commit signature protection for a specific branch in a github repository, meaning commits pushed to this branch no longer require gpg signing.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_DEPENDEBOT_SECRET_BY_NAME">
**Tool Name:** Delete dependabot secret by name

**Description**

```text wordWrap
Deletes a specific dependabot secret, identified by its name, from a given repository if both the repository and secret exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_GITHUB_ACTIONS_CACHE_BY_ID">
**Tool Name:** Delete GitHub Actions cache by ID

**Description**

```text wordWrap
Deletes a specific github actions cache from a repository using its unique `cache id`.
```


**Action Parameters**

<ParamField path="cache_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_PACKAGE_VERSION_FOR_AN_ORGANIZATION">
**Tool Name:** Delete package version for an organization

**Description**

```text wordWrap
Deletes a specific package version within an organization; requires admin permissions for packages with over 5,000 downloads.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_PACKAGE_VERSION_FOR_A_USER">
**Tool Name:** Delete package version for a user

**Description**

```text wordWrap
Permanently and irreversibly deletes a specific version of a package owned by the specified user.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
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

<Accordion title="GITHUB_DELETE_PULL_REQUEST_REVIEW_PROTECTION">
**Tool Name:** Delete pull request review protection

**Description**

```text wordWrap
Disables the requirement for pull request reviews before merging for a specific, existing branch in an existing repository; this action is idempotent and will succeed even if the protection is not currently enabled.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_REPO_CODESPACE_SECRET_BY_NAME">
**Tool Name:** Delete repo codespace secret by name

**Description**

```text wordWrap
Deletes a specific codespace secret from a repository by its name; this action is idempotent and will succeed even if the secret doesn't exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_SOCIAL_ACCOUNTS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Delete social accounts for the authenticated user

**Description**

```text wordWrap
Deletes currently linked social media account urls from the authenticated user's github profile.
```


**Action Parameters**

<ParamField path="account_urls" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_TEAM_DISCUSSION_COMMENT_REACTION">
**Tool Name:** Delete team discussion comment reaction

**Description**

```text wordWrap
Deletes a reaction from a team discussion comment, given the organization name, team slug, discussion number, comment number, and reaction id.
```


**Action Parameters**

<ParamField path="comment_number" type="integer" required={true}>
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="reaction_id" type="integer" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_TEAM_DISCUSSION_REACTION">
**Tool Name:** Delete team discussion reaction

**Description**

```text wordWrap
Permanently deletes a specific reaction from a team discussion within an organization.
```


**Action Parameters**

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="reaction_id" type="integer" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DELETE_WORKFLOW_RUN_LOGS">
**Tool Name:** Delete workflow run logs

**Description**

```text wordWrap
Deletes all logs for a specific workflow run in a github repository, provided the repository and run exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DISABLE_A_CUSTOM_PROTECTION_RULE_FOR_AN_ENVIRONMENT">
**Tool Name:** Disable a custom protection rule for an environment

**Description**

```text wordWrap
Disables a specific, currently active custom deployment protection rule for an existing environment within a github repository.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="protection_rule_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DISABLE_A_WORKFLOW">
**Tool Name:** Disable a workflow

**Description**

```text wordWrap
Disables a specified workflow (by id or filename) in a given github repository, preventing new automatic triggers; any in-progress runs will continue.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="workflow_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DISABLE_PRIVATE_VULNERABILITY_REPORTING_FOR_A_REPOSITORY">
**Tool Name:** Disable private vulnerability reporting for a repository

**Description**

```text wordWrap
Disables private vulnerability reporting for an existing github repository, preventing direct private vulnerability reports to maintainers via github's interface for this repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DISABLE_REPOSITORY_ACTIONS_IN_ORG">
**Tool Name:** Disablerepositoryactionsinorg

**Description**

```text wordWrap
Disables github actions for a specific repository within an organization; this action is only effective if the organization's github actions `enabled repositories` setting is configured to `selected`.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DISMISS_A_REVIEW_FOR_A_PULL_REQUEST">
**Tool Name:** Dismiss a review for a pull request

**Description**

```text wordWrap
Dismisses a review on a pull request with a mandatory explanatory message.
```


**Action Parameters**

<ParamField path="event" type="string">
</ParamField>

<ParamField path="message" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="review_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DOWNLOAD_AN_ARTIFACT">
**Tool Name:** Download an artifact

**Description**

```text wordWrap
Downloads a specific github repository artifact, returning a temporary url to its 'zip' archive, valid for one minute.
```


**Action Parameters**

<ParamField path="archive_format" type="string" required={true}>
</ParamField>

<ParamField path="artifact_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DOWNLOAD_A_REPOSITORY_ARCHIVE_TAR">
**Tool Name:** Download a repository tarball

**Description**

```text wordWrap
Downloads a repository's source code as a tarball (.tar.gz) archive for a specific git reference, if the repository is accessible.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DOWNLOAD_A_REPOSITORY_ARCHIVE_ZIP">
**Tool Name:** Download a repository archive ZIP

**Description**

```text wordWrap
Downloads a repository's source code as a zip archive for a specific git reference (branch, tag, or commit sha).
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DOWNLOAD_JOB_LOGS_FOR_A_WORKFLOW_RUN">
**Tool Name:** Download job logs for a workflow run

**Description**

```text wordWrap
Downloads logs for a specific job in a github actions workflow run, contingent on the repository's existence and the job id being valid and having produced logs.
```


**Action Parameters**

<ParamField path="job_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DOWNLOAD_WORKFLOW_RUN_ATTEMPT_LOGS">
**Tool Name:** Download workflow run attempt logs

**Description**

```text wordWrap
Downloads a zip archive of logs for a specific workflow run attempt.
```


**Action Parameters**

<ParamField path="attempt_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_DOWNLOAD_WORKFLOW_RUN_LOGS">
**Tool Name:** Download workflow run logs

**Description**

```text wordWrap
Downloads logs for a specific github actions workflow run, typically archived as a zip file, if logs are available (e.g., not expired and the workflow has produced output).
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_EMO_J_IS_GET">
**Tool Name:** Get emojis

**Description**

```text wordWrap
Lists all emojis available for use on github; deprecated, use `get emojis` instead.
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

<Accordion title="GITHUB_ENABLE_A_WORKFLOW">
**Tool Name:** Enable a workflow

**Description**

```text wordWrap
Reactivates a currently disabled github actions workflow within a repository using its numerical id.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="workflow_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ENABLE_GITHUB_ACTIONS_IN_SELECTED_REPOSITORIES">
**Tool Name:** Enable GitHub actions in selected repositories

**Description**

```text wordWrap
Sets the specific repositories that can use github actions within an organization by replacing the current list; only applies if the organization's actions policy is 'selected repositories'.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ENABLE_PRIVATE_VULNERABILITY_REPORTING_FOR_A_REPOSITORY">
**Tool Name:** Enable private vulnerability reporting for a repository

**Description**

```text wordWrap
Enables private vulnerability reporting for a repository, allowing security researchers to privately submit vulnerability reports to maintainers.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ENABLE_REPO_FORGITHUB_ACTIONS">
**Tool Name:** Enable repo for Github Actions

**Description**

```text wordWrap
Enables github actions for a repository if the organization's actions permissions are set to allow for 'selected repositories'.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ENCRYPT_AND_UPDATE_DEV_SECRET">
**Tool Name:** Encrypt and update dev secret

**Description**

```text wordWrap
Creates or updates a repository's development environment secret using an `encrypted value` and its corresponding `key id`; the secret must be pre-encrypted with the repository's codespaces public key.
```


**Action Parameters**

<ParamField path="encrypted_value" type="string">
</ParamField>

<ParamField path="key_id" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ENCRYPT_ORG_DEV_ENV_SECRET">
**Tool Name:** Encrypt org dev env secret

**Description**

```text wordWrap
Creates or updates an organization's github codespaces secret using an encrypted value and its corresponding public key id.
```


**Action Parameters**

<ParamField path="encrypted_value" type="string">
</ParamField>

<ParamField path="key_id" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array">
</ParamField>

<ParamField path="visibility" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ENCRYPT_ORG_SECRETS_USING_PUBLIC_KEY">
**Tool Name:** Encrypt org secrets using public key

**Description**

```text wordWrap
Retrieves an organization's public key, which must be used to encrypt secret values before they are configured for codespaces.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_EXPORT_A_CODESPACE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Export a codespace for the authenticated user

**Description**

```text wordWrap
Triggers an export of a user's specified codespace, automatically stopping it if active, and returns its export status and download url.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_EXPORT_A_SOFTWARE_BILL_OF_MATERIALS_SBOM_FOR_A_REPOSITORY">
**Tool Name:** Export an SBOM for a repository

**Description**

```text wordWrap
Exports the software bill of materials (sbom) in spdx json format for a repository, if its dependency graph is enabled and it has at least one commit.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_FETCH_PUBLIC_KEY_FOR_SECRET_ENCRYPTION">
**Tool Name:** Fetchpublickeyforsecretencryption

**Description**

```text wordWrap
Retrieves the public key for an existing github organization, required for encrypting dependabot secrets.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_FIND_PULL_REQUESTS">
**Tool Name:** Find Pull Requests

**Description**

```text wordWrap
Ai-optimized pull request search with smart filtering by repo, author, state, labels, and merge status. builds intelligent search queries and returns clean, actionable pr data.
```


**Action Parameters**

<ParamField path="assignee" type="string">
</ParamField>

<ParamField path="author" type="string">
</ParamField>

<ParamField path="base_branch" type="string">
</ParamField>

<ParamField path="created_since" type="string">
</ParamField>

<ParamField path="for_authenticated_user" type="boolean">
</ParamField>

<ParamField path="head_branch" type="string">
</ParamField>

<ParamField path="is_merged" type="boolean">
</ParamField>

<ParamField path="label" type="string">
</ParamField>

<ParamField path="language" type="string">
</ParamField>

<ParamField path="mentions" type="string">
</ParamField>

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="owner" type="string">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="20">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="raw_response" type="boolean">
</ParamField>

<ParamField path="repo" type="string">
</ParamField>

<ParamField path="sort" type="string" default="updated">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>

<ParamField path="updated_since" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_FIND_REPOSITORIES">
**Tool Name:** Find Repositories

**Description**

```text wordWrap
Ai-optimized repository search with smart filtering by language, stars, topics, and ownership. builds intelligent search queries and returns clean, actionable repository data.
```


**Action Parameters**

<ParamField path="archived" type="boolean">
</ParamField>

<ParamField path="for_authenticated_user" type="boolean">
</ParamField>

<ParamField path="fork_filter" type="string" default="exclude">
</ParamField>

<ParamField path="language" type="string">
</ParamField>

<ParamField path="max_stars" type="integer">
</ParamField>

<ParamField path="min_forks" type="integer">
</ParamField>

<ParamField path="min_stars" type="integer">
</ParamField>

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="owner" type="string">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="20">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="raw_response" type="boolean">
</ParamField>

<ParamField path="sort" type="string" default="stars">
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

<Accordion title="GITHUB_FOLLOW_A_USER">
**Tool Name:** Follow a user

**Description**

```text wordWrap
Allows the authenticated user to follow the github user specified by `username`; this action is idempotent and the user cannot follow themselves.
```


**Action Parameters**

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

<Accordion title="GITHUB_FORCE_CANCEL_A_WORKFLOW_RUN">
**Tool Name:** Force cancel a workflow run

**Description**

```text wordWrap
Forcefully cancels an existing github actions workflow run, bypassing normal cancellation conditions; requires write permissions to the repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_FORK_A_GIST">
**Tool Name:** Fork a gist

**Description**

```text wordWrap
Forks a specified public gist, creating a copy under the authenticated user's account.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GENERATE_RELEASE_NOTES_CONTENT_FOR_A_RELEASE">
**Tool Name:** Generate release notes content for a release

**Description**

```text wordWrap
Generates markdown release notes content (listing changes, pull requests, and contributors) for a github repository release, customizable via tags and a configuration file.
```


**Action Parameters**

<ParamField path="configuration_file_path" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="previous_tag_name" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tag_name" type="string" required={true}>
</ParamField>

<ParamField path="target_commitish" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_BLOB">
**Tool Name:** Get a blob

**Description**

```text wordWrap
Retrieves the raw, typically base64-encoded, content of a file (blob) from a github repository using its sha hash, if the repository and blob sha exist.
```


**Action Parameters**

<ParamField path="file_sha" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_BRANCH">
**Tool Name:** Get a branch

**Description**

```text wordWrap
Retrieves detailed information for a specified branch within a github repository.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ACCESS_RESTRICTIONS">
**Tool Name:** Get access restrictions

**Description**

```text wordWrap
Lists users, teams, and github apps with push access to a branch; this branch must be protected in repository settings for detailed restrictions, otherwise expect a 404 or empty response.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CHECK_RUN">
**Tool Name:** Get a check run

**Description**

```text wordWrap
Retrieves detailed information for a specific check run within a github repository.
```


**Action Parameters**

<ParamField path="check_run_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CHECK_SUITE">
**Tool Name:** Get a check suite

**Description**

```text wordWrap
Retrieves a specific check suite (a collection of check runs) by its id from a repository accessible to the authenticated user.
```


**Action Parameters**

<ParamField path="check_suite_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CLASSROOM">
**Tool Name:** Get a classroom

**Description**

```text wordWrap
Retrieves details for a specific github classroom; the classroom id must correspond to an existing classroom.
```


**Action Parameters**

<ParamField path="classroom_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CODE_OF_CONDUCT">
**Tool Name:** Get a code of conduct

**Description**

```text wordWrap
Retrieves the full details of a specific github code of conduct using its unique key.
```


**Action Parameters**

<ParamField path="key" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CODE_QL_DATABASE_FOR_A_REPOSITORY">
**Tool Name:** Get a CodeQL database for a repository

**Description**

```text wordWrap
Gets an existing codeql database (including a download url) for a specified language in an accessible repository, if one has been successfully built for that language.
```


**Action Parameters**

<ParamField path="language" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CODE_SCANNING_ALERT">
**Tool Name:** Get a code scanning alert

**Description**

```text wordWrap
Retrieves a specific code scanning alert, which identifies potential code vulnerabilities or errors, by its number from the specified github repository.
```


**Action Parameters**

<ParamField path="alert_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CODE_SCANNING_ANALYSIS_FOR_A_REPOSITORY">
**Tool Name:** Get a code scanning analysis for a repository

**Description**

```text wordWrap
Retrieves detailed information for a specific code scanning analysis on an accessible repository, identified by its `analysis id`.
```


**Action Parameters**

<ParamField path="analysis_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CODE_SCANNING_DEFAULT_SETUP_CONFIGURATION">
**Tool Name:** Get a code scanning default setup configuration

**Description**

```text wordWrap
Gets the default setup configuration for code scanning in a repository, including state, languages, query suite, and schedule for a repository if it exists.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CODESPACE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Get a codespace for the authenticated user

**Description**

```text wordWrap
Call to retrieve detailed information for a `codespace name` belonging to the authenticated user, ensuring the codespace exists and is accessible.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_COMMIT">
**Tool Name:** Get a commit

**Description**

```text wordWrap
Retrieves a specific commit from a repository by its owner, name, and a valid commit reference (sha, branch, or tag), supporting pagination for large diffs.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_COMMIT_COMMENT">
**Tool Name:** Get a commit comment

**Description**

```text wordWrap
Retrieves the full details of a specific commit comment in a github repository, using its unique identifier.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_COMMIT_OBJECT">
**Tool Name:** Get a commit object

**Description**

```text wordWrap
Retrieves detailed information (including author, committer, message, tree, parents, verification) for a specific commit in a github repository, identified by its sha.
```


**Action Parameters**

<ParamField path="commit_sha" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CUSTOM_DEPLOYMENT_PROTECTION_RULE">
**Tool Name:** Get a custom deployment protection rule

**Description**

```text wordWrap
Retrieves a specific custom deployment protection rule (used by github apps for external validation or manual approval of deployments) for a given environment in a repository.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="protection_rule_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_CUSTOM_PROPERTY_FOR_AN_ORGANIZATION">
**Tool Name:** Get a custom property for an organization

**Description**

```text wordWrap
Retrieves the definition (schema) of a specific, existing custom property for an organization.
```


**Action Parameters**

<ParamField path="custom_property_name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DELIVERY_FOR_A_REPOSITORY_WEBHOOK">
**Tool Name:** Get a delivery for a repository webhook

**Description**

```text wordWrap
Retrieves a specific delivery for a repository webhook, identified by its `hook id` and `delivery id`.
```


**Action Parameters**

<ParamField path="delivery_id" type="integer" required={true}>
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DEPLOY_KEY">
**Tool Name:** Get a deploy key

**Description**

```text wordWrap
Gets a specific deploy key, identified by its `key id`, for the github repository specified by `owner` and `repo`.
```


**Action Parameters**

<ParamField path="key_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DEPLOYMENT">
**Tool Name:** Get a deployment

**Description**

```text wordWrap
Gets a specific deployment by id from a repository, provided the repository and deployment id exist.
```


**Action Parameters**

<ParamField path="deployment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DEPLOYMENT_BRANCH_POLICY">
**Tool Name:** Get a deployment branch policy

**Description**

```text wordWrap
Retrieves a specific deployment branch policy for an environment in a repository, identified by its unique id.
```


**Action Parameters**

<ParamField path="branch_policy_id" type="integer" required={true}>
</ParamField>

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DEPLOYMENT_STATUS">
**Tool Name:** Get a deployment status

**Description**

```text wordWrap
Retrieves a specific deployment status by its id for a given deployment within a github repository.
```


**Action Parameters**

<ParamField path="deployment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="status_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DIFF_OF_THE_DEPENDENCIES_BETWEEN_COMMITS">
**Tool Name:** Get a diff of the dependencies between commits

**Description**

```text wordWrap
Gets the dependency diff between two git revisions in a repository, where 'basehead' specifies the revisions and 'name' can optionally scope to a specific manifest file.
```


**Action Parameters**

<ParamField path="basehead" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DISCUSSION">
**Tool Name:** Get a discussion

**Description**

```text wordWrap
Fetches a specific discussion by its number from a team within an organization.
```


**Action Parameters**

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DISCUSSION_COMMENT">
**Tool Name:** Get a discussion comment

**Description**

```text wordWrap
Fetches a specific comment from a team discussion within a specific organization.
```


**Action Parameters**

<ParamField path="comment_number" type="integer" required={true}>
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ADMIN_BRANCH_PROTECTION">
**Tool Name:** Get admin branch protection

**Description**

```text wordWrap
Checks if repository administrators are subject to the branch protection rules on a specific branch.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_DNS_HEALTH_CHECK_FOR_GITHUB_PAGES">
**Tool Name:** Get a dns health check for github pages

**Description**

```text wordWrap
Retrieves the dns health check status (e.g., cname/a records, https) for a github pages site; the check may be pending (http 202) on initial calls or after site changes.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_GIST">
**Tool Name:** Get a gist

**Description**

```text wordWrap
Fetches a specific github gist by its `gist id`, returning comprehensive details if the gist exists.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_GIST_COMMENT">
**Tool Name:** Get a gist comment

**Description**

```text wordWrap
Retrieves a specific gist comment by its id and the gist's id.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_GIST_REVISION">
**Tool Name:** Get a gist revision

**Description**

```text wordWrap
Retrieves a specific revision of a gist.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_GITHUB_PAGES_SITE">
**Tool Name:** Get a GitHub Pages site

**Description**

```text wordWrap
Retrieves information for a github pages site, which must be enabled for the repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_GITIGNORE_TEMPLATE">
**Tool Name:** Get a gitignore template

**Description**

```text wordWrap
Retrieves a specific .gitignore template from github by its name, which must be an existing template in github's collection.
```


**Action Parameters**

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

<Accordion title="GITHUB_GET_A_JOB_FOR_A_WORKFLOW_RUN">
**Tool Name:** Get a job for a workflow run

**Description**

```text wordWrap
Retrieves detailed information for a specific job within a github actions workflow run, given its `job id` which must be valid for the specified repository's workflow.
```


**Action Parameters**

<ParamField path="job_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_LABEL">
**Tool Name:** Get a label

**Description**

```text wordWrap
Retrieves a specific label by its name from a specified github repository.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_LICENSE">
**Tool Name:** Get a license

**Description**

```text wordWrap
Call this action to retrieve comprehensive details for a specific software license recognized by github, using its unique license key.
```


**Action Parameters**

<ParamField path="license" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_API_VERSIONS">
**Tool Name:** Get all API versions

**Description**

```text wordWrap
Retrieves all officially supported, date-based (e.g., "2022-11-28") versions of the github rest api from the /versions endpoint.
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

<Accordion title="GITHUB_GET_ALL_AUTOLINKS_OF_A_REPOSITORY">
**Tool Name:** Get all autolinks of a repository

**Description**

```text wordWrap
Retrieves all autolinks (e.g., for jira issues) configured for a repository; requires admin permissions on the repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_CODES_OF_CONDUCT">
**Tool Name:** Get all codes of conduct

**Description**

```text wordWrap
Retrieves all available codes of conduct from github, often used to select one for a repository.
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

<Accordion title="GITHUB_GET_ALL_COMMONLY_USED_LICENSES">
**Tool Name:** Get all commonly used licenses

**Description**

```text wordWrap
Retrieves a list of commonly used software licenses from github, optionally filtering for 'featured' licenses whose specific selection criteria by github may vary.
```


**Action Parameters**

<ParamField path="featured" type="boolean">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_CONTRIBUTOR_COMMIT_ACTIVITY">
**Tool Name:** Get all contributor commit activity

**Description**

```text wordWrap
Retrieves commit activity (total commits, weekly additions/deletions/commits) for all contributors to a repository; may require a retry if github returns 202 while preparing data.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_CUSTOM_PROPERTIES_FOR_AN_ORGANIZATION">
**Tool Name:** Get all custom properties for an organization

**Description**

```text wordWrap
Gets the schema definitions for all custom properties configured for an organization, not the specific values assigned to repositories.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_CUSTOM_PROPERTY_VALUES_FOR_A_REPOSITORY">
**Tool Name:** Get all custom property values for a repository

**Description**

```text wordWrap
Gets all custom property values for a repository, which may include default values or be empty if no properties are explicitly set.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_DEPLOYMENT_PROTECTION_RULES_FOR_AN_ENVIRONMENT">
**Tool Name:** Get all deployment protection rules for an environment

**Description**

```text wordWrap
Lists all enabled custom deployment protection rules for a specific environment in a repository; the environment must exist and be configured for deployments.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_GITIGNORE_TEMPLATES">
**Tool Name:** Get all gitignore templates

**Description**

```text wordWrap
Retrieves all available .gitignore template names from github (e.g., 'python', 'node', 'java'), used for generating .gitignore files.
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

<Accordion title="GITHUB_GET_ALL_ORGANIZATION_ROLES_FOR_AN_ORGANIZATION">
**Tool Name:** Get all organization roles for an organization

**Description**

```text wordWrap
Lists all custom organization roles for an existing github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_REPOSITORY_RULESETS">
**Tool Name:** Get all repository rulesets

**Description**

```text wordWrap
Retrieves all rulesets for a github repository, which define conditions and actions for repository interactions (e.g., branch protections).
```


**Action Parameters**

<ParamField path="includes_parents" type="boolean" default="True">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_REPOSITORY_TOPICS">
**Tool Name:** Get all repository topics

**Description**

```text wordWrap
Retrieves all topics for a specified, existing, and accessible repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_REQUESTED_REVIEWERS_FOR_A_PULL_REQUEST">
**Tool Name:** Get all requested reviewers for a pull request

**Description**

```text wordWrap
Gets all users and teams requested to review a specific pull request in a repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ALL_STATUS_CHECK_CONTEXTS">
**Tool Name:** Get all status check contexts

**Description**

```text wordWrap
Fetches all required status check contexts for a protected branch; returns an empty list if the branch isn't protected or has no required checks.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_MILESTONE">
**Tool Name:** Get a milestone

**Description**

```text wordWrap
Retrieves detailed information for a specific milestone within a github repository by its number.
```


**Action Parameters**

<ParamField path="milestone_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_APP">
**Tool Name:** Get an app

**Description**

```text wordWrap
Retrieves publicly available information for an existing github app, identified by its unique url-friendly `app slug`.
```


**Action Parameters**

<ParamField path="app_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ARTIFACT">
**Tool Name:** Get an artifact

**Description**

```text wordWrap
Gets a specific artifact for a repository by `artifact id`.
```


**Action Parameters**

<ParamField path="artifact_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ASSIGNMENT">
**Tool Name:** Get an assignment

**Description**

```text wordWrap
Retrieves detailed information for a specific github classroom assignment if the authenticated user is an administrator of the classroom.
```


**Action Parameters**

<ParamField path="assignment_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_AUTOLINK_REFERENCE_OF_A_REPOSITORY">
**Tool Name:** Get an autolink reference of a repository

**Description**

```text wordWrap
Retrieves a specific autolink reference (which automatically hyperlinks text like 'jira-123' to an external system) for a repository using its unique id; requires administrator access to the repository.
```


**Action Parameters**

<ParamField path="autolink_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ENVIRONMENT">
**Tool Name:** Get an environment

**Description**

```text wordWrap
Get an environment
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ENVIRONMENT_PUBLIC_KEY">
**Tool Name:** Get an environment public key

**Description**

```text wordWrap
Retrieves the public key for a specified github repository environment, used to encrypt secrets for github actions.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ENVIRONMENT_SECRET">
**Tool Name:** Get an environment secret

**Description**

```text wordWrap
Get an environment secret
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ENVIRONMENT_VARIABLE">
**Tool Name:** Get an environment variable

**Description**

```text wordWrap
Get an environment variable
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ISSUE">
**Tool Name:** Get an issue

**Description**

```text wordWrap
Get an issue
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ISSUE_COMMENT">
**Tool Name:** Get an issue comment

**Description**

```text wordWrap
Get an issue comment
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ISSUE_EVENT">
**Tool Name:** Get an issue event

**Description**

```text wordWrap
Get an issue event
```


**Action Parameters**

<ParamField path="event_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ORGANIZATION">
**Tool Name:** Get an organization

**Description**

```text wordWrap
Get an organization
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ORGANIZATION_PUBLIC_KEY">
**Tool Name:** Get an organization public key

**Description**

```text wordWrap
Get an organization public key
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ORGANIZATION_ROLE">
**Tool Name:** Get an organization role

**Description**

```text wordWrap
Retrieves a specific github organization role by its id.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ORGANIZATION_SECRET">
**Tool Name:** Get an organization secret

**Description**

```text wordWrap
Gets an organization secret's metadata (e.g., name, creation/update dates, visibility), but not its encrypted value.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ORGANIZATION_VARIABLE">
**Tool Name:** Get an organization variable

**Description**

```text wordWrap
Retrieves details (name, value, visibility, timestamps) of a specific, existing variable for an existing github organization.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_AN_ORGANIZATION_WEBHOOK">
**Tool Name:** Get an organization webhook

**Description**

```text wordWrap
Retrieves the full configuration, including subscribed events and delivery settings, for an existing organization webhook.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_PACKAGE_FOR_AN_ORGANIZATION">
**Tool Name:** Get a package for an organization

**Description**

```text wordWrap
Retrieves a specific package (by type and name) from an organization, if both the package and organization exist.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_PACKAGE_FOR_A_USER">
**Tool Name:** Get a package for a user

**Description**

```text wordWrap
Retrieves metadata for a specific package owned by a github user, using package type, name, and username as identifiers.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
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

<Accordion title="GITHUB_GET_A_PACKAGE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Get a package for the authenticated user

**Description**

```text wordWrap
Retrieves detailed information for a specific package owned by the authenticated user.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_PACKAGE_VERSION_FOR_AN_ORGANIZATION">
**Tool Name:** Get a package version for an organization

**Description**

```text wordWrap
Retrieves detailed information for a specific version of a package within an organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_PACKAGE_VERSION_FOR_A_USER">
**Tool Name:** Get a package version for a user

**Description**

```text wordWrap
Retrieves a specific public package version associated with a github user.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
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

<Accordion title="GITHUB_GET_A_PACKAGE_VERSION_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Get authenticated user package version

**Description**

```text wordWrap
Retrieves detailed information for an existing specific package version associated with the authenticated user, identified by its type, name, and version id.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_APPS_WITH_ACCESS_TO_THE_PROTECTED_BRANCH">
**Tool Name:** Get apps with access to the protected branch

**Description**

```text wordWrap
Lists github apps with push access to a repository's protected branch.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_PROJECT">
**Tool Name:** Get a project

**Description**

```text wordWrap
Retrieves detailed information for a specific github project using its unique `project id`.
```


**Action Parameters**

<ParamField path="project_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_PROJECT_CARD">
**Tool Name:** Get a project card

**Description**

```text wordWrap
Retrieves all details of a specific project card, given its unique `card id`.
```


**Action Parameters**

<ParamField path="card_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_PROJECT_COLUMN">
**Tool Name:** Get a project column

**Description**

```text wordWrap
Retrieves detailed information for a specific project column; the column must exist.
```


**Action Parameters**

<ParamField path="column_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_PULL_REQUEST">
**Tool Name:** Get a pull request

**Description**

```text wordWrap
Retrieves a specific pull request from a github repository using its owner, repository name, and pull request number.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REFERENCE">
**Tool Name:** Get a reference

**Description**

```text wordWrap
Retrieves a specific git reference (e.g., a branch, tag, or fully qualified like 'heads/main') from a github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_RELEASE">
**Tool Name:** Get a release

**Description**

```text wordWrap
Gets a specific release from a github repository, provided the repository is accessible and the release exists.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="release_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_RELEASE_ASSET">
**Tool Name:** Get a release asset

**Description**

```text wordWrap
Gets metadata for a specific release asset in a github repository, including a `browser download url` for downloading the asset.
```


**Action Parameters**

<ParamField path="asset_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_RELEASE_BY_TAG_NAME">
**Tool Name:** Get a release by tag name

**Description**

```text wordWrap
Gets a release from a github repository by its tag name; the repository and a release with this tag must already exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tag" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY">
**Tool Name:** Get a repository

**Description**

```text wordWrap
Retrieves detailed information about an existing and accessible github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_PUBLIC_KEY">
**Tool Name:** Get a repository public key

**Description**

```text wordWrap
Gets a repository's public key for encrypting secrets to be used in github actions, if the repository exists and is accessible.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_README">
**Tool Name:** Get a repository readme

**Description**

```text wordWrap
Fetches the readme file (if it exists and is accessible) from a specified github repository, returning its base64-encoded content and metadata.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_README_FOR_A_DIRECTORY">
**Tool Name:** Get a repository readme for a directory

**Description**

```text wordWrap
Retrieves the readme file from a specified directory within a github repository, optionally at a given commit, branch, or tag.
```


**Action Parameters**

<ParamField path="dir" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_RULESET">
**Tool Name:** Get a repository ruleset

**Description**

```text wordWrap
Retrieves a specific repository ruleset by its id; if `includes parents` is true, the search for this `ruleset id` also extends to rulesets from parent organizations.
```


**Action Parameters**

<ParamField path="includes_parents" type="boolean" default="True">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="ruleset_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_RULE_SUITE">
**Tool Name:** Get a repository rule suite

**Description**

```text wordWrap
Gets detailed information for a specific repository rule suite by its id, including its evaluation status and the results of its individual rules.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="rule_suite_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_SECRET">
**Tool Name:** Get a repository secret

**Description**

```text wordWrap
Gets metadata (name, creation/update timestamps) for an existing repository secret, excluding its encrypted value.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_SUBSCRIPTION">
**Tool Name:** Get a repository subscription

**Description**

```text wordWrap
Gets the authenticated user's subscription details for a repository, indicating if they receive notifications.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_VARIABLE">
**Tool Name:** Get a repository variable

**Description**

```text wordWrap
Gets a specific github actions variable by name from an accessible repository.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REPOSITORY_WEBHOOK">
**Tool Name:** Get a repository webhook

**Description**

```text wordWrap
Returns the configuration of an existing webhook for a given repository.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REVIEW_COMMENT_FOR_A_PULL_REQUEST">
**Tool Name:** Get a review comment for a pull request

**Description**

```text wordWrap
Retrieves a specific pull request review comment by its id, provided the repository exists, is accessible, and the comment id is valid.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_REVIEW_FOR_A_PULL_REQUEST">
**Tool Name:** Get a review for a pull request

**Description**

```text wordWrap
Retrieves a specific review for a pull request using its owner, repository, pull request number, and review id.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="review_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_SECRET_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Get a secret for the authenticated user

**Description**

```text wordWrap
Retrieves metadata (name, timestamps, visibility; not the value) for a specific, existing development environment secret associated with the authenticated user's github codespaces.
```


**Action Parameters**

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_SELF_HOSTED_RUNNER_FOR_AN_ORGANIZATION">
**Tool Name:** Get a self hosted runner for an organization

**Description**

```text wordWrap
Retrieves detailed information about a specific self-hosted runner registered within a github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_SELF_HOSTED_RUNNER_FOR_A_REPOSITORY">
**Tool Name:** Get a self hosted runner for a repository

**Description**

```text wordWrap
Gets a specific self-hosted runner for a repository by its unique id.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ASSIGNMENT_GRADES">
**Tool Name:** Get assignment grades

**Description**

```text wordWrap
Retrieves all grades for an existing github classroom assignment.
```


**Action Parameters**

<ParamField path="assignment_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_TAG">
**Tool Name:** Get a tag

**Description**

```text wordWrap
Retrieves detailed information for a specific git tag object from a github repository, using the sha of the tag object itself.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tag_sha" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_TEAM_BY_NAME">
**Tool Name:** Get a team by name

**Description**

```text wordWrap
Retrieves a github team by its slug from a specific organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_THREAD">
**Tool Name:** Get a thread

**Description**

```text wordWrap
Retrieves a specific github notification thread using its unique `thread id`.
```


**Action Parameters**

<ParamField path="thread_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_THREAD_SUBSCRIPTION_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Get a thread subscription for the authenticated user

**Description**

```text wordWrap
Retrieves the authenticated user's subscription details for a specific notification thread, identified by `thread id`.
```


**Action Parameters**

<ParamField path="thread_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_TREE">
**Tool Name:** Get a tree

**Description**

```text wordWrap
Retrieves a git tree (directory listing) from a github repository using its sha, branch name, or tag name, optionally fetching all nested items recursively.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="recursive" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tree_sha" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_USER">
**Tool Name:** Get a user

**Description**

```text wordWrap
Retrieves the public profile information for an existing github user, specified by their username.
```


**Action Parameters**

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

<Accordion title="GITHUB_GET_A_WEBHOOK_CONFIGURATION_FOR_AN_ORGANIZATION">
**Tool Name:** Get a webhook configuration for an organization

**Description**

```text wordWrap
Retrieves the configuration for a specific webhook associated with a github organization.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_WEBHOOK_CONFIGURATION_FOR_A_REPOSITORY">
**Tool Name:** Get a webhook configuration for a repository

**Description**

```text wordWrap
Returns the configuration for an existing webhook on the specified repository.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_WEBHOOK_DELIVERY_FOR_AN_ORGANIZATION_WEBHOOK">
**Tool Name:** Get a webhook delivery for an organization webhook

**Description**

```text wordWrap
Returns detailed information for a specific delivery attempt of a webhook configured for the specified github organization.
```


**Action Parameters**

<ParamField path="delivery_id" type="integer" required={true}>
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_WORKFLOW">
**Tool Name:** Get a workflow

**Description**

```text wordWrap
Retrieves detailed information for a specific github actions workflow in a repository, identified by either its numeric id or its filename.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="workflow_id" type="integer">
</ParamField>

<ParamField path="workflow_name" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_WORKFLOW_RUN">
**Tool Name:** Get a workflow run

**Description**

```text wordWrap
Gets a specific workflow run by its id from a github repository.
```


**Action Parameters**

<ParamField path="exclude_pull_requests" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_A_WORKFLOW_RUN_ATTEMPT">
**Tool Name:** Get a workflow run attempt

**Description**

```text wordWrap
Retrieves detailed information for a specific attempt of a workflow run in a github repository, including its status, conclusion, and timings.
```


**Action Parameters**

<ParamField path="attempt_number" type="integer" required={true}>
</ParamField>

<ParamField path="exclude_pull_requests" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_BRANCH_PROTECTION">
**Tool Name:** Get branch protection

**Description**

```text wordWrap
Retrieves branch protection settings for a specific, existing, and accessible branch in a github repository; protection feature availability varies by github product plan.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_COMMIT_AUTHORS">
**Tool Name:** Get commit authors

**Description**

```text wordWrap
Fetches commit authors identified during a repository import, used to map authors from an external vcs to github accounts.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="since" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_COMMIT_SIGNATURE_PROTECTION">
**Tool Name:** Get commit signature protection

**Description**

```text wordWrap
Gets the commit signature protection status for a branch in a repository.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_COMMUNITY_PROFILE_METRICS">
**Tool Name:** Get community profile metrics

**Description**

```text wordWrap
Retrieves a repository's community profile metrics, including health percentage and the presence of key community files (e.g., readme, license).
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_CONTEXTUAL_INFORMATION_FOR_A_USER">
**Tool Name:** Get contextual information for a user

**Description**

```text wordWrap
Gets contextual hovercard information for a github user; `subject type` and `subject id` can be jointly provided for more specific details.
```


**Action Parameters**

<ParamField path="subject_id" type="string">
</ParamField>

<ParamField path="subject_type" type="string">
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

<Accordion title="GITHUB_GET_DEFAULT_ATTRIBUTES_FOR_A_CODESPACE">
**Tool Name:** Get default attributes for a codespace

**Description**

```text wordWrap
Get pre-flight data (e.g., default location, devcontainer path) for creating a codespace in a given repository (must exist and be accessible), optionally for a specific git ref.
```


**Action Parameters**

<ParamField path="client_ip" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_DEFAULT_WORKFLOW_PERMISSIONS_FOR_AN_ORGANIZATION">
**Tool Name:** Get default workflow permissions for an organization

**Description**

```text wordWrap
Gets the default github token workflow permissions and settings for a github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_DEFAULT_WORKFLOW_PERMISSIONS_FOR_A_REPOSITORY">
**Tool Name:** Get default workflow permissions for a repository

**Description**

```text wordWrap
Gets the default workflow permissions (`read` or `write`) for the github token and whether it can approve pull request reviews in an existing and accessible repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_DETAILS_ABOUT_A_CODESPACE_EXPORT">
**Tool Name:** Get details about a codespace export

**Description**

```text wordWrap
Retrieves detailed information about a specific export of a codespace.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>

<ParamField path="export_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_EMOJIS">
**Tool Name:** Get emojis

**Description**

```text wordWrap
Lists all emojis available for use on github, including custom and unicode emojis.
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

<Accordion title="GITHUB_GET_FEEDS">
**Tool Name:** Get feeds

**Description**

```text wordWrap
Fetches a list of available github feed urls for the authenticated user.
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

<Accordion title="GITHUB_GET_GITHUB_ACTIONS_CACHE_USAGE_FOR_AN_ORGANIZATION">
**Tool Name:** Get GitHub Actions cache usage for an organization

**Description**

```text wordWrap
Retrieves total github actions cache usage statistics for an organization, including active cache count and size across all repositories.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_GITHUB_ACTIONS_CACHE_USAGE_FOR_A_REPOSITORY">
**Tool Name:** Get github actions cache usage for a repository

**Description**

```text wordWrap
Retrieves the total count of active github actions caches and their combined size in bytes for a specified repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_GITHUB_ACTIONS_PERMISSIONS_FOR_AN_ORGANIZATION">
**Tool Name:** Get github actions permissions for an organization

**Description**

```text wordWrap
Gets the github actions permissions for a specified organization, detailing repository enablement and allowed actions policies.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_GITHUB_ACTIONS_PERMISSIONS_FOR_A_REPOSITORY">
**Tool Name:** Get GitHub Actions permissions for a repository

**Description**

```text wordWrap
Gets the github actions permissions policy for a repository, including its enabled status and the scope of allowed actions.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_GITHUB_META_INFORMATION">
**Tool Name:** Get github meta information

**Description**

```text wordWrap
Fetches github's publicly available metadata, useful for configuring network security policies or ip allow-listing.
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

<Accordion title="GITHUB_GET_GITHUB_PAGES_BUILD">
**Tool Name:** Get github pages build

**Description**

```text wordWrap
Retrieves detailed information about a specific github pages build for a repository, which must have github pages enabled.
```


**Action Parameters**

<ParamField path="build_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_INFORMATION_ABOUT_A_SARIF_UPLOAD">
**Tool Name:** Get information about a sarif upload

**Description**

```text wordWrap
Retrieves detailed information, including processing status and results url, about a specific sarif (static analysis results interchange format) upload for a repository, uniquely identified by its sarif id.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sarif_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_INTERACTION_RESTRICTIONS_FOR_AN_ORGANIZATION">
**Tool Name:** Get interaction restrictions for an organization

**Description**

```text wordWrap
Retrieves interaction restrictions for an organization, showing which github user types can interact with its public repositories and when restrictions expire; returns an empty response if no restrictions are set.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_INTERACTION_RESTRICTIONS_FOR_A_REPOSITORY">
**Tool Name:** Get interaction restrictions for a repository

**Description**

```text wordWrap
Retrieves active interaction restrictions for a repository, detailing which user groups are limited from activities like commenting or creating pull requests, and when these restrictions expire.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_INTERACTION_RESTRICTIONS_FOR_YOUR_PUBLIC_REPOSITORIES">
**Tool Name:** Get interaction restrictions for public repositories

**Description**

```text wordWrap
Retrieves currently active interaction restrictions for the authenticated user's public repositories.
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

<Accordion title="GITHUB_GET_LARGE_FILES">
**Tool Name:** Get large files

**Description**

```text wordWrap
Lists files larger than 100mb identified during a previous source import for the specified repository; this endpoint is deprecated and will be removed on april 12, 2024.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_LATEST_PAGES_BUILD">
**Tool Name:** Get latest pages build

**Description**

```text wordWrap
Retrieves information about the most recent github pages build for a repository, which must exist, be accessible, have github pages enabled, and have at least one prior build.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_OCTOCAT">
**Tool Name:** Get octocat

**Description**

```text wordWrap
Fetches an ascii art representation of github's octocat, suitable for text-based displays.
```


**Action Parameters**

<ParamField path="s" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ORG_ALLOWED_ACTIONS">
**Tool Name:** Get allowed actions and workflows for an org

**Description**

```text wordWrap
Retrieves the github actions permissions policy, including allowed actions and reusable workflows, for a specified organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_ORG_DEV_ENVIRONMENT_SECRET_SAFELY">
**Tool Name:** Get org dev environment secret safely

**Description**

```text wordWrap
Retrieves metadata for a specific secret available to an organization's github codespaces without exposing its encrypted value.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_PAGE_VIEWS">
**Tool Name:** Get page views

**Description**

```text wordWrap
Retrieves page view statistics for a repository over the last 14 days, including total views, unique visitors, and a daily or weekly breakdown.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="per" type="string" default="day">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_PENDING_DEPLOYMENTS_FOR_A_WORKFLOW_RUN">
**Tool Name:** Get pending deployments for a workflow run

**Description**

```text wordWrap
Retrieves pending deployment environments for a specific workflow run that are awaiting approval due to protection rules.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_PROJECT_PERMISSION_FOR_A_USER">
**Tool Name:** Get project permission for a user

**Description**

```text wordWrap
Retrieves a collaborator's permission level (admin, write, read, or none) for an existing github project.
```


**Action Parameters**

<ParamField path="project_id" type="integer" required={true}>
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

<Accordion title="GITHUB_GET_PUBLIC_KEY_FOR_SECRET_ENCRYPTION">
**Tool Name:** Get public key for secret encryption

**Description**

```text wordWrap
Retrieves a repository's public key for encrypting github codespaces secrets; requires `repo` scope or equivalent read access to codespaces secrets for private repositories.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_PUBLIC_KEY_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Get public key for the authenticated user

**Description**

```text wordWrap
Retrieves the authenticated user's public github key, used to encrypt secrets for github codespaces.
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

<Accordion title="GITHUB_GET_PULL_REQUEST_REVIEW_PROTECTION">
**Tool Name:** Get pull request review protection

**Description**

```text wordWrap
Retrieves the pull request review protection settings for a specific branch in a github repository, if such protection is configured.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_RATE_LIMIT_STATUS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Get rate limit status for the authenticated user

**Description**

```text wordWrap
Retrieves the authenticated user's current github api rate limit status, including usage and limits across different resource categories.
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

<Accordion title="GITHUB_GET_REPO_DEV_ENV_SECRET">
**Tool Name:** Get repository development environment secret

**Description**

```text wordWrap
Gets metadata (name, creation/update timestamps) for a specific, existing development environment secret (codespaces secret) in a repository, without exposing its value.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_REPOSITORY_CLONES">
**Tool Name:** Get repository clones

**Description**

```text wordWrap
Retrieves the total number of clones and a breakdown of clone activity (daily or weekly) for a specified repository over the preceding 14 days.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="per" type="string" default="day">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_REPOSITORY_CONTENT">
**Tool Name:** Get repository content

**Description**

```text wordWrap
Retrieves a file's base64 encoded content or a directory's metadata (but not a listing of its contents) from a github repository path.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_REPOSITORY_PERMISSIONS_FOR_A_USER">
**Tool Name:** Get repository permissions for a user

**Description**

```text wordWrap
Retrieves a specific user's permission level ('admin', 'write', 'read', or 'none') for a given repository, where 'maintain' role is reported as 'write' and 'triage' as 'read'.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_GET_REPOSITORY_SECRET_SECURELY">
**Tool Name:** Get repository secret securely

**Description**

```text wordWrap
Retrieves metadata for an existing dependabot secret in a repository, without exposing its encrypted value.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_RULES_FOR_A_BRANCH">
**Tool Name:** Get rules for a branch

**Description**

```text wordWrap
Retrieves all active rules for a specific branch in a github repository, excluding rules in 'evaluate' or 'disabled' status.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_SINGLE_ORG_SECRET_WITHOUT_DECRYPTION">
**Tool Name:** Get single org secret without decryption

**Description**

```text wordWrap
Retrieves metadata (e.g., name, creation/update timestamps, visibility) for an organization's dependabot secret, without its encrypted value.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_STATUS_CHECKS_PROTECTION">
**Tool Name:** Get status checks protection

**Description**

```text wordWrap
Retrieves the status check protection settings for a specific branch in a github repository, if status check protection is enabled for it.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_TEAM_MEMBERSHIP_FOR_A_USER">
**Tool Name:** Get team membership for a user

**Description**

```text wordWrap
Retrieves a user's role and membership status within a specific team in an organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
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

<Accordion title="GITHUB_GET_TEAMS_WITH_ACCESS_TO_THE_PROTECTED_BRANCH">
**Tool Name:** Get teams with access to the protected branch

**Description**

```text wordWrap
Lists teams with explicit push access to a protected branch, provided team restrictions are configured in the branch's protection settings; returns an empty list otherwise.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_AUTHENTICATED_USER">
**Tool Name:** Get the authenticated user

**Description**

```text wordWrap
Gets the profile information for the currently authenticated github user, including potentially private details based on user settings.
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

<Accordion title="GITHUB_GET_THE_COMBINED_STATUS_FOR_A_SPECIFIC_REFERENCE">
**Tool Name:** Get the combined status for a specific reference

**Description**

```text wordWrap
Retrieves the aggregated commit status (e.g., success, failure, pending) from all checks for a specific reference (sha, branch, or tag) in a github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_HOURLY_COMMIT_COUNT_FOR_EACH_DAY">
**Tool Name:** Get the hourly commit count for each day

**Description**

```text wordWrap
Retrieves the 'punch card' data, showing hourly commit counts for each day of the week for an existing and accessible repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_LAST_YEAR_OF_COMMIT_ACTIVITY">
**Tool Name:** Get the last year of commit activity

**Description**

```text wordWrap
Fetches weekly commit totals and daily commit counts for the last 52 weeks for a specified github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_LATEST_RELEASE">
**Tool Name:** Get the latest release

**Description**

```text wordWrap
Fetches the latest official (non-prerelease, non-draft) release for a github repository; requires at least one such published release.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_LICENSE_FOR_A_REPOSITORY">
**Tool Name:** Get the license for a repository

**Description**

```text wordWrap
Retrieves the license file and its details for a repository, optionally from a specific git reference (branch, tag, or commit sha).
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_REVIEW_HISTORY_FOR_A_WORKFLOW_RUN">
**Tool Name:** Get the review history for a workflow run

**Description**

```text wordWrap
Retrieves the detailed approval history for a specific workflow run in a github repository, detailing each review's environment, state, reviewer, and comments, to track the approval process for workflows, particularly automated deployments.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_STATUS_OF_A_GITHUB_PAGES_DEPLOYMENT">
**Tool Name:** Get the status of a GitHub Pages deployment

**Description**

```text wordWrap
Retrieves the status of a specific github pages deployment for a repository, which must have github pages enabled.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pages_deployment_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_WEEKLY_COMMIT_ACTIVITY">
**Tool Name:** Get the weekly commit activity

**Description**

```text wordWrap
Fetches the weekly commit activity (additions and deletions per week) for a repository over the past year; best for repositories with under 10,000 commits.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_WEEKLY_COMMIT_COUNT">
**Tool Name:** Get the weekly commit count

**Description**

```text wordWrap
Retrieves the weekly commit count for a repository, detailing commits by the owner and all contributors over the last 52 weeks; github may return a 202 status or an empty response if statistics are being computed.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_THE_ZEN_OF_GITHUB">
**Tool Name:** Get the zen of github

**Description**

```text wordWrap
Retrieves a random quote from github's 'zen of github' collection, reflecting github's design philosophies and offering humorous insights, useful for displaying github wisdom or a lighthearted message.
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

<Accordion title="GITHUB_GET_TOP_REFERRAL_PATHS">
**Tool Name:** Get top referral paths

**Description**

```text wordWrap
Fetches the top 10 most viewed content paths for a repository from the last 14 days.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_TOP_REFERRAL_SOURCES">
**Tool Name:** Get top referral sources

**Description**

```text wordWrap
Fetches the top 10 websites that referred traffic to a repository within the last 14 days.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_USERS_WITH_ACCESS_TO_THE_PROTECTED_BRANCH">
**Tool Name:** Get users with access to the protected branch

**Description**

```text wordWrap
Lists users with explicit push access to a protected branch, provided its protection rule restricts pushes to specific users.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_WORKFLOW_EXTERNAL_ACCESS">
**Tool Name:** Get workflow external access level

**Description**

```text wordWrap
Gets the access level settings for a private repository, determining how workflows outside this repository can use its actions and reusable workflows.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_WORKFLOW_RUN_USAGE">
**Tool Name:** Get workflow run usage

**Description**

```text wordWrap
Gets the billable time, in milliseconds, for a specific workflow run, detailing time spent on various operating systems.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GET_WORKFLOW_USAGE">
**Tool Name:** Get workflow usage

**Description**

```text wordWrap
Gets the billable time (in milliseconds, broken down by runner os) for a specific workflow within a repository for the current billing cycle.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="workflow_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GIST_S_CREATE">
**Tool Name:** Create a gist

**Description**

```text wordWrap
Deprecated: use `create a gist` instead. creates a new github gist with specified files, content, an optional description, and public visibility.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="files" type="object" required={true}>
</ParamField>

<ParamField path="public" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GIST_S_LIST_PUBLIC">
**Tool Name:** List public gists

**Description**

```text wordWrap
(deprecated: use `list public gists` instead) lists public gists from github, optionally filtering by a 'since' timestamp and supporting pagination; results are generally newest first.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GITHUB_API_ROOT">
**Tool Name:** Get GitHub API root

**Description**

```text wordWrap
Retrieves a map of all top-level github rest api resource urls and their templates.
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

<Accordion title="GITHUB_GITHUB_GET_REPO_ALLOWED_ACTIONS">
**Tool Name:** Get allowed actions and workflows for a repository

**Description**

```text wordWrap
Gets the settings for allowed actions and reusable workflows that can be run in the specified repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_GITHUB_SET_REPO_RUNNER_LABELS">
**Tool Name:** Set custom labels for repo runner

**Description**

```text wordWrap
Replaces all custom labels for a specific self-hosted runner in a repository; an empty list for `labels` removes all existing custom labels.
```


**Action Parameters**

<ParamField path="labels" type="array" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ISSUES_CREATE">
**Tool Name:** Create an issue

**Description**

```text wordWrap
(deprecated: use `create an issue` instead) creates a new issue in a github repository, provided issues are enabled and the user has sufficient permissions.
```


**Action Parameters**

<ParamField path="assignee" type="string">
</ParamField>

<ParamField path="assignees" type="array">
</ParamField>

<ParamField path="body" type="string">
</ParamField>

<ParamField path="labels" type="array">
</ParamField>

<ParamField path="milestone" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_ISSUES_CREATE_COMMENT">
**Tool Name:** Create an issue comment

**Description**

```text wordWrap
Deprecated: use `create an issue comment` to create a comment on an existing github issue or pull request.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ISSUES_GET">
**Tool Name:** Get an issue

**Description**

```text wordWrap
Deprecated: use the `get an issue` action instead to retrieve details for a specific issue in a repository.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ISSUES_LIST_ASSIGN_EES">
**Tool Name:** List assignees

**Description**

```text wordWrap
Deprecated: use `list assignees`. lists users who can be assigned to issues in a repository, typically those with push access.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ISSUES_LIST_EVENTS_FOR_REPO">
**Tool Name:** List issue events for a repository

**Description**

```text wordWrap
Lists all issue events for a specified repository. <<deprecated: this action is deprecated. use `list issue events for a repository` instead.>>
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_ISSUES_LIST_FOR_REPO">
**Tool Name:** List repository issues

**Description**

```text wordWrap
Lists all issues (including pull requests) in a github repository; deprecated: use list repository issues.
```


**Action Parameters**

<ParamField path="assignee" type="string">
</ParamField>

<ParamField path="creator" type="string">
</ParamField>

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="labels" type="string">
</ParamField>

<ParamField path="mentioned" type="string">
</ParamField>

<ParamField path="milestone" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ACCEPTED_ASSIGNMENTS_FOR_AN_ASSIGNMENT">
**Tool Name:** List accepted assignments for an assignment

**Description**

```text wordWrap
Lists accepted assignments (student repositories created after acceptance) for an existing github classroom assignment, identified by its unique `assignment id`.
```


**Action Parameters**

<ParamField path="assignment_id" type="integer" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_APP_INSTALLATIONS_ACCESSIBLE_TO_THE_USER_ACCESS_TOKEN">
**Tool Name:** List app installations for user token

**Description**

```text wordWrap
Lists github app installations accessible to the authenticated user via their access token, including installation details, permissions, and repository access.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ARTIFACTS_FOR_A_REPOSITORY">
**Tool Name:** List artifacts for a repository

**Description**

```text wordWrap
Lists github actions workflow artifacts for a specified repository, which must exist.
```


**Action Parameters**

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ASSIGNED_ISSUES">
**Tool Name:** List assigned issues for authenticated user

**Description**

```text wordWrap
Lists github issues for the authenticated user, defaulting to 'assigned' but filterable by other interactions, state, labels, and time, with sorting and pagination.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="filter" type="string" default="assigned">
</ParamField>

<ParamField path="labels" type="string">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ASSIGNEES">
**Tool Name:** List assignees

**Description**

```text wordWrap
Lists users who can be assigned to issues in a repository, typically those with push access.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ASSIGNMENTS_FOR_A_CLASSROOM">
**Tool Name:** List assignments for a classroom

**Description**

```text wordWrap
Lists all assignments for a given github classroom `classroom id`; the classroom must exist and be accessible.
```


**Action Parameters**

<ParamField path="classroom_id" type="integer" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_AVAILABLE_MACHINE_TYPES_FOR_A_REPOSITORY">
**Tool Name:** List available machine types for a repository

**Description**

```text wordWrap
Lists machine types available for github codespaces in a repository, optionally using a git ref to check compatibility based on prebuild availability and devcontainer configurations.
```


**Action Parameters**

<ParamField path="client_ip" type="string">
</ParamField>

<ParamField path="location" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_BRANCHES">
**Tool Name:** List branches

**Description**

```text wordWrap
Lists branches for an existing github repository, with an option to filter by protection status.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="protected" type="boolean">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_BRANCHES_FOR_HEAD_COMMIT">
**Tool Name:** List branches for head commit

**Description**

```text wordWrap
Lists branches in an accessible repository where the provided commit sha is the head, useful for identifying development lines based on that commit.
```


**Action Parameters**

<ParamField path="commit_sha" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CHECK_RUN_ANNOTATIONS">
**Tool Name:** List check run annotations

**Description**

```text wordWrap
Lists annotations for a specific check run in a github repository, detailing issues like errors or warnings on particular code lines.
```


**Action Parameters**

<ParamField path="check_run_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CHECK_RUNS_FOR_A_GIT_REFERENCE">
**Tool Name:** List check runs for a git reference

**Description**

```text wordWrap
Lists check runs for a given git reference within a repository; ensure the reference exists and the repository is accessible.
```


**Action Parameters**

<ParamField path="app_id" type="integer">
</ParamField>

<ParamField path="check_name" type="string">
</ParamField>

<ParamField path="filter" type="string" default="latest">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_LIST_CHECK_RUNS_IN_A_CHECK_SUITE">
**Tool Name:** List check runs in a check suite

**Description**

```text wordWrap
Lists check runs for a specific check suite in a github repository, optionally filtering by check name or status.
```


**Action Parameters**

<ParamField path="check_name" type="string">
</ParamField>

<ParamField path="check_suite_id" type="integer" required={true}>
</ParamField>

<ParamField path="filter" type="string" default="latest">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_LIST_CHECK_SUITES_FOR_A_GIT_REFERENCE">
**Tool Name:** List check suites for a git reference

**Description**

```text wordWrap
Lists check suites for a git reference (commit sha, branch, or tag) in a repository, optionally filtering by github app id or check run name.
```


**Action Parameters**

<ParamField path="app_id" type="integer">
</ParamField>

<ParamField path="check_name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CHILD_TEAMS">
**Tool Name:** List child teams

**Description**

```text wordWrap
Lists the immediate child teams of a parent team within an organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CLASSROOMS">
**Tool Name:** List classrooms

**Description**

```text wordWrap
Lists github classrooms to which the authenticated user has administrative access.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CODEOWNERS_ERRORS">
**Tool Name:** List codeowners errors

**Description**

```text wordWrap
Lists syntax errors in a repository's codeowners file, which must be located at the root, `.github/`, or `docs/` directory for the specified ref.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CODE_QL_DATABASES_FOR_A_REPOSITORY">
**Tool Name:** List CodeQL databases for a repository

**Description**

```text wordWrap
Lists all codeql databases for a repository where codeql analysis has been previously run and completed.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CODE_SCANNING_ALERTS_FOR_AN_ORGANIZATION">
**Tool Name:** List code scanning alerts for an organization

**Description**

```text wordWrap
Lists code scanning alerts for a github organization; use either `tool name` or `tool guid` if filtering by tool, not both.
```


**Action Parameters**

<ParamField path="after" type="string">
</ParamField>

<ParamField path="before" type="string">
</ParamField>

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="severity" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string">
</ParamField>

<ParamField path="tool_guid" type="string">
</ParamField>

<ParamField path="tool_name" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CODE_SCANNING_ALERTS_FOR_A_REPOSITORY">
**Tool Name:** List code scanning alerts for a repository

**Description**

```text wordWrap
Lists code scanning alerts for a repository, optionally filtering by tool (which must have produced scan results for the repository), git reference, state, or severity.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="severity" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string">
</ParamField>

<ParamField path="tool_guid" type="string">
</ParamField>

<ParamField path="tool_name" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CODE_SCANNING_ANALYSES_FOR_A_REPOSITORY">
**Tool Name:** List code scanning analyses for a repository

**Description**

```text wordWrap
Lists code scanning analyses for an existing repository, optionally filtering by tool (name or guid), git reference, or sarif id.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sarif_id" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="tool_guid" type="string">
</ParamField>

<ParamField path="tool_name" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CODESPACES_FOR_A_USER_IN_ORGANIZATION">
**Tool Name:** List codespaces for a user in organization

**Description**

```text wordWrap
Lists all github codespaces owned by a specified member of a given organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_CODESPACES_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List codespaces for the authenticated user

**Description**

```text wordWrap
Lists github codespaces for the authenticated user, optionally filtering by repository id and supporting pagination.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repository_id" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CODESPACES_FOR_THE_ORGANIZATION">
**Tool Name:** List codespaces for the organization

**Description**

```text wordWrap
Lists active/pending github codespaces for an existing organization; admins list all, members list their own.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_COMMENTS_FOR_A_PULL_REQUEST_REVIEW">
**Tool Name:** List comments for a pull request review

**Description**

```text wordWrap
Lists all comments for a specific review on a github pull request.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="review_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_COMMIT_COMMENTS">
**Tool Name:** List commit comments

**Description**

```text wordWrap
Retrieves all comments for a specific commit in a github repository, supporting pagination.
```


**Action Parameters**

<ParamField path="commit_sha" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_COMMIT_COMMENTS_FOR_A_REPOSITORY">
**Tool Name:** List commit comments for a repository

**Description**

```text wordWrap
Lists all commit comments for a specified repository, which must exist and be accessible.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_COMMITS">
**Tool Name:** List commits

**Description**

```text wordWrap
Retrieves commits for a repository, optionally filtering by sha (must be valid commit sha or existing branch), path, author, committer, or date range.
```


**Action Parameters**

<ParamField path="author" type="string">
</ParamField>

<ParamField path="committer" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="path" type="string">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string">
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="until" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_COMMITS_ON_A_PULL_REQUEST">
**Tool Name:** List commits on a pull request

**Description**

```text wordWrap
Lists commits for a pull request; requires the repository and pull request to exist and be accessible, and supports pagination.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_COMMIT_STATUSES_FOR_A_REFERENCE">
**Tool Name:** List commit statuses for a reference

**Description**

```text wordWrap
Lists commit statuses for a specific reference (commit sha, branch, or tag) in a repository, useful for tracking ci/test outcomes.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_CUSTOM_PROPERTY_VALUES_FOR_ORGANIZATION_REPOSITORIES">
**Tool Name:** List custom property values for organization repositories

**Description**

```text wordWrap
Lists custom property values for repositories in a specified, existing organization, optionally filtered by a repository query.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repository_query" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_DELIVERIES_FOR_AN_ORGANIZATION_WEBHOOK">
**Tool Name:** List deliveries for an organization webhook

**Description**

```text wordWrap
Retrieves a list of webhook deliveries for a specific webhook in an organization, allowing inspection of delivery history and details.
```


**Action Parameters**

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="redelivery" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_DELIVERIES_FOR_A_REPOSITORY_WEBHOOK">
**Tool Name:** List deliveries for a repository webhook

**Description**

```text wordWrap
Retrieves delivery attempts for a specific repository webhook to inspect its history; ensure the webhook id exists.
```


**Action Parameters**

<ParamField path="cursor" type="string">
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="redelivery" type="boolean">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_DEPLOY_KEYS">
**Tool Name:** List deploy keys

**Description**

```text wordWrap
Lists deploy ssh keys for a specified repository; the repository must exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_DEPLOYMENT_BRANCH_POLICIES">
**Tool Name:** List deployment branch policies

**Description**

```text wordWrap
Lists all deployment branch policies for a specified environment in a github repository.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_DEPLOYMENTS">
**Tool Name:** List deployments

**Description**

```text wordWrap
Lists deployments for a specified repository; repository must exist.
```


**Action Parameters**

<ParamField path="environment" type="string" default="none">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string" default="none">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string" default="none">
</ParamField>

<ParamField path="task" type="string" default="none">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_DEPLOYMENT_STATUSES">
**Tool Name:** List deployment statuses

**Description**

```text wordWrap
Lists all statuses for a given deployment in a repository.
```


**Action Parameters**

<ParamField path="deployment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_DISCUSSION_COMMENTS">
**Tool Name:** List discussion comments

**Description**

```text wordWrap
Lists all comments for a specific team discussion within an organization.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_DISCUSSIONS">
**Tool Name:** List discussions

**Description**

```text wordWrap
Lists discussions for a specific team within an organization, with options for sorting, pagination, and filtering by pinned status.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="pinned" type="string">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_EMAIL_ADDRESSES_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List email addresses for the authenticated user

**Description**

```text wordWrap
Lists all email addresses for the authenticated user, including their primary status, verification status, and visibility.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ENVIRONMENT_CUSTOM_DEPLOYMENT_RULES">
**Tool Name:** List environment custom deployment rules

**Description**

```text wordWrap
Lists all custom deployment protection rule integrations for a repository environment; the `environment name` must be url-encoded.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ENVIRONMENTS">
**Tool Name:** List environments

**Description**

```text wordWrap
Retrieves all deployment environments for a specified repository, which are used to configure protection rules and secrets for different software lifecycle stages.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ENVIRONMENT_SECRETS">
**Tool Name:** List environment secrets

**Description**

```text wordWrap
Lists the names and metadata (not values) of secrets for a specified, existing environment within an existing github repository.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ENVIRONMENT_VARIABLES">
**Tool Name:** List environment variables

**Description**

```text wordWrap
Lists all environment variables, which are plaintext key-value pairs for github actions workflows, for a specified environment within a github repository.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="10">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_EVENTS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List events for the authenticated user

**Description**

```text wordWrap
Lists public events for the specified github user, or private events if authenticated as that user, in reverse chronological order.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_EVENTS_RECEIVED_BY_THE_AUTHENTICATED_USER">
**Tool Name:** List events received by the authenticated user

**Description**

```text wordWrap
Lists events a specific github user received from followed users and watched repositories; returns private events if authenticated for `username`, otherwise public.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_FOLLOWERS_OF_A_USER">
**Tool Name:** List followers of a user

**Description**

```text wordWrap
Lists followers for a specified, existing github user.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_FOLLOWERS_OF_THE_AUTHENTICATED_USER">
**Tool Name:** List followers of the authenticated user

**Description**

```text wordWrap
Lists users following the authenticated github user, returning an empty list if the user has no followers.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_FORKS">
**Tool Name:** List forks

**Description**

```text wordWrap
Lists forks for a specified repository, which must exist, with options for sorting and pagination.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string" default="newest">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_GIST_COMMENTS">
**Tool Name:** List gist comments

**Description**

```text wordWrap
Lists comments for a specified github gist.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_GIST_COMMITS">
**Tool Name:** List gist commits

**Description**

```text wordWrap
Lists all commits for a specified gist.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_GIST_FORKS">
**Tool Name:** List gist forks

**Description**

```text wordWrap
Lists all forks for a given github gist id.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_GISTS_FOR_A_USER">
**Tool Name:** List gists for a user

**Description**

```text wordWrap
Lists public gists for a specified github user.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="string">
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

<Accordion title="GITHUB_LIST_GISTS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List gists for the authenticated user

**Description**

```text wordWrap
Lists gists for the authenticated user, with optional filtering by update time and pagination.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_GITHUB_ACTIONS_CACHES_FOR_A_REPOSITORY">
**Tool Name:** List github actions caches for a repository

**Description**

```text wordWrap
Lists github actions caches for a repository, with options to filter by git reference or cache key, and to sort and paginate results.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="key" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string" default="last_accessed_at">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_GITHUB_PAGES_BUILDS">
**Tool Name:** List GitHub Pages builds

**Description**

```text wordWrap
Lists github pages builds for a repository; github pages must be enabled on the repository for builds to be listed.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_GLOBAL_SECURITY_ADVISORIES">
**Tool Name:** List global security advisories

**Description**

```text wordWrap
Lists github's global security advisories, filterable by various attributes including id, type, ecosystem, severity, and dates.
```


**Action Parameters**

<ParamField path="affects" type="array">
</ParamField>

<ParamField path="after" type="string">
</ParamField>

<ParamField path="before" type="string">
</ParamField>

<ParamField path="cve_id" type="string">
</ParamField>

<ParamField path="cwes" type="array">
</ParamField>

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="ecosystem" type="string">
</ParamField>

<ParamField path="ghsa_id" type="string">
</ParamField>

<ParamField path="is_withdrawn" type="boolean">
</ParamField>

<ParamField path="modified" type="string">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="published" type="string">
</ParamField>

<ParamField path="severity" type="string">
</ParamField>

<ParamField path="sort" type="string" default="published">
</ParamField>

<ParamField path="type" type="string" default="reviewed">
</ParamField>

<ParamField path="updated" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_INSTALLATION_REQUESTS_FOR_THE_AUTHENTICATED_APP">
**Tool Name:** List installation requests for the authenticated app

**Description**

```text wordWrap
Lists pending installation requests made by users or organizations for the authenticated github app.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_INSTANCES_OF_A_CODE_SCANNING_ALERT">
**Tool Name:** List instances of a code scanning alert

**Description**

```text wordWrap
Lists all instances of a specific code scanning alert, optionally filtered by git ref; requires code scanning to be enabled on the repository.
```


**Action Parameters**

<ParamField path="alert_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ISSUE_COMMENTS">
**Tool Name:** List issue comments

**Description**

```text wordWrap
Lists comments for a specified issue in a github repository.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="since" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ISSUE_COMMENTS_FOR_A_REPOSITORY">
**Tool Name:** List issue comments for a repository

**Description**

```text wordWrap
Lists issue comments, including those on pull requests, for an accessible repository.
```


**Action Parameters**

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ISSUE_EVENTS">
**Tool Name:** List issue events

**Description**

```text wordWrap
Retrieves a list of all events for a specific issue within a github repository.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ISSUE_EVENTS_FOR_A_REPOSITORY">
**Tool Name:** List issue events for a repository

**Description**

```text wordWrap
Lists all issue events (e.g., closed, reopened, assigned) for a specified repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ISSUES_ASSIGNED_TO_THE_AUTHENTICATED_USER">
**Tool Name:** List issues for user

**Description**

```text wordWrap
Lists github issues for the authenticated user across visible repositories, with filtering by user relationship, state, labels, an iso 8601 `since` timestamp (yyyy-mm-ddthh:mm:ssz), and sorting options; pull requests are typically included.
```


**Action Parameters**

<ParamField path="collab" type="boolean">
</ParamField>

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="filter" type="string" default="assigned">
</ParamField>

<ParamField path="labels" type="string">
</ParamField>

<ParamField path="orgs" type="boolean">
</ParamField>

<ParamField path="owned" type="boolean">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="pulls" type="boolean">
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_JOBS_FOR_A_WORKFLOW_RUN">
**Tool Name:** List jobs for a workflow run

**Description**

```text wordWrap
Lists jobs for a specific workflow run in a github repository.
```


**Action Parameters**

<ParamField path="filter" type="string" default="latest">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_JOBS_FOR_A_WORKFLOW_RUN_ATTEMPT">
**Tool Name:** List jobs for a workflow run attempt

**Description**

```text wordWrap
Lists jobs, including details like id, status, and steps, for a specific attempt of a github actions workflow run.
```


**Action Parameters**

<ParamField path="attempt_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_LABELS_FOR_AN_ISSUE">
**Tool Name:** List labels for an issue

**Description**

```text wordWrap
Lists all labels for a specified issue in a github repository.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_LABELS_FOR_A_REPOSITORY">
**Tool Name:** List labels for a repository

**Description**

```text wordWrap
Retrieves all labels for a specified, existing github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_LABELS_FOR_A_SELF_HOSTED_RUNNER_FOR_AN_ORGANIZATION">
**Tool Name:** List labels for a self-hosted runner for an organization

**Description**

```text wordWrap
Lists all labels assigned to a specific self-hosted runner within a github organization, which are used to route workflows.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_LABELS_FOR_A_SELF_HOSTED_RUNNER_FOR_A_REPOSITORY">
**Tool Name:** List labels for a self-hosted runner for a repository

**Description**

```text wordWrap
Lists all labels assigned to a specific self-hosted runner registered with the given repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_LABELS_FOR_ISSUES_IN_A_MILESTONE">
**Tool Name:** List labels for issues in a milestone

**Description**

```text wordWrap
Lists all labels for issues within a specific milestone in a repository.
```


**Action Parameters**

<ParamField path="milestone_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_MACHINE_TYPES_FOR_A_CODESPACE">
**Tool Name:** List machine types for a codespace

**Description**

```text wordWrap
Lists available machine types for a specific, accessible codespace, enabling it to be transitioned to a new hardware configuration.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_MATCHING_REFERENCES">
**Tool Name:** List matching references

**Description**

```text wordWrap
Lists all git references (branches or tags) in a repository that start with the provided partial reference path (e.g., `heads/my-feature` or `tags/v1.2`).
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_MILESTONES">
**Tool Name:** List milestones

**Description**

```text wordWrap
Lists milestones, which track progress for groups of issues and pull requests, for an existing repository, allowing filtering by state and sorting.
```


**Action Parameters**

<ParamField path="direction" type="string" default="asc">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string" default="due_on">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_NOTIFICATIONS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List notifications for the authenticated user

**Description**

```text wordWrap
Lists notifications for the authenticated user, sorted by most recent update, with filtering and pagination options.
```


**Action Parameters**

<ParamField path="all" type="boolean">
</ParamField>

<ParamField path="before" type="string">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="participating" type="boolean">
</ParamField>

<ParamField path="per_page" type="integer" default="50">
</ParamField>

<ParamField path="since" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORGANIZATION_EVENTS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List organization events for the authenticated user

**Description**

```text wordWrap
Lists events within a specified organization that were performed by the authenticated user, whose `username` (path parameter) must match the api request credentials.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_ORGANIZATION_MEMBERS">
**Tool Name:** List organization members

**Description**

```text wordWrap
Lists public and concealed members of a github organization; viewing concealed members requires authenticated user to be an organization member.
```


**Action Parameters**

<ParamField path="filter" type="string" default="all">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="role" type="string" default="all">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORGANIZATION_PROJECTS">
**Tool Name:** List organization projects

**Description**

```text wordWrap
Lists projects for a specified github organization, optionally filtering by state and supporting pagination.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORGANIZATION_REPOSITORIES">
**Tool Name:** List organization repositories

**Description**

```text wordWrap
Retrieves a list of repositories for a specified github organization, allowing filtering by type and sorting.
```


**Action Parameters**

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="type" type="string" default="all">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORGANIZATIONS">
**Tool Name:** List organizations

**Description**

```text wordWrap
Lists github organizations for the authenticated user, sorted by id in ascending order.
```


**Action Parameters**

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORGANIZATION_SECRETS">
**Tool Name:** List organization secrets

**Description**

```text wordWrap
Lists github actions secrets available for a specified organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORGANIZATIONS_FOR_A_USER">
**Tool Name:** List organizations for a user

**Description**

```text wordWrap
Lists public organizations for a specified github user; the `username` must be a valid github handle.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_ORGANIZATIONS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List organizations for the authenticated user

**Description**

```text wordWrap
Lists organizations the authenticated github user is a member of, returning details for each organization.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORGANIZATION_VARIABLES">
**Tool Name:** List organization variables

**Description**

```text wordWrap
Lists all github actions variables for a specified organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="10">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORGANIZATION_WEBHOOKS">
**Tool Name:** List organization webhooks

**Description**

```text wordWrap
Lists all webhooks for a specified github organization; the organization must exist.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORG_FINE_GRAINED_PERMISSIONS">
**Tool Name:** List organization fine-grained permissions

**Description**

```text wordWrap
Retrieves all fine-grained permissions for a specified github organization, essential for creating or updating custom roles.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORG_ISSUES_FOR_USER">
**Tool Name:** List organization issues assigned to the authenticated user

**Description**

```text wordWrap
Lists issues for the authenticated user within a specified github organization, with options to filter by involvement type, state, labels, and to sort results.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="filter" type="string" default="assigned">
</ParamField>

<ParamField path="labels" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORG_LEVEL_CODESPACES_SECRETS">
**Tool Name:** List org level codespaces secrets

**Description**

```text wordWrap
Lists all codespaces secrets available for a specified organization, which must exist.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORG_PACKAGE_VERSIONS">
**Tool Name:** List package versions for an organization package

**Description**

```text wordWrap
Lists all versions for a specified package, if it exists and is owned by the given github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="state" type="string" default="active">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORG_REPOS_WITHGITHUB_ACTIONS_ENABLED">
**Tool Name:** List organization repositories with Github Actions enabled

**Description**

```text wordWrap
Lists repositories in an organization with github actions enabled, for use when the organization's policy restricts actions to a specific list of repositories rather than enabling it for all.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORG_RESOURCE_ACCESS_TOKENS">
**Tool Name:** List org resource access tokens

**Description**

```text wordWrap
Lists approved fine-grained personal access tokens (pats) with access to resources in a github organization, optionally filtering by owner, repository, permissions, or last usage time.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="last_used_after" type="string">
</ParamField>

<ParamField path="last_used_before" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="array">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="permission" type="string">
</ParamField>

<ParamField path="repository" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created_at">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORG_RESOURCES_WITH_PERSONAL_TOKENS">
**Tool Name:** List org resources with personal tokens

**Description**

```text wordWrap
Retrieves a list of an organization's fine-grained personal access token requests (pending, approved, or denied), with options for filtering and sorting.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="last_used_after" type="string">
</ParamField>

<ParamField path="last_used_before" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="array">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="permission" type="string">
</ParamField>

<ParamField path="repository" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created_at">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_ORG_SECRETS_WITHOUT_VALUES">
**Tool Name:** List organization Dependabot secrets without values

**Description**

```text wordWrap
Lists all dependabot secrets (metadata like names, creation/update timestamps, but not their encrypted values) for a specified organization, which must exist.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_OUTSIDE_COLLABORATORS_FOR_AN_ORGANIZATION">
**Tool Name:** List outside collaborators for an organization

**Description**

```text wordWrap
Lists outside collaborators for a github organization, with options to filter (e.g., by 2fa status) and paginate results.
```


**Action Parameters**

<ParamField path="filter" type="string" default="all">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_OWNED_PACKAGE_VERSIONS">
**Tool Name:** List owned package versions

**Description**

```text wordWrap
Lists all versions for an existing package owned by the authenticated user, identified by its type and name.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="state" type="string" default="active">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PACKAGES_FOR_AN_ORGANIZATION">
**Tool Name:** List packages for an organization

**Description**

```text wordWrap
Lists github packages for an organization, noting specific interpretations for package type and visibility parameters.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

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

<Accordion title="GITHUB_LIST_PACKAGES_FOR_A_USER">
**Tool Name:** List packages for a user

**Description**

```text wordWrap
Lists packages for a specified github user, filterable by package type and visibility.
```


**Action Parameters**

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="username" type="string" required={true}>
</ParamField>

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

<Accordion title="GITHUB_LIST_PACKAGES_FOR_THE_AUTHENTICATED_USER_S_NAMESPACE">
**Tool Name:** List packages for the authenticated user's namespace

**Description**

```text wordWrap
Lists packages of a specific type and visibility within the authenticated user's namespace on github.
```


**Action Parameters**

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

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

<Accordion title="GITHUB_LIST_PACKAGE_VERSIONS_FOR_A_PACKAGE_OWNED_BY_A_USER">
**Tool Name:** List package versions for a package owned by a user

**Description**

```text wordWrap
Lists all versions of a public package owned by a specific github user, identified by package type, package name, and username.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
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

<Accordion title="GITHUB_LIST_PENDING_TEAM_INVITATIONS">
**Tool Name:** List pending team invitations

**Description**

```text wordWrap
Lists all pending membership invitations for a specified team within an organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PROJECT_CARDS">
**Tool Name:** List project cards

**Description**

```text wordWrap
Lists all project cards for a given `column id`, which must correspond to an existing project column.
```


**Action Parameters**

<ParamField path="archived_state" type="string" default="not_archived">
</ParamField>

<ParamField path="column_id" type="integer" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PROJECT_COLLABORATORS">
**Tool Name:** List project collaborators

**Description**

```text wordWrap
Fetches a list of collaborators for a specified, existing github project.
```


**Action Parameters**

<ParamField path="affiliation" type="string" default="all">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="project_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PROJECT_COLUMNS">
**Tool Name:** List project columns

**Description**

```text wordWrap
Lists all of a github project's columns (e.g., 'to do', 'in progress'); project id must identify a valid, accessible project.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="project_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PUBLIC_EMAIL_ADDRESSES_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List public email addresses for the authenticated user

**Description**

```text wordWrap
Lists the public email addresses for the authenticated user.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PUBLIC_EVENTS">
**Tool Name:** List public events

**Description**

```text wordWrap
Lists public github events, which may be delayed by up to 5 minutes, with support for pagination.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PUBLIC_EVENTS_FOR_A_NETWORK_OF_REPOSITORIES">
**Tool Name:** List public events for a network of repositories

**Description**

```text wordWrap
Retrieves public events (up to 90 days old, newest first) for a github repository network, including the repository and its forks.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PUBLIC_EVENTS_FOR_A_USER">
**Tool Name:** List public events for a user

**Description**

```text wordWrap
Retrieves a list of public events for a specified github user, in reverse chronological order.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_PUBLIC_EVENTS_RECEIVED_BY_A_USER">
**Tool Name:** List public events received by a user

**Description**

```text wordWrap
Lists public events for a specified github user (e.g., activities in repositories they watch or are involved in); the target user's profile must be public, and if blocked by the authenticated user, a 404 error is returned.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_PUBLIC_GISTS">
**Tool Name:** List public gists

**Description**

```text wordWrap
Lists public gists from github, optionally filtering by a 'since' timestamp and supporting pagination; results are generally newest first.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PUBLIC_KEYS_FOR_A_USER">
**Tool Name:** List public keys for a user

**Description**

```text wordWrap
Lists the verified public ssh keys for a specified github user.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_PUBLIC_ORGANIZATION_EVENTS">
**Tool Name:** List public organization events

**Description**

```text wordWrap
Lists public events for a specified github organization, which must exist.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PUBLIC_ORGANIZATION_MEMBERS">
**Tool Name:** List public organization members

**Description**

```text wordWrap
Lists users who have publicly declared their membership in a specified, existing github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PUBLIC_REPOSITORIES">
**Tool Name:** List public repositories

**Description**

```text wordWrap
Lists all public repositories on github; use the `since` parameter with a repository id from a previous result for pagination.
```


**Action Parameters**

<ParamField path="since" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PULL_REQUESTS">
**Tool Name:** List pull requests

**Description**

```text wordWrap
Lists pull requests for a specified github repository with ai-friendly filtering.
```


**Action Parameters**

<ParamField path="base" type="string">
</ParamField>

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="head" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PULL_REQUESTS_ASSOCIATED_WITH_A_COMMIT">
**Tool Name:** List pull requests associated with a commit

**Description**

```text wordWrap
Lists pull requests for a commit; returns merged prs that introduced the commit if on the default branch, or open prs including the commit if on other branches.
```


**Action Parameters**

<ParamField path="commit_sha" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_PULL_REQUESTS_FILES">
**Tool Name:** List pull requests files

**Description**

```text wordWrap
Lists all files (including additions, modifications, and removals) associated with a specific pull request in a github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REACTIONS_FOR_A_COMMIT_COMMENT">
**Tool Name:** List reactions for a commit comment

**Description**

```text wordWrap
Lists reactions for a specific commit comment; this is a read-only operation.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="content" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REACTIONS_FOR_AN_ISSUE">
**Tool Name:** List reactions for an issue

**Description**

```text wordWrap
Lists reactions for a specific, existing issue within an accessible github repository, optionally filtering by content type.
```


**Action Parameters**

<ParamField path="content" type="string">
</ParamField>

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REACTIONS_FOR_AN_ISSUE_COMMENT">
**Tool Name:** List reactions for an issue comment

**Description**

```text wordWrap
Lists reactions for a specific issue comment in a github repository, optionally filtering by content type.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="content" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REACTIONS_FOR_A_PULL_REQUEST_REVIEW_COMMENT">
**Tool Name:** List reactions for a pull request review comment

**Description**

```text wordWrap
Lists reactions for a pull request review comment in a repository, optionally filtering by reaction type.
```


**Action Parameters**

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="content" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REACTIONS_FOR_A_RELEASE">
**Tool Name:** List reactions for a release

**Description**

```text wordWrap
Lists all reactions, or optionally filters reactions by a specific content type, for a given github release.
```


**Action Parameters**

<ParamField path="content" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="release_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REACTIONS_FOR_A_TEAM_DISCUSSION">
**Tool Name:** List reactions for a team discussion

**Description**

```text wordWrap
Lists reactions for an existing team discussion within an organization.
```


**Action Parameters**

<ParamField path="content" type="string">
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REACTIONS_FOR_A_TEAM_DISCUSSION_COMMENT">
**Tool Name:** List reactions for a team discussion comment

**Description**

```text wordWrap
Lists reactions for a specific comment in a team discussion within an organization, optionally filtering by content type.
```


**Action Parameters**

<ParamField path="comment_number" type="integer" required={true}>
</ParamField>

<ParamField path="content" type="string">
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_RELEASE_ASSETS">
**Tool Name:** List release assets

**Description**

```text wordWrap
Lists assets (e.g., compiled binaries, source code archives) for a specific github release, identified by `release id` which must be valid for an existing release in the repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="release_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_RELEASES">
**Tool Name:** List releases

**Description**

```text wordWrap
Retrieves a list of all releases (published, draft, and prerelease) for a specified repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPO_ACCESS_BY_TOKEN">
**Tool Name:** List repo access by token

**Description**

```text wordWrap
Lists repositories in an organization that a fine-grained personal access token (`pat request id`) has requested access to; must be performed by a github app.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="pat_request_id" type="integer" required={true}>
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPO_CODESPACES">
**Tool Name:** List repo codespaces for authenticated user

**Description**

```text wordWrap
Lists codespaces the authenticated user can access within a specified, existing repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPO_DEV_CONTAINER_CONFIGS_FOR_USER">
**Tool Name:** List repo dev container configs for user

**Description**

```text wordWrap
Lists the `devcontainer.json` configurations available in a specified repository for use with github codespaces.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPO_SECRETS_WITHOUT_VALUES">
**Tool Name:** List repo secrets without values

**Description**

```text wordWrap
Lists all codespaces secrets available in a specific repository, without their encrypted values.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORIES_ACCESSIBLE_TO_THE_APP_INSTALLATION">
**Tool Name:** List repos accessible to app installation

**Description**

```text wordWrap
Lists repositories an app installation can access; 'total count' in response is zero if none are accessible.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORIES_ACCESSIBLE_TO_THE_USER_ACCESS_TOKEN">
**Tool Name:** List repositories accessible to the user access token

**Description**

```text wordWrap
Lists repositories accessible to the authenticated user through a specific github app installation (identified by `installation id`).
```


**Action Parameters**

<ParamField path="installation_id" type="integer" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORIES_FOR_A_USER">
**Tool Name:** List repositories for a user

**Description**

```text wordWrap
Lists public repositories for a specified github user, who must have an existing account.
```


**Action Parameters**

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="sort" type="string" default="full_name">
</ParamField>

<ParamField path="type" type="string" default="owner">
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

<Accordion title="GITHUB_LIST_REPOSITORIES_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List repositories for the authenticated user

**Description**

```text wordWrap
Lists repositories for the authenticated user; using 'type' with 'visibility' or 'affiliation' api parameters (not in this model) can cause a 422 error.
```


**Action Parameters**

<ParamField path="before" type="string">
</ParamField>

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="raw_response" type="boolean">
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="full_name">
</ParamField>

<ParamField path="type" type="string" default="all">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORIES_STARRED_BY_A_USER">
**Tool Name:** List repositories starred by a user

**Description**

```text wordWrap
Lists repositories a valid and existing github user has starred.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="sort" type="string" default="created">
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

<Accordion title="GITHUB_LIST_REPOSITORIES_STARRED_BY_THE_AUTHENTICATED_USER">
**Tool Name:** List repositories starred by the authenticated user

**Description**

```text wordWrap
Lists repositories the authenticated user has starred, optionally sorted and paginated, including star creation timestamps via 'application/vnd.github.star+json' media type.
```


**Action Parameters**

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORIES_WATCHED_BY_A_USER">
**Tool Name:** List repositories watched by a user

**Description**

```text wordWrap
Lists repositories a given github user is watching; the username must be a valid and existing github user handle.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_REPOSITORIES_WATCHED_BY_THE_AUTHENTICATED_USER">
**Tool Name:** List repositories watched by the authenticated user

**Description**

```text wordWrap
Lists repositories the authenticated user is watching (subscribed to for notifications).
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_ACTIVITIES">
**Tool Name:** List repository activities

**Description**

```text wordWrap
Lists activities for a github repository, ensuring the repository exists and is accessible.
```


**Action Parameters**

<ParamField path="activity_type" type="string">
</ParamField>

<ParamField path="actor" type="string">
</ParamField>

<ParamField path="after" type="string">
</ParamField>

<ParamField path="before" type="string">
</ParamField>

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="time_period" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_COLLABORATORS">
**Tool Name:** List repository collaborators

**Description**

```text wordWrap
Lists collaborators for a specified repository, provided it exists and is accessible to the authenticated user.
```


**Action Parameters**

<ParamField path="affiliation" type="string" default="all">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="permission" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_CONTRIBUTORS">
**Tool Name:** List repository contributors

**Description**

```text wordWrap
Lists contributors to a specified repository, sorted by number of contributions in descending order; the repository must exist and be accessible.
```


**Action Parameters**

<ParamField path="anon" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_EVENTS">
**Tool Name:** List repository events

**Description**

```text wordWrap
Lists chronological events (e.g., code pushes, issue activities, pr actions, forks) for a specified, existing github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_INVITATIONS">
**Tool Name:** List repository invitations

**Description**

```text wordWrap
Retrieves all pending (unaccepted or undeclined) collaboration invitations for a specified github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_INVITATIONS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List authenticated user's repository invitations

**Description**

```text wordWrap
Lists all pending repository invitations for the authenticated user.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_ISSUES">
**Tool Name:** List repository issues

**Description**

```text wordWrap
Lists issues (which include pull requests) for a specified, existing github repository, with options for filtering, sorting, and pagination.
```


**Action Parameters**

<ParamField path="assignee" type="string">
</ParamField>

<ParamField path="creator" type="string">
</ParamField>

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="labels" type="string">
</ParamField>

<ParamField path="mentioned" type="string">
</ParamField>

<ParamField path="milestone" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_LANGUAGES">
**Tool Name:** List repository languages

**Description**

```text wordWrap
Lists the programming languages used in a github repository, returning a byte count for each language.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_NOTIFICATIONS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List repository notifications for the authenticated user

**Description**

```text wordWrap
Retrieves notifications for the authenticated user from a specified repository, to which the user must have access.
```


**Action Parameters**

<ParamField path="all" type="boolean">
</ParamField>

<ParamField path="before" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="participating" type="boolean">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="since" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_ORGANIZATION_SECRETS">
**Tool Name:** List repository organization secrets

**Description**

```text wordWrap
Lists names of organization-level secrets shared with the specified repository; actual secret values are not returned and visibility depends on token access.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_ORGANIZATION_VARIABLES">
**Tool Name:** List repository organization variables

**Description**

```text wordWrap
Lists organization variables accessible to a specific repository; the repository must exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="10">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_PROJECTS">
**Tool Name:** List repository projects

**Description**

```text wordWrap
Lists projects associated with a specific repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_RULE_SUITES">
**Tool Name:** List repository rule suites

**Description**

```text wordWrap
Lists rule suite evaluations for a repository, allowing filtering by ref (non-wildcard), time period, actor, and result.
```


**Action Parameters**

<ParamField path="actor_name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="rule_suite_result" type="string" default="all">
</ParamField>

<ParamField path="time_period" type="string" default="day">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_SECRETS">
**Tool Name:** List repository secrets

**Description**

```text wordWrap
Lists metadata for all secrets in a github repository, excluding their encrypted values.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_SECRETS_WITHOUT_DECRYPTING">
**Tool Name:** List repository secrets without decrypting

**Description**

```text wordWrap
Lists metadata (e.g., name, creation/update dates) for all dependabot secrets in a repository; secret values are not included.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_TAGS">
**Tool Name:** List repository tags

**Description**

```text wordWrap
Lists tags for a specified github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_TEAMS">
**Tool Name:** List repository teams

**Description**

```text wordWrap
Lists all teams with explicit permission to access the specified repository; the repository must exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_VARIABLES">
**Tool Name:** List repository variables

**Description**

```text wordWrap
Lists plain text key-value variables for github actions workflows within a specific, accessible repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="10">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_WEBHOOKS">
**Tool Name:** List repository webhooks

**Description**

```text wordWrap
Retrieves a list of webhooks for a repository, which must exist and be accessible.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOSITORY_WORKFLOWS">
**Tool Name:** List repository workflows

**Description**

```text wordWrap
Lists all github actions workflows for a specified repository, which must exist and be accessible.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REPOS_WITH_GHACTIONS_CACHE_USAGE">
**Tool Name:** List repos with ghactions cache usage

**Description**

```text wordWrap
Retrieves a paginated list of github actions cache usage statistics for repositories within an existing github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REVIEW_COMMENTS_IN_A_REPOSITORY">
**Tool Name:** List review comments in a repository

**Description**

```text wordWrap
Lists all review comments on all pull requests within a specified repository.
```


**Action Parameters**

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REVIEW_COMMENTS_ON_A_PULL_REQUEST">
**Tool Name:** List review comments on a pull request

**Description**

```text wordWrap
Lists all review comments on a specific pull request within a github repository.
```


**Action Parameters**

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_REVIEWS_FOR_A_PULL_REQUEST">
**Tool Name:** List reviews for a pull request

**Description**

```text wordWrap
Lists submitted reviews chronologically for a specific pull request within a github repository.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_RUNNER_APPLICATIONS_FOR_AN_ORGANIZATION">
**Tool Name:** List runner applications for an organization

**Description**

```text wordWrap
Lists downloadable github actions runner application binaries, used for setting up self-hosted runners, for an existing github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_RUNNER_APPLICATIONS_FOR_A_REPOSITORY">
**Tool Name:** List runner applications for a repository

**Description**

```text wordWrap
Lists available self-hosted runner application binaries for a specific repository, including their os, architecture, and download url.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SECRETS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List secrets for the authenticated user

**Description**

```text wordWrap
Lists all codespaces secrets accessible to the authenticated user for use within github codespaces.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SELECTED_REPOS_FOR_SECRET_ACCESS">
**Tool Name:** List selected repos for secret access

**Description**

```text wordWrap
Lists repositories within a specified organization that have been granted access to a particular dependabot secret.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SELECTED_REPOSITORIES_FOR_AN_ORGANIZATION_SECRET">
**Tool Name:** List selected repositories for an organization secret

**Description**

```text wordWrap
Lists repositories within an organization that have explicit access to a specific organization secret, which must have its visibility set to 'selected'.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SELECTED_REPOSITORIES_FOR_AN_ORGANIZATION_VARIABLE">
**Tool Name:** List selected repositories for an organization variable

**Description**

```text wordWrap
Lists repositories in an organization that can access a specific organization variable; supports pagination and returns an empty list if no repositories have been granted access.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SELECTED_REPOSITORIES_FOR_A_USER_SECRET">
**Tool Name:** List selected repositories for a user secret

**Description**

```text wordWrap
Lists repositories that have access to the specified user secret for the authenticated user's codespaces, provided the user has codespaces access.
```


**Action Parameters**

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SELF_HOSTED_RUNNERS_FOR_AN_ORGANIZATION">
**Tool Name:** List self hosted runners for an organization

**Description**

```text wordWrap
Lists self-hosted runners for a github organization, optionally filtering by name and paginating results, providing details for each runner such as os, status, and labels.
```


**Action Parameters**

<ParamField path="name" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SELF_HOSTED_RUNNERS_FOR_A_REPOSITORY">
**Tool Name:** List self hosted runners for a repository

**Description**

```text wordWrap
Lists all self-hosted runners configured for a repository.
```


**Action Parameters**

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SOCIAL_ACCOUNTS_FOR_A_USER">
**Tool Name:** List social accounts for a user

**Description**

```text wordWrap
Lists social media accounts publicly linked to an existing github user's profile.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_SOCIAL_ACCOUNTS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List social accounts for the authenticated user

**Description**

```text wordWrap
Lists all social media accounts linked to the authenticated user's github profile.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_STARGAZERS">
**Tool Name:** List stargazers

**Description**

```text wordWrap
Lists users who have starred the specified github repository, which must exist.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_STARRED_GISTS">
**Tool Name:** List starred gists

**Description**

```text wordWrap
Retrieves a list of gists starred by the authenticated user.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SUBSCRIPTIONS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List subscriptions for the authenticated user

**Description**

```text wordWrap
Lists the authenticated user's active github marketplace subscriptions.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_SUBSCRIPTIONS_FOR_THE_AUTHENTICATED_USER_STUBBED">
**Tool Name:** List stubbed subscriptions for the authenticated user

**Description**

```text wordWrap
Lists the authenticated user's stubbed (test/example data, not live) github marketplace subscriptions, useful for development or testing.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TAG_PROTECTION_STATES_FOR_A_REPOSITORY">
**Tool Name:** List tag protection states for a repository

**Description**

```text wordWrap
Lists all active tag protection rules for a repository, defining patterns to prevent matching tags from being created or deleted; requires repository admin permissions.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TEAM_MEMBERS">
**Tool Name:** List team members

**Description**

```text wordWrap
Lists members of a specific team within an organization, including members of child teams.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="role" type="string" default="all">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TEAM_PROJECTS">
**Tool Name:** List team projects

**Description**

```text wordWrap
Lists github projects accessible to a specific team within an organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TEAM_REPOSITORIES">
**Tool Name:** List team repositories

**Description**

```text wordWrap
Lists repositories accessible to a specific team within a github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TEAMS">
**Tool Name:** List teams

**Description**

```text wordWrap
Lists teams for a specified github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TEAMS_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** List teams for the authenticated user

**Description**

```text wordWrap
Lists all teams across all organizations to which the authenticated user belongs, supporting pagination.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TEAMS_THAT_ARE_ASSIGNED_TO_AN_ORGANIZATION_ROLE">
**Tool Name:** List teams assigned to an organization role

**Description**

```text wordWrap
Lists teams assigned to a specific role within a github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_THE_PEOPLE_A_USER_FOLLOWS">
**Tool Name:** List the people a user follows

**Description**

```text wordWrap
Lists github users that a valid github `username` is following, supporting pagination.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_LIST_THE_PEOPLE_THE_AUTHENTICATED_USER_FOLLOWS">
**Tool Name:** List people the authenticated user follows

**Description**

```text wordWrap
Lists people the authenticated user follows.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TIMELINE_EVENTS_FOR_AN_ISSUE">
**Tool Name:** List timeline events for an issue

**Description**

```text wordWrap
Lists chronological events (e.g., comments, commits, label changes) for a specific issue in a github repository.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_TOKEN_ACCESS_REPOSITORIES">
**Tool Name:** List token access repositories

**Description**

```text wordWrap
Lists repositories in an organization accessible by a specific fine-grained personal access token; this action is for github apps.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="pat_id" type="integer" required={true}>
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_USER_PROJECTS">
**Tool Name:** List user projects

**Description**

```text wordWrap
Retrieves a list of projects for a specified github user, optionally filtering by state and supporting pagination; the username must be a valid github handle.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="state" type="string" default="open">
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

<Accordion title="GITHUB_LIST_USERS">
**Tool Name:** List users

**Description**

```text wordWrap
Retrieves all github users (individuals and organizations) in chronological order of their sign-up date.
```


**Action Parameters**

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="since" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_USERS_BLOCKED_BY_AN_ORGANIZATION">
**Tool Name:** List users blocked by an organization

**Description**

```text wordWrap
Lists users blocked by a specified github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_USERS_BLOCKED_BY_THE_AUTHENTICATED_USER">
**Tool Name:** List users blocked by the authenticated user

**Description**

```text wordWrap
Lists users blocked by the authenticated user, returning an empty list if no users are blocked.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_USERS_THAT_ARE_ASSIGNED_TO_AN_ORGANIZATION_ROLE">
**Tool Name:** List users assigned org role

**Description**

```text wordWrap
Lists users assigned to a specific role within a github organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_WATCHERS">
**Tool Name:** List watchers

**Description**

```text wordWrap
Retrieves a list of users watching a specific repository; the repository must be accessible to the authenticated user.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_WORKFLOW_RUN_ARTIFACTS">
**Tool Name:** List workflow run artifacts

**Description**

```text wordWrap
Lists artifacts (e.g., build outputs, test results) for a specific workflow run in a github repository.
```


**Action Parameters**

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LIST_WORKFLOW_RUNS_FOR_A_REPOSITORY">
**Tool Name:** List workflow runs for a repository

**Description**

```text wordWrap
Lists workflow runs for a repository, allowing filtering by actor, branch, event, status, creation date, check suite id, or head sha; the repository must exist and be accessible.
```


**Action Parameters**

<ParamField path="actor" type="string">
</ParamField>

<ParamField path="branch" type="string">
</ParamField>

<ParamField path="check_suite_id" type="integer">
</ParamField>

<ParamField path="created" type="string">
</ParamField>

<ParamField path="event" type="string">
</ParamField>

<ParamField path="exclude_pull_requests" type="boolean">
</ParamField>

<ParamField path="head_sha" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_LIST_WORKFLOW_RUNS_FOR_A_WORKFLOW">
**Tool Name:** List workflow runs for a workflow

**Description**

```text wordWrap
Lists runs for a specified, existing workflow (identified by id or filename like `main.yml`) in a github repository, with filtering options.
```


**Action Parameters**

<ParamField path="actor" type="string">
</ParamField>

<ParamField path="branch" type="string">
</ParamField>

<ParamField path="check_suite_id" type="integer">
</ParamField>

<ParamField path="created" type="string">
</ParamField>

<ParamField path="event" type="string">
</ParamField>

<ParamField path="exclude_pull_requests" type="boolean">
</ParamField>

<ParamField path="head_sha" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="status" type="string">
</ParamField>

<ParamField path="workflow_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_LOCK_AN_ISSUE">
**Tool Name:** Lock an issue

**Description**

```text wordWrap
Locks an existing github issue's conversation, preventing further comments; an optional reason can be specified.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="lock_reason" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MANAGE_ACCESS_CONTROL_FOR_ORGANIZATION_CODESPACES">
**Tool Name:** Manage access control for organization codespaces

**Description**

```text wordWrap
Sets the codespaces access control policy for a github organization, determining which members can use them.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="selected_usernames" type="array">
</ParamField>

<ParamField path="visibility" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MANAGE_CUSTOM_PROPERTIES_FOR_ORG_REPOS">
**Tool Name:** Manage custom properties for org repos

**Description**

```text wordWrap
Creates or updates values for an organization's predefined custom properties across multiple repositories (up to 30).
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="properties" type="array" required={true}>
</ParamField>

<ParamField path="repository_names" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MANAGE_SECRETS_IN_SELECTED_REPOSITORIES_WITH_PROPER_ACCESS">
**Tool Name:** Manage secrets in selected repositories with proper access

**Description**

```text wordWrap
Lists repositories within an organization that have been explicitly granted access to a specific organization secret.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MAP_A_COMMIT_AUTHOR">
**Tool Name:** Map a commit author

**Description**

```text wordWrap
Updates git author information (name and/or email) for an `author id` obtained during a repository import, to correctly attribute commits.
```


**Action Parameters**

<ParamField path="author_id" type="integer" required={true}>
</ParamField>

<ParamField path="email" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MARK_A_THREAD_AS_DONE">
**Tool Name:** Mark a thread as done

**Description**

```text wordWrap
Marks the github notification thread (identified by `thread id`) as done or read for the authenticated user, effectively archiving it.
```


**Action Parameters**

<ParamField path="thread_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MARK_A_THREAD_AS_READ">
**Tool Name:** Mark a thread as read

**Description**

```text wordWrap
Marks an existing github notification thread, identified by its `thread id`, as read.
```


**Action Parameters**

<ParamField path="thread_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MARK_NOTIFICATIONS_AS_READ">
**Tool Name:** Mark notifications as read

**Description**

```text wordWrap
Marks notifications as read or unread, optionally for those updated at or before a `last read at` timestamp.
```


**Action Parameters**

<ParamField path="last_read_at" type="string">
</ParamField>

<ParamField path="read" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MARK_REPOSITORY_NOTIFICATIONS_AS_READ">
**Tool Name:** Mark repository notifications as read

**Description**

```text wordWrap
Marks notifications in a repository as read; if 'last read at' is specified, notifications updated after this timestamp are not marked as read.
```


**Action Parameters**

<ParamField path="last_read_at" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MERGE_A_BRANCH">
**Tool Name:** Merge a branch

**Description**

```text wordWrap
Merges a head branch or commit sha into a base branch in a repository; fails if there are merge conflicts requiring manual resolution.
```


**Action Parameters**

<ParamField path="base" type="string" required={true}>
</ParamField>

<ParamField path="commit_message" type="string">
</ParamField>

<ParamField path="head" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MERGE_A_PULL_REQUEST">
**Tool Name:** Merge a pull request

**Description**

```text wordWrap
Merges an open and mergeable pull request in a repository, optionally specifying merge commit details, a merge method, and a required head sha for safety.
```


**Action Parameters**

<ParamField path="commit_message" type="string">
</ParamField>

<ParamField path="commit_title" type="string">
</ParamField>

<ParamField path="merge_method" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_META_ROOT">
**Tool Name:** Get GitHub API root

**Description**

```text wordWrap
Deprecated: retrieves github rest api root endpoint details; use `github api root` instead.
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

<Accordion title="GITHUB_MOVE_A_PROJECT_CARD">
**Tool Name:** Move a project card

**Description**

```text wordWrap
Moves a project card to a specified position, optionally into a new column.
```


**Action Parameters**

<ParamField path="card_id" type="integer" required={true}>
</ParamField>

<ParamField path="column_id" type="integer">
</ParamField>

<ParamField path="position" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_MOVE_A_PROJECT_COLUMN">
**Tool Name:** Move a project column

**Description**

```text wordWrap
Moves a column within a github project (classic) to a new position; `position` can be 'first', 'last', or 'after:<target column id>', where `target column id` must reference an existing column in the same project.
```


**Action Parameters**

<ParamField path="column_id" type="integer" required={true}>
</ParamField>

<ParamField path="position" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_PING_AN_ORGANIZATION_WEBHOOK">
**Tool Name:** Ping an organization webhook

**Description**

```text wordWrap
Sends a 'ping' event to a specified, existing organization webhook to test its configuration and ensure it correctly receives events.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_PING_A_REPOSITORY_WEBHOOK">
**Tool Name:** Ping a repository webhook

**Description**

```text wordWrap
Pings an existing webhook on a repository to test its configuration and reachability by github.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_PRIVATELY_REPORT_A_SECURITY_VULNERABILITY">
**Tool Name:** Privately report a security vulnerability

**Description**

```text wordWrap
Privately reports a security vulnerability for a repository; specify either `severity` or `cvss vector string`, but not both.
```


**Action Parameters**

<ParamField path="cvss_vector_string" type="string">
</ParamField>

<ParamField path="cwe_ids" type="array">
</ParamField>

<ParamField path="description" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="severity" type="string">
</ParamField>

<ParamField path="start_private_fork" type="boolean">
</ParamField>

<ParamField path="summary" type="string" required={true}>
</ParamField>

<ParamField path="vulnerabilities" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_PULLS_CHECK_IF_MERGED">
**Tool Name:** Pulls check if merged

**Description**

```text wordWrap
Deprecated: use `check if a pull request has been merged` instead. checks if a github pull request has been merged, indicated by a 204 http status (merged) or 404 (not merged/found).
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_PULLS_CREATE">
**Tool Name:** Create a pull request

**Description**

```text wordWrap
Deprecated: use `create a pull request` instead. creates a pull request, requiring existing `base` and `head` branches.
```


**Action Parameters**

<ParamField path="base" type="string" required={true}>
</ParamField>

<ParamField path="body" type="string">
</ParamField>

<ParamField path="draft" type="boolean">
</ParamField>

<ParamField path="head" type="string" required={true}>
</ParamField>

<ParamField path="head_repo" type="string">
</ParamField>

<ParamField path="issue" type="integer">
</ParamField>

<ParamField path="maintainer_can_modify" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_PULLS_CREATE_REVIEW">
**Tool Name:** Create a review for a pull request

**Description**

```text wordWrap
Deprecated: use `create a review for a pull request` for creating pull request reviews; supports `pending` for drafts and comment positioning.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="comments" type="array">
</ParamField>

<ParamField path="commit_id" type="string">
</ParamField>

<ParamField path="event" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_PULLS_CREATE_REVIEW_COMMENT">
**Tool Name:** Create a review comment for a pull request

**Description**

```text wordWrap
Deprecated: creates a review comment on a pull request's diff. use `create a review comment for a pull request` instead.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="commit_id" type="string" required={true}>
</ParamField>

<ParamField path="in_reply_to" type="integer">
</ParamField>

<ParamField path="line" type="integer">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>

<ParamField path="position" type="integer">
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="side" type="string">
</ParamField>

<ParamField path="start_line" type="integer">
</ParamField>

<ParamField path="start_side" type="string">
</ParamField>

<ParamField path="subject_type" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_PULLS_GET">
**Tool Name:** Get a pull request

**Description**

```text wordWrap
Deprecated: retrieves details of a specific pull request; prefer using the `get a pull request` action.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_PULLS_LIST">
**Tool Name:** List pull requests

**Description**

```text wordWrap
(deprecated: use `list pull requests`) lists pull requests for a specified github repository with ai-friendly filtering.
```


**Action Parameters**

<ParamField path="base" type="string">
</ParamField>

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="head" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="state" type="string" default="open">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REDELIVER_A_DELIVERY_FOR_AN_ORGANIZATION_WEBHOOK">
**Tool Name:** Redeliver a delivery for an organization webhook

**Description**

```text wordWrap
Redelivers a specific webhook delivery for a webhook within an organization, to resend an event that previously failed or was not processed.
```


**Action Parameters**

<ParamField path="delivery_id" type="integer" required={true}>
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REDELIVER_A_DELIVERY_FOR_A_REPOSITORY_WEBHOOK">
**Tool Name:** Redeliver a delivery for a repository webhook

**Description**

```text wordWrap
Redelivers a specific, previously made webhook delivery (`delivery id`) for a repository's webhook (`hook id`).
```


**Action Parameters**

<ParamField path="delivery_id" type="integer" required={true}>
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_A_CUSTOM_PROPERTY_FOR_AN_ORGANIZATION">
**Tool Name:** Remove a custom property for an organization

**Description**

```text wordWrap
Deletes a custom property, specified by `custom property name`, from an existing organization (`org`) for which the property is currently defined, preventing its future assignment to repositories.
```


**Action Parameters**

<ParamField path="custom_property_name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_A_LABEL_FROM_AN_ISSUE">
**Tool Name:** Remove a label from an issue

**Description**

```text wordWrap
Removes a label currently applied to a specific issue in a repository.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_ALL_LABELS_FROM_AN_ISSUE">
**Tool Name:** Remove all labels from an issue

**Description**

```text wordWrap
Removes all labels from a specified issue in a github repository; this operation is idempotent.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_ALL_ORGANIZATION_ROLES_FOR_A_TEAM">
**Tool Name:** Remove all organization roles for a team

**Description**

```text wordWrap
Revokes all organization roles for a team in an organization; this is destructive and succeeds even if the team initially has no roles.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_ALL_ORGANIZATION_ROLES_FOR_A_USER">
**Tool Name:** Remove all organization roles for a user

**Description**

```text wordWrap
Revokes all assigned organization-level roles from a specified user (who must be a member of the organization) within a github organization, without removing the user from the organization or affecting repository-specific roles.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_REMOVE_AN_ORGANIZATION_MEMBER">
**Tool Name:** Remove an organization member

**Description**

```text wordWrap
Removes a user, who must currently be a member, from a github organization, revoking their membership and access rights.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_REMOVE_AN_ORGANIZATION_ROLE_FROM_A_TEAM">
**Tool Name:** Remove an organization role from a team

**Description**

```text wordWrap
Revokes an organization role that a team currently possesses within an organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_AN_ORGANIZATION_ROLE_FROM_A_USER">
**Tool Name:** Remove an organization role from a user

**Description**

```text wordWrap
Removes a custom organization role from a user within a github organization, provided the organization exists, the user is a member, and the role id corresponds to a valid custom role in that organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
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

<Accordion title="GITHUB_REMOVE_APP_ACCESS_RESTRICTIONS">
**Tool Name:** Remove app access restrictions

**Description**

```text wordWrap
Removes all github app access restrictions from a protected branch in a repository; the branch must have protection rules configured, and this action does not alter user or team restrictions.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_A_PROJECT_FROM_A_TEAM">
**Tool Name:** Remove a project from a team

**Description**

```text wordWrap
Removes a project from a team within an organization; this action requires the project to be currently associated with the team.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="project_id" type="integer" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_A_REPOSITORY_COLLABORATOR">
**Tool Name:** Remove a repository collaborator

**Description**

```text wordWrap
Removes a collaborator from a specified github repository, provided the repository exists and the user is an existing collaborator.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_REMOVE_A_REPOSITORY_FROM_AN_APP_INSTALLATION">
**Tool Name:** Remove a repository from an app installation

**Description**

```text wordWrap
Removes a repository from a github app installation for the authenticated user, given a valid `installation id` and the `repository id` of a repository currently linked to that installation; this operation is idempotent.
```


**Action Parameters**

<ParamField path="installation_id" type="integer" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_A_REPOSITORY_FROM_A_TEAM">
**Tool Name:** Remove a repository from a team

**Description**

```text wordWrap
Disassociates a repository from a team; team members may lose access permissions, but the repository and team are not deleted.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_A_SELECTED_REPOSITORY_FROM_A_USER_SECRET">
**Tool Name:** Remove a selected repository from a user secret

**Description**

```text wordWrap
Removes a selected repository's access to a user's codespaces secret; the secret must exist and the repository must have previously been granted access.
```


**Action Parameters**

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_ASSIGNEES_FROM_AN_ISSUE">
**Tool Name:** Remove assignees from an issue

**Description**

```text wordWrap
Removes specified assignees from a github issue; requires push access, and invalid removal attempts are silently ignored.
```


**Action Parameters**

<ParamField path="assignees" type="array">
</ParamField>

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_CUSTOM_LABEL_FROM_REPO_RUNNER">
**Tool Name:** Remove custom label from repo runner

**Description**

```text wordWrap
Removes a custom label from a repository's self-hosted runner; this operation is idempotent.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_CUSTOM_LABEL_FROM_SELF_HOSTED_RUNNER">
**Tool Name:** Remove custom label from self hosted runner

**Description**

```text wordWrap
Removes a currently assigned custom label (`name`) from a self-hosted runner (`runner id`) in an organization (`org`).
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_CUSTOM_LABELS_FROM_SELF_HOSTED_REPOSITORY_RUNNER">
**Tool Name:** Remove custom labels from self hosted repo runner

**Description**

```text wordWrap
Removes all custom labels from a self-hosted runner registered at the repository level, leaving only its default labels and any labels inherited from its runner group or organization.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_INTERACTION_RESTRICTIONS_FOR_AN_ORGANIZATION">
**Tool Name:** Remove interaction restrictions for an organization

**Description**

```text wordWrap
Removes all interaction restrictions from public repositories in the specified github organization, allowing all users to resume interactions.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_INTERACTION_RESTRICTIONS_FOR_A_REPOSITORY">
**Tool Name:** Remove interaction restrictions for a repository

**Description**

```text wordWrap
Removes all interaction restrictions for a repository, enabling all users to comment, open issues, and create pull requests by lifting any existing temporary interaction limits.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_INTERACTION_RESTRICTIONS_FROM_YOUR_PUBLIC_REPOSITORIES">
**Tool Name:** Remove user public repo interaction restrictions

**Description**

```text wordWrap
Removes all interaction restrictions (limitations on comments, issues, or pull requests) from all public repositories owned by the authenticated user.
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

<Accordion title="GITHUB_REMOVE_ORG_DEV_ENV_SECRET_BY_NAME">
**Tool Name:** Remove org dev env secret by name

**Description**

```text wordWrap
Deletes a github codespaces secret from an organization by its name; this operation is idempotent.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_ORG_SECRET_BY_NAME">
**Tool Name:** Remove org secret by name

**Description**

```text wordWrap
Permanently removes a specific dependabot secret, by its `secret name`, from the github `org`, making it unavailable to dependabot for that organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_OUTSIDE_COLLABORATOR_FROM_AN_ORGANIZATION">
**Tool Name:** Remove outside collaborator from an organization

**Description**

```text wordWrap
Removes a user, who must be an outside collaborator, from the specified github organization, revoking their access to all its repositories.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="username" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_PUBLIC_ORG_MEMBERSHIP">
**Tool Name:** Remove public org membership

**Description**

```text wordWrap
Makes an authenticated user's public membership in an organization private (without removing them from the organization); the user must currently be a public member of that organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_REMOVE_REPO_FROM_ORG_DEV_ENV_SECRET">
**Tool Name:** Removerepofromorgdevenvsecret

**Description**

```text wordWrap
Removes a repository's access to an organization-level codespaces secret, if it was previously granted.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_REPO_FROM_ORG_SECRET_WITH_SELECTED_VISIBILITY">
**Tool Name:** Remove selected repo from org secret

**Description**

```text wordWrap
Revokes a specific repository's access to an organization-level dependabot secret, applicable only when the secret has 'selected' visibility and the specified repository currently has access.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_REQUESTED_REVIEWERS_FROM_A_PULL_REQUEST">
**Tool Name:** Remove requested reviewers from a pull request

**Description**

```text wordWrap
Removes currently assigned user logins and/or team slugs from a github pull request's list of requested reviewers.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="reviewers" type="array" required={true}>
</ParamField>

<ParamField path="team_reviewers" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_SELECTED_REPOSITORY_FROM_AN_ORGANIZATION_SECRET">
**Tool Name:** Remove selected repository from an organization secret

**Description**

```text wordWrap
Removes a specific repository's access to an organization-level secret; the repository must have been previously granted access to this secret.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_SELECTED_REPOSITORY_FROM_AN_ORGANIZATION_VARIABLE">
**Tool Name:** Remove selected repository from an organization variable

**Description**

```text wordWrap
Removes a repository's access to an organization variable, if the variable's visibility is 'selected' and the repository is in its access list.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_STATUS_CHECK_CONTEXTS">
**Tool Name:** Remove status check contexts

**Description**

```text wordWrap
Removes specified status check contexts (passed in the request body as an array of strings) from a protected branch in a repository.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_STATUS_CHECK_PROTECTION">
**Tool Name:** Remove status check protection

**Description**

```text wordWrap
Removes status check protection from a branch, disabling required status checks for merging pull requests; will only have an effect if status check protection is currently configured on the branch.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_TEAM_ACCESS_RESTRICTIONS">
**Tool Name:** Remove team access restrictions

**Description**

```text wordWrap
Removes all team-based access restrictions from a specified protected branch; the branch must be protected and have existing team restrictions for this action to change settings.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_TEAM_MEMBERSHIP_FOR_A_USER">
**Tool Name:** Remove team membership for a user

**Description**

```text wordWrap
Removes a user from a specific team within an organization; this action fails if team synchronization with an identity provider (idp) is enabled, and may delete the team if the user is its last member and the team is not nested.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
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

<Accordion title="GITHUB_REMOVE_USER_ACCESS_RESTRICTIONS">
**Tool Name:** Remove user access restrictions

**Description**

```text wordWrap
Removes active user-level access restrictions from a specified protected branch, enabling users with repository write access to push or merge if no other team or app restrictions apply.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REMOVE_USER_AS_A_COLLABORATOR">
**Tool Name:** Remove user as a collaborator

**Description**

```text wordWrap
Removes a user as a collaborator from an organization project; the user must already be a collaborator on the specified project.
```


**Action Parameters**

<ParamField path="project_id" type="integer" required={true}>
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

<Accordion title="GITHUB_REMOVE_USERS_FROM_CODESPACES_ACCESS_FOR_AN_ORGANIZATION">
**Tool Name:** Remove users from codespaces access for an organization

**Description**

```text wordWrap
Removes selected users from github codespaces billing access for an existing organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="selected_usernames" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RENAME_A_BRANCH">
**Tool Name:** Rename a branch

**Description**

```text wordWrap
Renames an existing branch in a github repository; the new name must be unique and adhere to github's naming conventions, and the current branch name cannot contain wildcard characters.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="new_name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RENDER_A_MARKDOWN_DOCUMENT">
**Tool Name:** Render a markdown document

**Description**

```text wordWrap
Renders markdown to html; for 'gfm' mode, provide 'context' (owner/repo) to correctly link issues, pull requests, and user mentions.
```


**Action Parameters**

<ParamField path="context" type="string">
</ParamField>

<ParamField path="mode" type="string" default="markdown">
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

<Accordion title="GITHUB_REPLACE_ALL_REPOSITORY_TOPICS">
**Tool Name:** Replace all repository topics

**Description**

```text wordWrap
Replaces all topics of a repository.
```


**Action Parameters**

<ParamField path="names" type="array" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPLACE_ORG_SECRET_VISIBILITY_TO_SELECTED">
**Tool Name:** Replace org secret visibility to selected

**Description**

```text wordWrap
Sets an existing dependabot organization secret's visibility to 'selected' and replaces the full list of repositories that can access it with the ids provided.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPLACE_REPO_ACCESS_ON_ORG_DEV_ENV_SECRET_SET">
**Tool Name:** Replace repository access for an org Codespaces secret

**Description**

```text wordWrap
Replaces the list of repositories that can access an existing organization-level codespaces secret with the provided valid repository ids owned by the organization.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_CREATE_FOR_AUTHENTICATED_USER">
**Tool Name:** Create a repository for the authenticated user

**Description**

```text wordWrap
Deprecated: use 'create a repository for the authenticated user' instead. creates a new repository for the authenticated user.
```


**Action Parameters**

<ParamField path="allow_auto_merge" type="boolean">
</ParamField>

<ParamField path="allow_merge_commit" type="boolean" default="True">
</ParamField>

<ParamField path="allow_rebase_merge" type="boolean" default="True">
</ParamField>

<ParamField path="allow_squash_merge" type="boolean" default="True">
</ParamField>

<ParamField path="auto_init" type="boolean">
</ParamField>

<ParamField path="delete_branch_on_merge" type="boolean">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="gitignore_template" type="string">
</ParamField>

<ParamField path="has_discussions" type="boolean">
</ParamField>

<ParamField path="has_downloads" type="boolean" default="True">
</ParamField>

<ParamField path="has_issues" type="boolean" default="True">
</ParamField>

<ParamField path="has_projects" type="boolean" default="True">
</ParamField>

<ParamField path="has_wiki" type="boolean" default="True">
</ParamField>

<ParamField path="homepage" type="string">
</ParamField>

<ParamField path="is_template" type="boolean">
</ParamField>

<ParamField path="license_template" type="string">
</ParamField>

<ParamField path="merge_commit_message" type="string">
</ParamField>

<ParamField path="merge_commit_title" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>

<ParamField path="squash_merge_commit_message" type="string">
</ParamField>

<ParamField path="squash_merge_commit_title" type="string">
</ParamField>

<ParamField path="team_id" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_CREATE_FORK">
**Tool Name:** Create a fork

**Description**

```text wordWrap
(deprecated: use `create a fork` instead) creates a fork of a specified repository.
```


**Action Parameters**

<ParamField path="default_branch_only" type="boolean">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="organization" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_CREATE_IN_ORG">
**Tool Name:** Create an organization repository

**Description**

```text wordWrap
Deprecated: use `create an organization repository` instead. creates a new repository in the specified organization.
```


**Action Parameters**

<ParamField path="allow_auto_merge" type="boolean">
</ParamField>

<ParamField path="allow_merge_commit" type="boolean" default="True">
</ParamField>

<ParamField path="allow_rebase_merge" type="boolean" default="True">
</ParamField>

<ParamField path="allow_squash_merge" type="boolean" default="True">
</ParamField>

<ParamField path="auto_init" type="boolean">
</ParamField>

<ParamField path="custom_properties" type="object">
</ParamField>

<ParamField path="delete_branch_on_merge" type="boolean">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="gitignore_template" type="string">
</ParamField>

<ParamField path="has_downloads" type="boolean" default="True">
</ParamField>

<ParamField path="has_issues" type="boolean" default="True">
</ParamField>

<ParamField path="has_projects" type="boolean" default="True">
</ParamField>

<ParamField path="has_wiki" type="boolean" default="True">
</ParamField>

<ParamField path="homepage" type="string">
</ParamField>

<ParamField path="is_template" type="boolean">
</ParamField>

<ParamField path="license_template" type="string">
</ParamField>

<ParamField path="merge_commit_message" type="string">
</ParamField>

<ParamField path="merge_commit_title" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>

<ParamField path="squash_merge_commit_message" type="string">
</ParamField>

<ParamField path="squash_merge_commit_title" type="string">
</ParamField>

<ParamField path="team_id" type="integer">
</ParamField>

<ParamField path="use_squash_pr_title_as_default" type="boolean">
</ParamField>

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

<Accordion title="GITHUB_REPO_S_CREATE_OR_UPDATE_FILE_CONTENTS">
**Tool Name:** Create or update file contents

**Description**

```text wordWrap
Deprecated: use `create or update file contents` instead; creates or replaces a file in a repository.
```


**Action Parameters**

<ParamField path="author__date" type="string">
</ParamField>

<ParamField path="author__email" type="string">
</ParamField>

<ParamField path="author__name" type="string">
</ParamField>

<ParamField path="branch" type="string">
</ParamField>

<ParamField path="committer__date" type="string">
</ParamField>

<ParamField path="committer__email" type="string">
</ParamField>

<ParamField path="committer__name" type="string">
</ParamField>

<ParamField path="content" type="string" required={true}>
</ParamField>

<ParamField path="message" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_GET_CODE_FREQUENCY_STATS">
**Tool Name:** Get the weekly commit activity

**Description**

```text wordWrap
Deprecated: use `get the weekly commit activity` instead. fetches weekly commit statistics (additions/deletions) for a repository; less reliable for over 10,000 commits.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_GET_COMMIT">
**Tool Name:** Get a commit

**Description**

```text wordWrap
Deprecated: use `get a commit`. retrieves a specific commit from a repository by its owner, name, and a valid commit reference (sha, branch, or tag), supporting pagination for large diffs.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_GET_CONTENT">
**Tool Name:** Get repository content

**Description**

```text wordWrap
Deprecated: gets repository file content or directory metadata; use `get repository content` instead.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="path" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_GET_CONTRIBUTORS_STATS">
**Tool Name:** Get all contributor commit activity

**Description**

```text wordWrap
(deprecated: use `getallcontributorcommitactivity`) fetches commit activity (total commits, weekly additions/deletions/commits) for all repository contributors; retry if github returns 202.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_LIST_BRANCHES">
**Tool Name:** List branches

**Description**

```text wordWrap
(deprecated: use 'list branches' instead) lists branches for an existing github repository, with an option to filter by protection status.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="protected" type="boolean">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_LIST_COLLABORATORS">
**Tool Name:** List repository collaborators (deprecated)

**Description**

```text wordWrap
(deprecated: use `listrepositorycollaborators`) lists repository collaborators, especially for organization-owned repositories including team members from child teams; requires repository access and potentially `read:org`/`repo` scopes for organization repos.
```


**Action Parameters**

<ParamField path="affiliation" type="string" default="all">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="permission" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_LIST_COMMITS">
**Tool Name:** List commits

**Description**

```text wordWrap
Deprecated: use `list commits` instead; lists repository commits, including gpg/s/mime signature verification details if available.
```


**Action Parameters**

<ParamField path="author" type="string">
</ParamField>

<ParamField path="committer" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="path" type="string">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string">
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="until" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_LIST_CONTRIBUTORS">
**Tool Name:** List repository contributors

**Description**

```text wordWrap
Deprecated: use `list repository contributors`. lists repository contributors, sorted by contributions; repository must exist and be accessible.
```


**Action Parameters**

<ParamField path="anon" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_LIST_FOR_AUTHENTICATED_USER">
**Tool Name:** List repositories for the authenticated user

**Description**

```text wordWrap
Deprecated: use `list repositories for the authenticated user` to list the authenticated user's repositories.
```


**Action Parameters**

<ParamField path="before" type="string">
</ParamField>

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="raw_response" type="boolean">
</ParamField>

<ParamField path="since" type="string">
</ParamField>

<ParamField path="sort" type="string" default="full_name">
</ParamField>

<ParamField path="type" type="string" default="all">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_LIST_FOR_ORG">
**Tool Name:** List organization repositories

**Description**

```text wordWrap
Deprecated: lists repositories for a github organization; use `list organization repositories` instead.
```


**Action Parameters**

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="1">
</ParamField>

<ParamField path="sort" type="string" default="created">
</ParamField>

<ParamField path="type" type="string" default="all">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REPO_S_LIST_FOR_USER">
**Tool Name:** List repositories for a user

**Description**

```text wordWrap
Deprecated: lists public repositories for the specified github user; use `list repositories for a user` instead.
```


**Action Parameters**

<ParamField path="direction" type="string">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="sort" type="string" default="full_name">
</ParamField>

<ParamField path="type" type="string" default="owner">
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

<Accordion title="GITHUB_REQUEST_A_GITHUB_PAGES_BUILD">
**Tool Name:** Request a github pages build

**Description**

```text wordWrap
Manually triggers a github pages build for a repository if github pages is enabled, useful for deployments not automatically built or for retrying failed builds.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REQUEST_REVIEWERS_FOR_A_PULL_REQUEST">
**Tool Name:** Request reviewers for a pull request

**Description**

```text wordWrap
Requests user and/or team reviewers for an open pull request in a repository; requires `owner`, `repo`, `pull number`, and at least one of `reviewers` or `team reviewers`.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="reviewers" type="array">
</ParamField>

<ParamField path="team_reviewers" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REREQUEST_A_CHECK_RUN">
**Tool Name:** Rerequest a check run

**Description**

```text wordWrap
Triggers a re-run of a specific check run in a github repository, which resets its status to 'queued', clears its conclusion, and triggers the `check run` webhook with `rerequested`.
```


**Action Parameters**

<ParamField path="check_run_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REREQUEST_A_CHECK_SUITE">
**Tool Name:** Rerequest a check suite

**Description**

```text wordWrap
Triggers a new run of an existing check suite within a repository, useful for re-running checks without new code.
```


**Action Parameters**

<ParamField path="check_suite_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RE_RUN_A_JOB_FROM_A_WORKFLOW_RUN">
**Tool Name:** Re-run a job from a workflow run

**Description**

```text wordWrap
Re-runs a specific job and any dependent jobs from a github actions workflow run in the specified repository, optionally enabling debug logging.
```


**Action Parameters**

<ParamField path="enable_debug_logging" type="boolean">
</ParamField>

<ParamField path="job_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RE_RUN_A_WORKFLOW">
**Tool Name:** Rerun a workflow

**Description**

```text wordWrap
Re-runs a specific github actions workflow run identified by its owner, repository, and run id, optionally enabling debug logging.
```


**Action Parameters**

<ParamField path="enable_debug_logging" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RE_RUN_FAILED_JOBS_FROM_A_WORKFLOW_RUN">
**Tool Name:** Rerun failed jobs from a workflow run

**Description**

```text wordWrap
Re-runs all failed jobs and their dependent jobs from a specified workflow run if the run contains previously failed jobs.
```


**Action Parameters**

<ParamField path="enable_debug_logging" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RESET_A_TOKEN">
**Tool Name:** Reset a token

**Description**

```text wordWrap
Invalidates the provided oauth `access token` and generates a new one for the github oauth app identified by `client id`, used for token compromise or security rotation.
```


**Action Parameters**

<ParamField path="access_token" type="string" required={true}>
</ParamField>

<ParamField path="client_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RESTORE_A_PACKAGE_FOR_AN_ORGANIZATION">
**Tool Name:** Restore a package for an organization

**Description**

```text wordWrap
Restores a package in an organization, provided it was deleted within the last 30 days.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
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

<Accordion title="GITHUB_RESTORE_A_PACKAGE_FOR_A_USER">
**Tool Name:** Restore a package for a user

**Description**

```text wordWrap
Restores a user-owned package previously deleted from github packages, if restorable under github's data retention policy (typically within 30 days of deletion).
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="token" type="string">
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

<Accordion title="GITHUB_RESTORE_A_PACKAGE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Restore a package for the authenticated user

**Description**

```text wordWrap
Restores a package deleted by the authenticated user within the last 30 days, if its namespace and version are still available.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
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

<Accordion title="GITHUB_RESTORE_A_PACKAGE_VERSION_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Restore a package version for the authenticated user

**Description**

```text wordWrap
Restores a package version that was deleted by the authenticated user within the last 30 days.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RESTORE_PACKAGE_VERSION_FOR_AN_ORGANIZATION">
**Tool Name:** Restore package version for an organization

**Description**

```text wordWrap
Restores a package version for an organization, provided it was deleted within the last 30 days.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_RESTORE_PACKAGE_VERSION_FOR_A_USER">
**Tool Name:** Restore package version for a user

**Description**

```text wordWrap
Restores a specific, user-owned package version if it was deleted within the last 30 days and its original namespace and version name are still available.
```


**Action Parameters**

<ParamField path="package_name" type="string" required={true}>
</ParamField>

<ParamField path="package_type" type="string" required={true}>
</ParamField>

<ParamField path="package_version_id" type="integer" required={true}>
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

<Accordion title="GITHUB_RETRIEVE_REPO_PUBLIC_KEY_FOR_ENCRYPTION">
**Tool Name:** Retrieve repo public key for encryption

**Description**

```text wordWrap
Gets a repository's public key, used to encrypt secrets for dependabot.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REVIEW_ACCESS_WITH_PERSONAL_TOKEN">
**Tool Name:** Review access with personal token

**Description**

```text wordWrap
Approves or denies a pending fine-grained personal access token request for organization resources; must be performed by a github app.
```


**Action Parameters**

<ParamField path="action" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="pat_request_id" type="integer" required={true}>
</ParamField>

<ParamField path="reason" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REVIEW_DEPLOYMENT_PROTECTION_RULES">
**Tool Name:** Review Custom Deployment Rules For Workflow Run

**Description**

```text wordWrap
Approves or rejects pending custom deployment protection rules for a workflow run by posting a review with `environment name` (str), `state` (str: 'approved'/'rejected'), and optional `comment` (str) in the request body, targeting a run with rules awaiting review.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REVIEW_PENDING_DEPLOYMENTS_FOR_A_WORKFLOW_RUN">
**Tool Name:** Review pending deployments for a workflow run

**Description**

```text wordWrap
Approves or rejects pending deployments for a specific workflow run that are in a 'waiting' state within specified, configured environments.
```


**Action Parameters**

<ParamField path="comment" type="string" required={true}>
</ParamField>

<ParamField path="environment_ids" type="array" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="run_id" type="integer" required={true}>
</ParamField>

<ParamField path="state" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REVIEW_RESOURCE_REQUESTS_WITH_FINE_GRAINED_TOKENS">
**Tool Name:** Review resource requests with fine grained tokens

**Description**

```text wordWrap
Approves or denies fine-grained personal access token requests for an organization; any specified `pat request ids` must refer to currently pending requests.
```


**Action Parameters**

<ParamField path="action" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="pat_request_ids" type="array">
</ParamField>

<ParamField path="reason" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_REVOKE_AN_INSTALLATION_ACCESS_TOKEN">
**Tool Name:** Revoke an installation access token

**Description**

```text wordWrap
Revokes the github app's current installation access token, immediately invalidating it for api authentication.
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

<Accordion title="GITHUB_SEARCH_CODE">
**Tool Name:** Search code

**Description**

```text wordWrap
Searches code file contents and paths on the default branch of github repositories using a query string; searches only files under 384kb, returns max 1000 results by best match, and is optimized for precision.
```


**Action Parameters**

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="q" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SEARCH_COMMITS">
**Tool Name:** Search commits

**Description**

```text wordWrap
Finds commits on github using a query string (q) supporting keywords and qualifiers, with options for sorting and pagination.
```


**Action Parameters**

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="q" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SEARCH_ISSUES_AND_PULL_REQUESTS">
**Tool Name:** Search issues and pull requests

**Description**

```text wordWrap
Searches github for issues and pull requests. use qualifiers to scope searches: `repo:owner/name` for specific repos, `org:orgname` for organizations, `user:username` for personal repos, `assignee:@me` for your assignments. combine with `is:issue`, `is:pr`, `state:open`, `label:"name"` filters.
```


**Action Parameters**

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="q" type="string" required={true}>
</ParamField>

<ParamField path="raw_response" type="boolean">
</ParamField>

<ParamField path="sort" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SEARCH_LABELS">
**Tool Name:** Search labels

**Description**

```text wordWrap
Searches for labels within a github repository by keywords in their names or descriptions.
```


**Action Parameters**

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="q" type="string" required={true}>
</ParamField>

<ParamField path="repository_id" type="integer" required={true}>
</ParamField>

<ParamField path="sort" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SEARCH_REPO_S">
**Tool Name:** Search repositories

**Description**

```text wordWrap
Deprecated: use `search repositories`; this version finds repositories by criteria, including text match metadata and pagination. example: `q="tetris language:assembly", sort="stars"`
```


**Action Parameters**

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="q" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SEARCH_REPOSITORIES">
**Tool Name:** Search repositories

**Description**

```text wordWrap
Searches github repositories using a flexible query (keywords, qualifiers) with sorting, ordering, and pagination.
```


**Action Parameters**

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="q" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SEARCH_TOPICS">
**Tool Name:** Search topics

**Description**

```text wordWrap
Finds topics on github using keywords and qualifiers with github's search syntax, supporting pagination.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="q" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SEARCH_USERS">
**Tool Name:** Search users

**Description**

```text wordWrap
Searches for users on github by criteria like username, email, location, followers, or repository associations, using a flexible query string `q`.
```


**Action Parameters**

<ParamField path="order" type="string" default="desc">
</ParamField>

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="q" type="string" required={true}>
</ParamField>

<ParamField path="sort" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SECURITY_ADVISORIES_LIST_GLOBAL_ADVISORIES">
**Tool Name:** List global security advisories

**Description**

```text wordWrap
 tags = ["openworldhint", "readonlyhint", "mcpignore"] the text describes how to find global security advisories with specific parameters. by default, it excludes malware advisories, which can be included by setting the `type` parameter to `malware`. more on advisory types at github docs.<<DEPRECATED use list_global_security_advisories>>
```


**Action Parameters**

<ParamField path="affects" type="array">
</ParamField>

<ParamField path="after" type="string">
</ParamField>

<ParamField path="before" type="string">
</ParamField>

<ParamField path="cve_id" type="string">
</ParamField>

<ParamField path="cwes" type="array">
</ParamField>

<ParamField path="direction" type="string" default="desc">
</ParamField>

<ParamField path="ecosystem" type="string">
</ParamField>

<ParamField path="ghsa_id" type="string">
</ParamField>

<ParamField path="is_withdrawn" type="boolean">
</ParamField>

<ParamField path="modified" type="string">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>

<ParamField path="published" type="string">
</ParamField>

<ParamField path="severity" type="string">
</ParamField>

<ParamField path="sort" type="string" default="published">
</ParamField>

<ParamField path="type" type="string" default="reviewed">
</ParamField>

<ParamField path="updated" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_ADMIN_BRANCH_PROTECTION">
**Tool Name:** Set admin branch protection

**Description**

```text wordWrap
Enables administrator enforcement on a branch, making existing protection rules also apply to administrators; branch protection rules must already be configured.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_APP_ACCESS_RESTRICTIONS">
**Tool Name:** Set app access restrictions

**Description**

```text wordWrap
Replaces the list of github apps permitted to push to a protected branch; the branch must already be protected and apps must be installed with 'contents' permission.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_A_REPOSITORY_SUBSCRIPTION">
**Tool Name:** Set a repository subscription

**Description**

```text wordWrap
Sets the authenticated user's notification subscription for a repository.
```


**Action Parameters**

<ParamField path="ignored" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="subscribed" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_A_THREAD_SUBSCRIPTION">
**Tool Name:** Set a thread subscription

**Description**

```text wordWrap
Sets whether a github notification thread is ignored (muted) or unignored (unmuted), for a `thread id` that must identify an existing notification thread.
```


**Action Parameters**

<ParamField path="ignored" type="boolean">
</ParamField>

<ParamField path="thread_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_DEFAULT_WORKFLOW_PERMISSIONS_FOR_AN_ORGANIZATION">
**Tool Name:** Set default workflow permissions for an organization

**Description**

```text wordWrap
Updates an organization's default github token permissions for workflows and whether github actions can approve pull requests; note that allowing actions to approve pull requests (`can approve pull request reviews: true`) is a security risk.
```


**Action Parameters**

<ParamField path="can_approve_pull_request_reviews" type="boolean">
</ParamField>

<ParamField path="default_workflow_permissions" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_DEFAULT_WORKFLOW_PERMISSIONS_FOR_A_REPOSITORY">
**Tool Name:** Set default workflow permissions for a repository

**Description**

```text wordWrap
Sets the default permissions for the github token within a repository and configures whether github actions can approve pull requests.
```


**Action Parameters**

<ParamField path="can_approve_pull_request_reviews" type="boolean">
</ParamField>

<ParamField path="default_workflow_permissions" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_GITHUB_ACTIONS_PERMISSIONS_FOR_AN_ORGANIZATION">
**Tool Name:** Set GitHub Actions permissions for an organization

**Description**

```text wordWrap
Sets the github actions permissions policy for an organization, specifying which repositories can run actions and which actions/workflows are allowed; if 'selected' is chosen for either, manage the specific lists via other endpoints.
```


**Action Parameters**

<ParamField path="allowed_actions" type="string">
</ParamField>

<ParamField path="enabled_repositories" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_GITHUB_ACTIONS_PERMISSIONS_FOR_A_REPOSITORY">
**Tool Name:** Set github actions permissions for a repository

**Description**

```text wordWrap
Sets github actions permissions for a repository, enabling/disabling actions and defining the policy for allowed actions and reusable workflows.
```


**Action Parameters**

<ParamField path="allowed_actions" type="string">
</ParamField>

<ParamField path="enabled" type="boolean" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_INTERACTION_RESTRICTIONS_FOR_AN_ORGANIZATION">
**Tool Name:** Set interaction restrictions for an organization

**Description**

```text wordWrap
Limits interactions (comments, new issues, prs) in an organization's public repositories by user type and duration, typically to mitigate high traffic or unwanted activity.
```


**Action Parameters**

<ParamField path="expiry" type="string">
</ParamField>

<ParamField path="limit" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_INTERACTION_RESTRICTIONS_FOR_A_REPOSITORY">
**Tool Name:** Set interaction restrictions for a repository

**Description**

```text wordWrap
Temporarily limits which github users (e.g., existing users, contributors only) can interact (comment, open issues, create pull requests) in a repository for a specified duration.
```


**Action Parameters**

<ParamField path="expiry" type="string">
</ParamField>

<ParamField path="limit" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_INTERACTION_RESTRICTIONS_FOR_YOUR_PUBLIC_REPOSITORIES">
**Tool Name:** Set interaction restrictions for your public repositories

**Description**

```text wordWrap
Sets or updates temporary interaction restrictions for all public repositories owned by the authenticated user, overriding any repository-specific limits.
```


**Action Parameters**

<ParamField path="expiry" type="string">
</ParamField>

<ParamField path="limit" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_LABELS_FOR_AN_ISSUE">
**Tool Name:** Set labels for an issue

**Description**

```text wordWrap
Replaces all existing labels on a github issue with a new set of labels.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="labels" type="array" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_ORG_ALLOWED_ACTIONS">
**Tool Name:** Set allowed actions and workflows for an organization

**Description**

```text wordWrap
Sets the github actions permissions for an existing organization, specifying allowed github-owned actions, verified creator actions, and action/workflow patterns from public repositories.
```


**Action Parameters**

<ParamField path="github_owned_allowed" type="boolean">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="patterns_allowed" type="array">
</ParamField>

<ParamField path="verified_allowed" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_ORG_RUNNER_LABELS">
**Tool Name:** Set custom labels for a self-hosted runner for an organization

**Description**

```text wordWrap
Sets the custom labels for a self-hosted runner in an organization; this operation does not affect default system-assigned labels (e.g., 'self-hosted', 'linux', 'x64').
```


**Action Parameters**

<ParamField path="labels" type="array" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="runner_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_PRIMARY_EMAIL_VISIBILITY_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Set primary email visibility

**Description**

```text wordWrap
Sets the visibility ('public' or 'private') of the authenticated user's primary email address on github, if one is configured.
```


**Action Parameters**

<ParamField path="visibility" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_REPO_ALLOWED_ACTIONS">
**Tool Name:** Set repo allowed actions

**Description**

```text wordWrap
Sets allowed github actions and reusable workflows for a repository, managing permissions for github-owned, verified creator, or specific pattern-matched actions/workflows (note: `patterns allowed` applies only to public repositories).
```


**Action Parameters**

<ParamField path="github_owned_allowed" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="patterns_allowed" type="array">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="verified_allowed" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_SELECTED_REPOSITORIES_FOR_AN_ORGANIZATION_SECRET">
**Tool Name:** Set selected repositories for an organization secret

**Description**

```text wordWrap
Replaces the list of repositories that can access an organization secret; only effective if the secret's visibility is 'selected'.
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_name" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_SELECTED_REPOSITORIES_FOR_AN_ORGANIZATION_VARIABLE">
**Tool Name:** Set selected repositories for an organization variable

**Description**

```text wordWrap
Replaces the list of repositories that can access an organization-level variable; the variable's visibility must be 'selected'.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_SELECTED_REPOSITORIES_FOR_A_USER_SECRET">
**Tool Name:** Set selected repositories for a user secret

**Description**

```text wordWrap
Defines the list of repositories permitted to access a specific codespaces secret for the authenticated user.
```


**Action Parameters**

<ParamField path="secret_name" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_STATUS_CHECK_CONTEXTS">
**Tool Name:** Set status check contexts

**Description**

```text wordWrap
Replaces required status check contexts for a protected branch, requiring admin permissions; an empty `contexts` array removes all checks.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="contexts" type="array" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_TEAM_ACCESS_RESTRICTIONS">
**Tool Name:** Set team access restrictions

**Description**

```text wordWrap
Sets team push access for a protected branch by replacing all current teams with a new list of valid team slugs (provided in the request body); an empty list of slugs removes all team restrictions.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_USER_ACCESS_RESTRICTIONS">
**Tool Name:** Set user access restrictions

**Description**

```text wordWrap
Replaces the list of users with push access to a protected branch using a request body (not in this schema) containing an array of github usernames; this enables branch protection if not already active.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SET_WORKFLOW_EXTERNAL_ACCESS">
**Tool Name:** Set workflow access level outside repository

**Description**

```text wordWrap
Sets the access level for workflows outside a repository to use actions and reusable workflows within that repository.
```


**Action Parameters**

<ParamField path="access_level" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_STAR_A_GIST">
**Tool Name:** Star a gist

**Description**

```text wordWrap
Stars a github gist identified by `gist id`; this action is idempotent and returns a 204 no content status upon success, even if the gist is already starred.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Star a repository for the authenticated user

**Description**

```text wordWrap
Stars an existing and accessible repository for the authenticated user; this action is idempotent and succeeds even if the repository is already starred.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_START_A_CODESPACE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Start a codespace for the authenticated user

**Description**

```text wordWrap
Initiates the startup process for an existing github codespace (identified by `codespace name`) if it's in a startable state like 'available' or 'stopped'.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_STOP_A_CODESPACE_FOR_AN_ORGANIZATION_USER">
**Tool Name:** Stop a codespace for an organization user

**Description**

```text wordWrap
Stops a codespace, which must be currently running, for a specified member of an organization.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_STOP_A_CODESPACE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Stop a codespace for the authenticated user

**Description**

```text wordWrap
Stops a running or available codespace for the authenticated user, pausing its execution and billing.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SUBMIT_A_REVIEW_FOR_A_PULL_REQUEST">
**Tool Name:** Submit a review for a pull request

**Description**

```text wordWrap
Finalizes a pending pull request review (identified by `review id`) with a required `event` (approve, request changes, comment) and an optional `body`.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="event" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="review_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_SYNC_A_FORK_BRANCH_WITH_THE_UPSTREAM_REPOSITORY">
**Tool Name:** Sync a fork branch with the upstream repository

**Description**

```text wordWrap
Synchronizes a branch in a forked github repository with its upstream counterpart, assuming the repository is a fork, the branch exists, an upstream is configured, and the merge is conflict-free.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_TEST_THE_PUSH_REPOSITORY_WEBHOOK">
**Tool Name:** Test the push repository webhook

**Description**

```text wordWrap
Triggers a simulated push event to test a repository's push webhook; a test event is only delivered if the webhook is subscribed to 'push' events, otherwise, it returns 204 no content without sending a post.
```


**Action Parameters**

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_TRANSFER_A_REPOSITORY">
**Tool Name:** Transfer a repository

**Description**

```text wordWrap
Initiates a repository transfer to a new owner (who must accept the request); if the new owner is an organization, it must be configured to allow transfers.
```


**Action Parameters**

<ParamField path="new_name" type="string">
</ParamField>

<ParamField path="new_owner" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="team_ids" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UNBLOCK_A_USER">
**Tool Name:** Unblock a user

**Description**

```text wordWrap
Unblocks a github user, provided they are currently blocked by the authenticated user.
```


**Action Parameters**

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

<Accordion title="GITHUB_UNBLOCK_A_USER_FROM_AN_ORGANIZATION">
**Tool Name:** Unblock a user from an organization

**Description**

```text wordWrap
Unblocks a user from an organization, allowing renewed interaction with its resources, provided the user is currently blocked (otherwise, a 404 error may occur).
```


**Action Parameters**

<ParamField path="org" type="string" required={true}>
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

<Accordion title="GITHUB_UNFOLLOW_A_USER">
**Tool Name:** Unfollow a user

**Description**

```text wordWrap
Unfollows an existing github user; this action is idempotent, succeeding even if the authenticated user is not currently following them.
```


**Action Parameters**

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

<Accordion title="GITHUB_UNLOCK_AN_ISSUE">
**Tool Name:** Unlock an issue

**Description**

```text wordWrap
Unlocks a currently locked github issue in the specified repository, allowing new comments and interactions.
```


**Action Parameters**

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UNLOCK_AN_ORGANIZATION_REPOSITORY">
**Tool Name:** Unlock an organization repository

**Description**

```text wordWrap
Unlocks an organization repository previously locked by a github migration.
```


**Action Parameters**

<ParamField path="migration_id" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="repo_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UNLOCK_A_USER_REPOSITORY">
**Tool Name:** Unlock a user repository

**Description**

```text wordWrap
Unlocks a repository (`repo name`) that was locked as part of a user migration (`migration id`), making it usable or deletable; this action requires the repository to be currently locked.
```


**Action Parameters**

<ParamField path="migration_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UNSTAR_A_GIST">
**Tool Name:** Unstar a gist

**Description**

```text wordWrap
Removes a star from the specified gist; the action is idempotent and will not error if the gist was not previously starred by the user.
```


**Action Parameters**

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UNSTAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Unstar a repository

**Description**

```text wordWrap
Removes the authenticated user's star from a specified repository, which must already be starred by the user.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_CHECK_RUN">
**Tool Name:** Update a check run

**Description**

```text wordWrap
Updates an existing check run for a specific commit in a repository, allowing modifications to its status, conclusion, output, and other details.
```


**Action Parameters**

<ParamField path="actions" type="array">
</ParamField>

<ParamField path="check_run_id" type="integer" required={true}>
</ParamField>

<ParamField path="completed_at" type="string">
</ParamField>

<ParamField path="conclusion" type="string">
</ParamField>

<ParamField path="details_url" type="string">
</ParamField>

<ParamField path="external_id" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="output__annotations" type="array">
</ParamField>

<ParamField path="output__images" type="array">
</ParamField>

<ParamField path="output__summary" type="string">
</ParamField>

<ParamField path="output__text" type="string">
</ParamField>

<ParamField path="output__title" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="started_at" type="string">
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

<Accordion title="GITHUB_UPDATE_A_CODE_SCANNING_ALERT">
**Tool Name:** Update a code scanning alert

**Description**

```text wordWrap
Updates a specific code scanning alert in a github repository, primarily to change its state (e.g., 'open' or 'dismissed').
```


**Action Parameters**

<ParamField path="alert_number" type="integer" required={true}>
</ParamField>

<ParamField path="dismissed_comment" type="string">
</ParamField>

<ParamField path="dismissed_reason" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_CODE_SCANNING_DEFAULT_SETUP_CONFIGURATION">
**Tool Name:** Update a code scanning default setup configuration

**Description**

```text wordWrap
Updates the default setup configuration for code scanning in a repository; github advanced security must be enabled for the repository.
```


**Action Parameters**

<ParamField path="languages" type="array">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="query_suite" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_CODESPACE_FOR_THE_AUTHENTICATED_USER">
**Tool Name:** Update a codespace for the authenticated user

**Description**

```text wordWrap
Updates an existing github codespace's machine type, display name, or recent folders for the authenticated user; machine type changes take effect on the next start.
```


**Action Parameters**

<ParamField path="codespace_name" type="string" required={true}>
</ParamField>

<ParamField path="display_name" type="string">
</ParamField>

<ParamField path="machine" type="string">
</ParamField>

<ParamField path="recent_folders" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_COMMIT_COMMENT">
**Tool Name:** Update a commit comment

**Description**

```text wordWrap
Changes the body of an existing commit comment.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_CUSTOM_ORGANIZATION_ROLE">
**Tool Name:** Update a custom organization role

**Description**

```text wordWrap
Updates an existing custom role in an organization by modifying its name, description, or permissions; at least one of these fields must be provided.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="permissions" type="array">
</ParamField>

<ParamField path="role_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_DEPLOYMENT_BRANCH_POLICY">
**Tool Name:** Update a deployment branch policy

**Description**

```text wordWrap
Updates the name pattern of an existing deployment branch policy for a specific environment in a repository.
```


**Action Parameters**

<ParamField path="branch_policy_id" type="integer" required={true}>
</ParamField>

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_DISCUSSION">
**Tool Name:** Update a discussion

**Description**

```text wordWrap
Updates the title and/or body of a specific team discussion within an organization.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
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

<Accordion title="GITHUB_UPDATE_A_DISCUSSION_COMMENT">
**Tool Name:** Update a discussion comment

**Description**

```text wordWrap
Updates the body of a comment in a team's discussion within an organization.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="comment_number" type="integer" required={true}>
</ParamField>

<ParamField path="discussion_number" type="integer" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_GIST">
**Tool Name:** Update a gist

**Description**

```text wordWrap
Updates a gist's description, and/or its files (including content, filename changes, or deletion).
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="files" type="object">
</ParamField>

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_GIST_COMMENT">
**Tool Name:** Update a gist comment

**Description**

```text wordWrap
Updates an existing comment on a specified gist.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="gist_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_LABEL">
**Tool Name:** Update a label

**Description**

```text wordWrap
Updates an existing label's name, color, or description within a specified repository.
```


**Action Parameters**

<ParamField path="color" type="string">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="new_name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_MILESTONE">
**Tool Name:** Update a milestone

**Description**

```text wordWrap
Updates a milestone in a repository, identified by `owner`, `repo`, and `milestone number`, by allowing modification of its `title`, `state`, `description`, or `due on`; at least one of these four attributes must be provided to perform an update.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="due_on" type="string">
</ParamField>

<ParamField path="milestone_number" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string" default="open">
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

<Accordion title="GITHUB_UPDATE_AN_ENVIRONMENT_VARIABLE">
**Tool Name:** Update an environment variable

**Description**

```text wordWrap
Updates an existing environment variable's name and/or value in a specific github repository environment; requires providing either a new name or a new value.
```


**Action Parameters**

<ParamField path="environment_name" type="string" required={true}>
</ParamField>

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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

<Accordion title="GITHUB_UPDATE_AN_EXISTING_PROJECT_CARD">
**Tool Name:** Update an existing project card

**Description**

```text wordWrap
Updates an existing project card's note and/or archived status, identified by its `card id`.
```


**Action Parameters**

<ParamField path="archived" type="boolean">
</ParamField>

<ParamField path="card_id" type="integer" required={true}>
</ParamField>

<ParamField path="note" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_AN_EXISTING_PROJECT_COLUMN">
**Tool Name:** Update an existing project column

**Description**

```text wordWrap
Updates the name of an existing column, identified by `column id`, in a github project (classic).
```


**Action Parameters**

<ParamField path="column_id" type="integer" required={true}>
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

<Accordion title="GITHUB_UPDATE_AN_ISSUE">
**Tool Name:** Update an issue

**Description**

```text wordWrap
Updates an existing github issue's title, body, state, milestone, labels, or assignees; `state reason` is only processed if `state` also changes, and use `null` or `[]` to clear applicable fields.
```


**Action Parameters**

<ParamField path="assignee" type="string">
</ParamField>

<ParamField path="assignees" type="array">
</ParamField>

<ParamField path="body" type="string">
</ParamField>

<ParamField path="issue_number" type="integer" required={true}>
</ParamField>

<ParamField path="labels" type="array">
</ParamField>

<ParamField path="milestone" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string">
</ParamField>

<ParamField path="state_reason" type="string">
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

<Accordion title="GITHUB_UPDATE_AN_ISSUE_COMMENT">
**Tool Name:** Update an issue comment

**Description**

```text wordWrap
Updates an existing comment on an issue or pull request within a specified repository.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_AN_ORGANIZATION">
**Tool Name:** Update an organization

**Description**

```text wordWrap
Updates an organization's settings; changing security-related fields requires admin, owner, or security manager permissions.
```


**Action Parameters**

<ParamField path="advanced_security_enabled_for_new_repositories" type="boolean">
</ParamField>

<ParamField path="billing_email" type="string">
</ParamField>

<ParamField path="blog" type="string">
</ParamField>

<ParamField path="company" type="string">
</ParamField>

<ParamField path="default_repository_permission" type="string" default="read">
</ParamField>

<ParamField path="dependabot_alerts_enabled_for_new_repositories" type="boolean">
</ParamField>

<ParamField path="dependabot_security_updates_enabled_for_new_repositories" type="boolean">
</ParamField>

<ParamField path="dependency_graph_enabled_for_new_repositories" type="boolean">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="email" type="string">
</ParamField>

<ParamField path="has_organization_projects" type="boolean">
</ParamField>

<ParamField path="has_repository_projects" type="boolean">
</ParamField>

<ParamField path="location" type="string">
</ParamField>

<ParamField path="members_allowed_repository_creation_type" type="string">
</ParamField>

<ParamField path="members_can_create_internal_repositories" type="boolean">
</ParamField>

<ParamField path="members_can_create_pages" type="boolean" default="True">
</ParamField>

<ParamField path="members_can_create_private_pages" type="boolean" default="True">
</ParamField>

<ParamField path="members_can_create_private_repositories" type="boolean">
</ParamField>

<ParamField path="members_can_create_public_pages" type="boolean" default="True">
</ParamField>

<ParamField path="members_can_create_public_repositories" type="boolean">
</ParamField>

<ParamField path="members_can_create_repositories" type="boolean" default="True">
</ParamField>

<ParamField path="members_can_fork_private_repositories" type="boolean">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret_scanning_enabled_for_new_repositories" type="boolean">
</ParamField>

<ParamField path="secret_scanning_push_protection_custom_link" type="string">
</ParamField>

<ParamField path="secret_scanning_push_protection_custom_link_enabled" type="boolean">
</ParamField>

<ParamField path="secret_scanning_push_protection_enabled_for_new_repositories" type="boolean">
</ParamField>

<ParamField path="twitter_username" type="string">
</ParamField>

<ParamField path="web_commit_signoff_required" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_AN_ORGANIZATION_VARIABLE">
**Tool Name:** Update an organization variable

**Description**

```text wordWrap
Updates an existing github actions organization variable's name, value, or visibility (`all`, `private`, `selected`), requiring `selected repository ids` with valid repository ids if visibility is `selected`.
```


**Action Parameters**

<ParamField path="name" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="selected_repository_ids" type="array">
</ParamField>

<ParamField path="value" type="string">
</ParamField>

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

<Accordion title="GITHUB_UPDATE_AN_ORGANIZATION_WEBHOOK">
**Tool Name:** Update an organization webhook

**Description**

```text wordWrap
Updates the configuration (url, content type, secret, ssl verification), subscribed events, active status, or name of an existing webhook for a specified organization.
```


**Action Parameters**

<ParamField path="active" type="boolean" default="True">
</ParamField>

<ParamField path="config__content__type" type="string">
</ParamField>

<ParamField path="config__insecure__ssl" type="string">
</ParamField>

<ParamField path="config__secret" type="string">
</ParamField>

<ParamField path="config__url" type="string">
</ParamField>

<ParamField path="events" type="array" default="['push']">
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_PROJECT">
**Tool Name:** Update a project

**Description**

```text wordWrap
Updates an existing github project's attributes if the github projects feature is enabled and at least one modifiable field is provided.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="organization_permission" type="string">
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>

<ParamField path="project_id" type="integer" required={true}>
</ParamField>

<ParamField path="state" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_PULL_REQUEST">
**Tool Name:** Update a pull request

**Description**

```text wordWrap
Updates an existing pull request, allowing changes to attributes like title, body, state, base branch, and maintainer modification settings.
```


**Action Parameters**

<ParamField path="base" type="string">
</ParamField>

<ParamField path="body" type="string">
</ParamField>

<ParamField path="maintainer_can_modify" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string">
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

<Accordion title="GITHUB_UPDATE_A_PULL_REQUEST_BRANCH">
**Tool Name:** Update a pull request branch

**Description**

```text wordWrap
Updates an open pull request's head branch by merging the latest changes from its base branch, if mergeable and repository merging is enabled; operates asynchronously.
```


**Action Parameters**

<ParamField path="expected_head_sha" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_REFERENCE">
**Tool Name:** Update a reference

**Description**

```text wordWrap
Updates a git reference (e.g., a branch or tag) to a specific commit sha, creating the reference if it doesn't exist; use `force` for non-fast-forward updates.
```


**Action Parameters**

<ParamField path="force" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sha" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_RELEASE">
**Tool Name:** Update a release

**Description**

```text wordWrap
Updates an existing release in a github repository, allowing modification of its attributes; if linking a discussion, the `discussion category name` must refer to an existing category in the repository.
```


**Action Parameters**

<ParamField path="body" type="string">
</ParamField>

<ParamField path="discussion_category_name" type="string">
</ParamField>

<ParamField path="draft" type="boolean">
</ParamField>

<ParamField path="make_latest" type="string" default="True">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="prerelease" type="boolean">
</ParamField>

<ParamField path="release_id" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="tag_name" type="string">
</ParamField>

<ParamField path="target_commitish" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_RELEASE_ASSET">
**Tool Name:** Update a release asset

**Description**

```text wordWrap
Updates the name, label, or state of a release asset in a github repository, requiring at least one of these properties to be provided for modification.
```


**Action Parameters**

<ParamField path="asset_id" type="integer" required={true}>
</ParamField>

<ParamField path="label" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="state" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_REPOSITORY">
**Tool Name:** Update a repository

**Description**

```text wordWrap
Updates settings for an existing github repository, such as name, description, visibility, merge strategies, and security configurations.
```


**Action Parameters**

<ParamField path="allow_auto_merge" type="boolean">
</ParamField>

<ParamField path="allow_forking" type="boolean">
</ParamField>

<ParamField path="allow_merge_commit" type="boolean" default="True">
</ParamField>

<ParamField path="allow_rebase_merge" type="boolean" default="True">
</ParamField>

<ParamField path="allow_squash_merge" type="boolean" default="True">
</ParamField>

<ParamField path="allow_update_branch" type="boolean">
</ParamField>

<ParamField path="archived" type="boolean">
</ParamField>

<ParamField path="default_branch" type="string">
</ParamField>

<ParamField path="delete_branch_on_merge" type="boolean">
</ParamField>

<ParamField path="description" type="string">
</ParamField>

<ParamField path="has_issues" type="boolean" default="True">
</ParamField>

<ParamField path="has_projects" type="boolean" default="True">
</ParamField>

<ParamField path="has_wiki" type="boolean" default="True">
</ParamField>

<ParamField path="homepage" type="string">
</ParamField>

<ParamField path="is_template" type="boolean">
</ParamField>

<ParamField path="merge_commit_message" type="string">
</ParamField>

<ParamField path="merge_commit_title" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="private" type="boolean">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="security__and__analysis__advanced__security__status" type="string">
</ParamField>

<ParamField path="security__and__analysis__secret__scanning__push__protection__status" type="string">
</ParamField>

<ParamField path="security__and__analysis__secret__scanning__status" type="string">
</ParamField>

<ParamField path="squash_merge_commit_message" type="string">
</ParamField>

<ParamField path="squash_merge_commit_title" type="string">
</ParamField>

<ParamField path="use_squash_pr_title_as_default" type="boolean">
</ParamField>

<ParamField path="visibility" type="string">
</ParamField>

<ParamField path="web_commit_signoff_required" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_REPOSITORY_INVITATION">
**Tool Name:** Update a repository invitation

**Description**

```text wordWrap
Updates an active repository invitation to modify the invited user's permissions; the specified repository and invitation must exist.
```


**Action Parameters**

<ParamField path="invitation_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="permissions" type="string">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_REPOSITORY_RULESET">
**Tool Name:** Update a repository ruleset

**Description**

```text wordWrap
Updates an existing repository ruleset, identified by `ruleset id` for a given repository, allowing partial updates to its configuration such as name, target, enforcement, bypass actors, conditions, and rules.
```


**Action Parameters**

<ParamField path="bypass_actors" type="array">
</ParamField>

<ParamField path="conditions__ref__name__exclude" type="array">
</ParamField>

<ParamField path="conditions__ref__name__include" type="array">
</ParamField>

<ParamField path="enforcement" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="rules" type="array">
</ParamField>

<ParamField path="ruleset_id" type="integer" required={true}>
</ParamField>

<ParamField path="target" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_REPOSITORY_VARIABLE">
**Tool Name:** Update a repository variable

**Description**

```text wordWrap
Updates the name and/or value of an existing github actions variable in a repository.
```


**Action Parameters**

<ParamField path="name" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="value" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_REPOSITORY_WEBHOOK">
**Tool Name:** Update a repository webhook

**Description**

```text wordWrap
Updates the url, content type, secret, ssl verification, events, or active status for an existing repository webhook, specified by `owner`, `repo`, and `hook id`.
```


**Action Parameters**

<ParamField path="active" type="boolean" default="True">
</ParamField>

<ParamField path="add_events" type="array">
</ParamField>

<ParamField path="config__content__type" type="string">
</ParamField>

<ParamField path="config__insecure__ssl" type="string">
</ParamField>

<ParamField path="config__secret" type="string">
</ParamField>

<ParamField path="config__url" type="string">
</ParamField>

<ParamField path="events" type="array" default="['push']">
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="remove_events" type="array">
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_REVIEW_COMMENT_FOR_A_PULL_REQUEST">
**Tool Name:** Update a review comment for a pull request

**Description**

```text wordWrap
Updates the body of an existing review comment on a pull request.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="comment_id" type="integer" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_REVIEW_FOR_A_PULL_REQUEST">
**Tool Name:** Update a review for a pull request

**Description**

```text wordWrap
Updates the body text of an existing pull request review.
```


**Action Parameters**

<ParamField path="body" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="pull_number" type="integer" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="review_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_TEAM">
**Tool Name:** Update a team

**Description**

```text wordWrap
Updates a team's settings (e.g., name, description, privacy, parent team) within a github organization, identified by its slug and organization name.
```


**Action Parameters**

<ParamField path="description" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="notification_setting" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="parent_team_id" type="integer">
</ParamField>

<ParamField path="permission" type="string" default="pull">
</ParamField>

<ParamField path="privacy" type="string">
</ParamField>

<ParamField path="team_slug" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_WEBHOOK_CONFIGURATION_FOR_AN_ORGANIZATION">
**Tool Name:** Update a webhook configuration for an organization

**Description**

```text wordWrap
Updates the configuration (url, content type, secret, ssl verification) for an existing webhook within a specified organization.
```


**Action Parameters**

<ParamField path="content_type" type="string">
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="insecure_ssl" type="string">
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="secret" type="string">
</ParamField>

<ParamField path="url" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_A_WEBHOOK_CONFIGURATION_FOR_A_REPOSITORY">
**Tool Name:** Update a webhook configuration for a repository

**Description**

```text wordWrap
Updates the configuration (e.g., payload url, content type, secret, ssl verification) for an existing webhook in a specified repository.
```


**Action Parameters**

<ParamField path="content_type" type="string">
</ParamField>

<ParamField path="hook_id" type="integer" required={true}>
</ParamField>

<ParamField path="insecure_ssl" type="string">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="secret" type="string">
</ParamField>

<ParamField path="url" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_BRANCH_PROTECTION">
**Tool Name:** Update branch protection

**Description**

```text wordWrap
Updates the protection settings for an existing branch in a repository, which must not contain wildcard characters.
```


**Action Parameters**

<ParamField path="allow_deletions" type="boolean">
</ParamField>

<ParamField path="allow_force_pushes" type="boolean">
</ParamField>

<ParamField path="allow_fork_syncing" type="boolean">
</ParamField>

<ParamField path="block_creations" type="boolean">
</ParamField>

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="enforce_admins" type="boolean" required={true}>
</ParamField>

<ParamField path="lock_branch" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="required__pull__request__reviews__bypass__pull__request__allowances__apps" type="array">
</ParamField>

<ParamField path="required__pull__request__reviews__bypass__pull__request__allowances__teams" type="array">
</ParamField>

<ParamField path="required__pull__request__reviews__bypass__pull__request__allowances__users" type="array">
</ParamField>

<ParamField path="required__pull__request__reviews__dismiss__stale__reviews" type="boolean">
</ParamField>

<ParamField path="required__pull__request__reviews__dismissal__restrictions__apps" type="array">
</ParamField>

<ParamField path="required__pull__request__reviews__dismissal__restrictions__teams" type="array">
</ParamField>

<ParamField path="required__pull__request__reviews__dismissal__restrictions__users" type="array">
</ParamField>

<ParamField path="required__pull__request__reviews__require__code__owner__reviews" type="boolean">
</ParamField>

<ParamField path="required__pull__request__reviews__require__last__push__approval" type="boolean">
</ParamField>

<ParamField path="required__pull__request__reviews__required__approving__review__count" type="integer">
</ParamField>

<ParamField path="required__status__checks__checks" type="array">
</ParamField>

<ParamField path="required__status__checks__contexts" type="array">
</ParamField>

<ParamField path="required__status__checks__strict" type="boolean">
</ParamField>

<ParamField path="required_conversation_resolution" type="boolean">
</ParamField>

<ParamField path="required_linear_history" type="boolean">
</ParamField>

<ParamField path="restrictions__apps" type="array">
</ParamField>

<ParamField path="restrictions__teams" type="array">
</ParamField>

<ParamField path="restrictions__users" type="array">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_GIT_LFS_PREFERENCE">
**Tool Name:** Update git lfs preference

**Description**

```text wordWrap
Sets the git large file storage (lfs) preference for a repository, typically before initiating a source import.
```


**Action Parameters**

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="use_lfs" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_INFORMATION_ABOUT_A_GITHUB_PAGES_SITE">
**Tool Name:** Update information about a github pages site

**Description**

```text wordWrap
Updates the configuration for a github pages site (e.g., custom domain, https, build type, source); requires github pages to be enabled for the repository, and if `build type` is 'workflow', a corresponding github actions workflow must be configured.
```


**Action Parameters**

<ParamField path="build_type" type="string">
</ParamField>

<ParamField path="cname" type="string">
</ParamField>

<ParamField path="https_enforced" type="boolean">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="source" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_PULL_REQUEST_REVIEW_PROTECTION">
**Tool Name:** Update pull request review protection

**Description**

```text wordWrap
Updates pull request review protection settings (e.g., required approvals, review dismissal, bypass allowances) for a branch; branch protection features must be available for the repository.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="bypass__pull__request__allowances__apps" type="array">
</ParamField>

<ParamField path="bypass__pull__request__allowances__teams" type="array">
</ParamField>

<ParamField path="bypass__pull__request__allowances__users" type="array">
</ParamField>

<ParamField path="dismiss_stale_reviews" type="boolean">
</ParamField>

<ParamField path="dismissal__restrictions__apps" type="array">
</ParamField>

<ParamField path="dismissal__restrictions__teams" type="array">
</ParamField>

<ParamField path="dismissal__restrictions__users" type="array">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="require_code_owner_reviews" type="boolean">
</ParamField>

<ParamField path="require_last_push_approval" type="boolean">
</ParamField>

<ParamField path="required_approving_review_count" type="integer">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_REPOSITORY_PREFERENCES_FOR_CHECK_SUITES">
**Tool Name:** Update repository preferences for check suites

**Description**

```text wordWrap
Updates repository preferences for automatic check suite creation on code pushes, allowing configuration for specific github apps that must be installed on the repository with `checks:write` permission.
```


**Action Parameters**

<ParamField path="auto_trigger_checks" type="array">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_RESOURCE_ACCESS_WITH_TOKENS">
**Tool Name:** Update resource access with tokens

**Description**

```text wordWrap
Revokes organization access for the personal access tokens identified by `pat ids`; this action must be performed by a github app, and `pat ids` must be valid and associated with the organization.
```


**Action Parameters**

<ParamField path="action" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="pat_ids" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_STATUS_CHECK_PROTECTION">
**Tool Name:** Update status check protection

**Description**

```text wordWrap
Updates required status checks for a branch, optionally requiring it to be up-to-date before merging.
```


**Action Parameters**

<ParamField path="branch" type="string" required={true}>
</ParamField>

<ParamField path="checks" type="array">
</ParamField>

<ParamField path="contexts" type="array">
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="strict" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_THE_AUTHENTICATED_USER">
**Tool Name:** Update the authenticated user

**Description**

```text wordWrap
Updates the authenticated user's github profile; a new public email must be verified, and existing private emails remain private even if specified.
```


**Action Parameters**

<ParamField path="bio" type="string">
</ParamField>

<ParamField path="blog" type="string">
</ParamField>

<ParamField path="company" type="string">
</ParamField>

<ParamField path="email" type="string">
</ParamField>

<ParamField path="hireable" type="boolean">
</ParamField>

<ParamField path="location" type="string">
</ParamField>

<ParamField path="name" type="string">
</ParamField>

<ParamField path="twitter_username" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPDATE_TOKEN_ORG_ACCESS">
**Tool Name:** Update token org access

**Description**

```text wordWrap
Revokes a fine-grained personal access token's access to an organization, usable only by github apps when the token has existing access to that organization.
```


**Action Parameters**

<ParamField path="action" type="string" required={true}>
</ParamField>

<ParamField path="org" type="string" required={true}>
</ParamField>

<ParamField path="pat_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_UPLOAD_AN_ANALYSIS_AS_SARIF_DATA">
**Tool Name:** Upload an analysis as sarif data

**Description**

```text wordWrap
Uploads a gzipped and base64 encoded sarif file to a github repository for a specific commit and reference; use `checkout uri` if sarif paths are absolute.
```


**Action Parameters**

<ParamField path="checkout_uri" type="string">
</ParamField>

<ParamField path="commit_sha" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
</ParamField>

<ParamField path="sarif" type="string" required={true}>
</ParamField>

<ParamField path="started_at" type="string">
</ParamField>

<ParamField path="tool_name" type="string">
</ParamField>

<ParamField path="validate" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_USERS_GET_AUTHENTICATED">
**Tool Name:** Get the authenticated user

**Description**

```text wordWrap
[deprecated] retrieves the authenticated user's information; use `get the authenticated user` instead.
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

<Accordion title="GITHUB_USERS_GET_BY_USERNAME">
**Tool Name:** Get a user

**Description**

```text wordWrap
Deprecated: use the `getauser` action to retrieve a github user's public profile by username.
```


**Action Parameters**

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

<Accordion title="GITHUB_USERS_GET_CONTEXT_FOR_USER">
**Tool Name:** Get contextual information for a user

**Description**

```text wordWrap
Retrieves contextual hovercard information for a github user. (deprecated: please use the `get contextual information for a user` action instead).
```


**Action Parameters**

<ParamField path="subject_id" type="string">
</ParamField>

<ParamField path="subject_type" type="string">
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

<Accordion title="GITHUB_USERS_LIST_FOLLOWERS_FOR_AUTHENTICATED_USER">
**Tool Name:** List followers of the authenticated user

**Description**

```text wordWrap
Deprecated: lists users following the authenticated github user; use `list followers of the authenticated user` instead.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_USERS_LIST_PUBLIC_EMAILS_FOR_AUTHENTICATED_USER">
**Tool Name:** List public email addresses for the authenticated user

**Description**

```text wordWrap
Deprecated: use `listpublicemailaddressesfortheauthenticateduser` instead; lists public email addresses for the authenticated user.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GITHUB_USERS_LIST_SOCIAL_ACCOUNTS_FOR_USER">
**Tool Name:** List social accounts for a user

**Description**

```text wordWrap
Deprecated: lists social media accounts for an existing github user; use 'list social accounts for a user' instead.
```


**Action Parameters**

<ParamField path="page" type="integer" default="1">
</ParamField>

<ParamField path="per_page" type="integer" default="30">
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

<Accordion title="GITHUB_VERIFY_DEV_CONTAINER_PERMISSIONS_ACCEPTED">
**Tool Name:** Verify dev container permissions accepted

**Description**

```text wordWrap
Verifies if the authenticated user has accepted permissions for a specific devcontainer configuration in a repository, typically to ensure awareness before a codespace is created or used.
```


**Action Parameters**

<ParamField path="devcontainer_path" type="string" required={true}>
</ParamField>

<ParamField path="owner" type="string" required={true}>
</ParamField>

<ParamField path="ref" type="string" required={true}>
</ParamField>

<ParamField path="repo" type="string" required={true}>
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
