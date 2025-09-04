---
title: Googlesheets
subtitle: Learn how to use Googlesheets with Composio
category: Productivity & Project Management
image:
  type: url
  value: 'https://og.composio.dev/api/og?title=Using%20Googlesheets%20with%20Composio'
---


## Overview

**SLUG**: `GOOGLESHEETS`

### Description
Google Sheets is a cloud-based spreadsheet tool enabling real-time collaboration, data analysis, and integration with other Google Workspace apps

### Authentication Details

<Accordion title="OAuth2">
<ParamField path="client_id" type="string" required={true}>
</ParamField>

<ParamField path="client_secret" type="string" required={true}>
</ParamField>

<ParamField path="oauth_redirect_uri" type="string" default="https://backend.composio.dev/api/v1/auth-apps/add">
</ParamField>

<ParamField path="scopes" type="string" default="https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/userinfo.email">
</ParamField>

<ParamField path="bearer_token" type="string">
</ParamField>

</Accordion>


## Connecting to Googlesheets
### Create an auth config
Use the dashboard to create an auth config for the Googlesheets toolkit. This allows you to connect multiple Googlesheets accounts to Composio for agents to use.

<Steps>
  <Step title="Select App">
    Navigate to **[Googlesheets](https://platform.composio.dev/marketplace/Googlesheets)**.
  </Step>
  <Step title="Configure Auth Config Settings">
    Select among the supported auth schemes of and configure them here.
  </Step>
  <Step title="Create and Get auth config ID">
    Click **"Create Googlesheets Auth Config"**. After creation, **copy the displayed ID starting with `ac_`**. This is your auth config ID. This is _not_ a sensitive ID -- you can save it in environment variables or a database.
    **This ID will be used to create connections to the toolkit for a given user.**
  </Step>
</Steps>


### Connect Your Account

#### Using OAuth2

<CodeGroup>
```python title="Python" maxLines=40 wordWrap
from composio import Composio

# Replace these with your actual values
googlesheets_auth_config_id = "ac_YOUR_GOOGLESHEETS_CONFIG_ID" # Auth config ID created above
user_id = "0000-0000-0000"  # UUID from database/application

composio = Composio()


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Googlesheets: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, googlesheets_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
```
```typescript title="TypeScript" maxLines=40 wordWrap
import { Composio } from '@composio/core';

// Replace these with your actual values
const googlesheets_auth_config_id = "ac_YOUR_GOOGLESHEETS_CONFIG_ID"; // Auth config ID created above
const userId = "user@example.com"; // User ID from database/application

const composio = new Composio();

async function authenticateToolkit(userId: string, authConfigId: string) {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );

  console.log(`Visit this URL to authenticate Googlesheets: ${connectionRequest.redirectUrl}`);
  
  // This will wait for the auth flow to be completed
  await connectionRequest.waitForConnection(60);
  
  return connectionRequest.id;
}

// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, googlesheets_auth_config_id);

// You can also verify the connection status using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);
```
</CodeGroup>


## Tools

### Executing tools

To prototype you can execute some tools to see the responses and working on the [Googlesheets toolkit's playground](https://app.composio.dev/app/Googlesheets)

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

tools = composio.tools.get(user_id=user_id, toolkits=["GOOGLESHEETS"])

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

// Get tools for Googlesheets
const tools = await composio.tools.get(userId, {
  toolkits: ["GOOGLESHEETS"],
});

console.log("[!] Tools:", tools);

// Create a message with the tools
const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  messages: [
    {
      role: 'user',
      content: 'What can you do with Googlesheets?', // Your task here!
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

# Get tools for Googlesheets
tools = composio.tools.get(user_id, toolkits=["GOOGLESHEETS"])

print("[!] Tools:", tools)

# Create genai client config
config = types.GenerateContentConfig(tools=tools)

# Use the chat interface
chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("What can you do with Googlesheets?")
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

// Get tools for Googlesheets
const tools = await composio.tools.get(userId, { 
  toolkits: ["GOOGLESHEETS"] 
});

console.log("[!] Tools:", tools);

// Generate text with tools
const { text } = await generateText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  messages: [
    {
      role: 'user',
      content: "What can you do with Googlesheets?", // Your task here!
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
<Accordion title="GOOGLESHEETS_ADD_SHEET">
**Tool Name:** Add Sheet to Spreadsheet

**Description**

```text wordWrap
Adds a new sheet (worksheet) to a spreadsheet. use this tool to create a new tab within an existing google sheet, optionally specifying its title, index, size, and other properties.
```


**Action Parameters**

<ParamField path="includeSpreadsheetInResponse" type="boolean">
</ParamField>

<ParamField path="properties" type="object">
</ParamField>

<ParamField path="responseIncludeGridData" type="boolean">
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_AGGREGATE_COLUMN_DATA">
**Tool Name:** Aggregate Column Data

**Description**

```text wordWrap
Searches for rows where a specific column matches a value and performs mathematical operations on data from another column.
```


**Action Parameters**

<ParamField path="case_sensitive" type="boolean" default="True">
</ParamField>

<ParamField path="has_header_row" type="boolean" default="True">
</ParamField>

<ParamField path="operation" type="string" required={true}>
</ParamField>

<ParamField path="percentage_total" type="number">
</ParamField>

<ParamField path="search_column" type="string" required={true}>
</ParamField>

<ParamField path="search_value" type="string" required={true}>
</ParamField>

<ParamField path="sheet_name" type="string" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>

<ParamField path="target_column" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_APPEND_DIMENSION">
**Tool Name:** Append Dimension

**Description**

```text wordWrap
Tool to append new rows or columns to a sheet, increasing its size. use when you need to add empty rows or columns to an existing sheet.
```


**Action Parameters**

<ParamField path="dimension" type="string" required={true}>
</ParamField>

<ParamField path="length" type="integer" required={true}>
</ParamField>

<ParamField path="sheet_id" type="integer" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_BATCH_GET">
**Tool Name:** Batch get spreadsheet

**Description**

```text wordWrap
Retrieves data from specified cell ranges in a google spreadsheet; ensure the spreadsheet has at least one worksheet and any explicitly referenced sheet names in ranges exist.
```


**Action Parameters**

<ParamField path="ranges" type="array">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_BATCH_UPDATE">
**Tool Name:** Batch update spreadsheet

**Description**

```text wordWrap
Updates a specified range in a google sheet with given values, or appends them as new rows if `first cell location` is omitted; ensure the target sheet exists and the spreadsheet contains at least one worksheet.
```


**Action Parameters**

<ParamField path="first_cell_location" type="string">
</ParamField>

<ParamField path="includeValuesInResponse" type="boolean">
</ParamField>

<ParamField path="sheet_name" type="string" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>

<ParamField path="valueInputOption" type="string" default="USER_ENTERED">
</ParamField>

<ParamField path="values" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_BATCH_UPDATE_VALUES_BY_DATA_FILTER">
**Tool Name:** Batch Update Values by Data Filter

**Description**

```text wordWrap
Tool to update values in ranges matching data filters. use when you need to update specific data in a google sheet based on criteria rather than fixed cell ranges.
```


**Action Parameters**

<ParamField path="data" type="array" required={true}>
</ParamField>

<ParamField path="includeValuesInResponse" type="boolean">
</ParamField>

<ParamField path="responseDateTimeRenderOption" type="string" default="SERIAL_NUMBER">
</ParamField>

<ParamField path="responseValueRenderOption" type="string" default="FORMATTED_VALUE">
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>

<ParamField path="valueInputOption" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_CLEAR_BASIC_FILTER">
**Tool Name:** Clear Basic Filter

**Description**

```text wordWrap
Tool to clear the basic filter from a sheet. use when you need to remove an existing basic filter from a specific sheet within a google spreadsheet.
```


**Action Parameters**

<ParamField path="sheet_id" type="integer" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_CLEAR_VALUES">
**Tool Name:** Clear spreadsheet values

**Description**

```text wordWrap
Clears cell content (preserving formatting and notes) from a specified a1 notation range in a google spreadsheet; the range must correspond to an existing sheet and cells.
```


**Action Parameters**

<ParamField path="range" type="string" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_CREATE_CHART">
**Tool Name:** Create Chart in Google Sheets

**Description**

```text wordWrap
Create a chart in a google sheets spreadsheet using the specified data range and chart type.
```


**Action Parameters**

<ParamField path="background_blue" type="number">
</ParamField>

<ParamField path="background_green" type="number">
</ParamField>

<ParamField path="background_red" type="number">
</ParamField>

<ParamField path="chart_type" type="string" required={true}>
</ParamField>

<ParamField path="data_range" type="string" required={true}>
</ParamField>

<ParamField path="legend_position" type="string" default="BOTTOM_LEGEND">
</ParamField>

<ParamField path="sheet_id" type="integer">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>

<ParamField path="subtitle" type="string">
</ParamField>

<ParamField path="title" type="string">
</ParamField>

<ParamField path="x_axis_title" type="string">
</ParamField>

<ParamField path="y_axis_title" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_CREATE_GOOGLE_SHEET1">
**Tool Name:** Create a Google Sheet

**Description**

```text wordWrap
Creates a new google spreadsheet in google drive using the provided title.
```


**Action Parameters**

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

<Accordion title="GOOGLESHEETS_CREATE_SPREADSHEET_COLUMN">
**Tool Name:** Create spreadsheet column

**Description**

```text wordWrap
Creates a new column in a google spreadsheet, requiring a valid `spreadsheet id` and an existing `sheet id`; an out-of-bounds `insert index` may append/prepend the column.
```


**Action Parameters**

<ParamField path="inherit_from_before" type="boolean">
</ParamField>

<ParamField path="insert_index" type="integer">
</ParamField>

<ParamField path="sheet_id" type="integer" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_CREATE_SPREADSHEET_ROW">
**Tool Name:** Create spreadsheet row

**Description**

```text wordWrap
Inserts a new, empty row into a specified sheet of a google spreadsheet at a given index, optionally inheriting formatting from the row above.
```


**Action Parameters**

<ParamField path="inherit_from_before" type="boolean">
</ParamField>

<ParamField path="insert_index" type="integer">
</ParamField>

<ParamField path="sheet_id" type="integer" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_DELETE_DIMENSION">
**Tool Name:** Delete Dimension (Rows/Columns)

**Description**

```text wordWrap
Tool to delete specified rows or columns from a sheet in a google spreadsheet. use when you need to remove a range of rows or columns.
```


**Action Parameters**

<ParamField path="delete_dimension_request" type="object" required={true}>
</ParamField>

<ParamField path="include_spreadsheet_in_response" type="boolean">
</ParamField>

<ParamField path="response_include_grid_data" type="boolean">
</ParamField>

<ParamField path="response_ranges" type="array">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_DELETE_SHEET">
**Tool Name:** Delete Sheet

**Description**

```text wordWrap
Tool to delete a sheet (worksheet) from a spreadsheet. use when you need to remove a specific sheet from a google sheet document.
```


**Action Parameters**

<ParamField path="sheet_id" type="integer" required={true}>
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_EXECUTE_SQL">
**Tool Name:** Execute SQL on Spreadsheet

**Description**

```text wordWrap
Execute sql queries against google sheets tables. supports select, insert, update, and delete operations with familiar sql syntax. tables are automatically detected and mapped from the spreadsheet structure.
```


**Action Parameters**

<ParamField path="delete_method" type="string" default="clear">
</ParamField>

<ParamField path="dry_run" type="boolean">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>

<ParamField path="sql" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="affected_rows" type="integer" required={true}>
</ParamField>

<ParamField path="data" type="array">
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="message" type="string" required={true}>
</ParamField>

<ParamField path="operation" type="string" required={true}>
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

<ParamField path="table_schema" type="array">
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_FIND_WORKSHEET_BY_TITLE">
**Tool Name:** Find worksheet by title

**Description**

```text wordWrap
Finds a worksheet by its exact, case-sensitive title within a google spreadsheet; returns a boolean indicating if found and the complete metadata of the entire spreadsheet, regardless of whether the target worksheet is found.
```


**Action Parameters**

<ParamField path="spreadsheet_id" type="string" required={true}>
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

<Accordion title="GOOGLESHEETS_FORMAT_CELL">
**Tool Name:** Format cell

**Description**

```text wordWrap
Applies text and background cell formatting to a specified range in a google sheets worksheet.
```


**Action Parameters**

<ParamField path="blue" type="number" default="0.9">
</ParamField>

<ParamField path="bold" type="boolean">
</ParamField>

<ParamField path="end_column_index" type="integer" required={true}>
</ParamField>

<ParamField path="end_row_index" type="integer" required={true}>
</ParamField>

<ParamField path="fontSize" type="integer" default="10">
</ParamField>

<ParamField path="green" type="number" default="0.9">
</ParamField>

<ParamField path="italic" type="boolean">
</ParamField>

<ParamField path="red" type="number" default="0.9">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>

<ParamField path="start_column_index" type="integer" required={true}>
</ParamField>

<ParamField path="start_row_index" type="integer" required={true}>
</ParamField>

<ParamField path="strikethrough" type="boolean">
</ParamField>

<ParamField path="underline" type="boolean">
</ParamField>

<ParamField path="worksheet_id" type="integer" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_GET_SHEET_NAMES">
**Tool Name:** Get sheet names

**Description**

```text wordWrap
Lists all worksheet names from a specified google spreadsheet (which must exist), useful for discovering sheets before further operations.
```


**Action Parameters**

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_GET_SPREADSHEET_BY_DATA_FILTER">
**Tool Name:** Get Spreadsheet by Data Filter

**Description**

```text wordWrap
Returns the spreadsheet at the given id, filtered by the specified data filters. use this tool when you need to retrieve specific subsets of data from a google sheet based on criteria like a1 notation, developer metadata, or grid ranges.
```


**Action Parameters**

<ParamField path="dataFilters" type="array" required={true}>
</ParamField>

<ParamField path="excludeTablesInBandedRanges" type="boolean">
</ParamField>

<ParamField path="includeGridData" type="boolean">
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_GET_SPREADSHEET_INFO">
**Tool Name:** Get spreadsheet info

**Description**

```text wordWrap
Retrieves comprehensive metadata for a google spreadsheet using its id, excluding cell data.
```


**Action Parameters**

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_GET_TABLE_SCHEMA">
**Tool Name:** Get Table Schema

**Description**

```text wordWrap
This action is used to get the schema of a table in a google spreadsheet, call this action to get the schema of a table in a spreadsheet before you query the table. analyze table structure and infer column names, types, and constraints. uses statistical analysis of sample data to determine the most likely data type for each column. call this action after calling the list tables action to get the schema of a table in a spreadsheet.
```


**Action Parameters**

<ParamField path="sample_size" type="integer" default="50">
</ParamField>

<ParamField path="sheet_name" type="string">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>

<ParamField path="table_name" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_INSERT_DIMENSION">
**Tool Name:** Insert Dimension in Google Sheet

**Description**

```text wordWrap
Tool to insert new rows or columns into a sheet at a specified location. use when you need to add empty rows or columns within an existing google sheet.
```


**Action Parameters**

<ParamField path="include_spreadsheet_in_response" type="boolean">
</ParamField>

<ParamField path="insert_dimension" type="object" required={true}>
</ParamField>

<ParamField path="response_include_grid_data" type="boolean">
</ParamField>

<ParamField path="response_ranges" type="array">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_LIST_TABLES">
**Tool Name:** List Tables in Spreadsheet

**Description**

```text wordWrap
This action is used to list all tables in a google spreadsheet, call this action to get the list of tables in a spreadsheet. discover all tables in a google spreadsheet by analyzing sheet structure and detecting data patterns. uses heuristic analysis to find header rows, data boundaries, and table structures.
```


**Action Parameters**

<ParamField path="min_columns" type="integer" default="1">
</ParamField>

<ParamField path="min_confidence" type="number" default="0.5">
</ParamField>

<ParamField path="min_rows" type="integer" default="2">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW">
**Tool Name:** Look up spreadsheet row

**Description**

```text wordWrap
Finds the first row in a google spreadsheet where a cell's entire content exactly matches the query string, searching within a specified a1 notation range or the first sheet by default.
```


**Action Parameters**

<ParamField path="case_sensitive" type="boolean">
</ParamField>

<ParamField path="query" type="string" required={true}>
</ParamField>

<ParamField path="range" type="string">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_QUERY_TABLE">
**Tool Name:** Query Spreadsheet Table

**Description**

```text wordWrap
This action is used to query a table in a google spreadsheet, call this action to query a table in a spreadsheet. execute sql-like select queries against spreadsheet tables. supports where conditions, order by, limit clauses. call this action after calling the get table schema action to query a table in a spreadsheet.
```


**Action Parameters**

<ParamField path="include_formulas" type="boolean">
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>

<ParamField path="sql" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_SEARCH_DEVELOPER_METADATA">
**Tool Name:** Search Developer Metadata

**Description**

```text wordWrap
Tool to search for developer metadata in a spreadsheet. use when you need to find specific metadata entries based on filters.
```


**Action Parameters**

<ParamField path="dataFilters" type="array" required={true}>
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_SEARCH_SPREADSHEETS">
**Tool Name:** Search Spreadsheets

**Description**

```text wordWrap
Search for google spreadsheets using various filters including name, content, date ranges, and more.
```


**Action Parameters**

<ParamField path="created_after" type="string">
</ParamField>

<ParamField path="include_trashed" type="boolean">
</ParamField>

<ParamField path="max_results" type="integer" default="10">
</ParamField>

<ParamField path="modified_after" type="string">
</ParamField>

<ParamField path="order_by" type="string" default="modifiedTime desc">
</ParamField>

<ParamField path="query" type="string">
</ParamField>

<ParamField path="shared_with_me" type="boolean">
</ParamField>

<ParamField path="starred_only" type="boolean">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_SET_BASIC_FILTER">
**Tool Name:** Set Basic Filter

**Description**

```text wordWrap
Tool to set a basic filter on a sheet in a google spreadsheet. use when you need to filter or sort data within a specific range on a sheet.
```


**Action Parameters**

<ParamField path="filter" type="object" required={true}>
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_SHEET_FROM_JSON">
**Tool Name:** Create sheet from JSON

**Description**

```text wordWrap
Creates a new google spreadsheet and populates its first worksheet from `sheet json`, which must be non-empty as its first item's keys establish the headers.
```


**Action Parameters**

<ParamField path="sheet_json" type="array" required={true}>
</ParamField>

<ParamField path="sheet_name" type="string" required={true}>
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

<Accordion title="GOOGLESHEETS_SPREADSHEETS_SHEETS_COPY_TO">
**Tool Name:** Copy Sheet to Another Spreadsheet

**Description**

```text wordWrap
Tool to copy a single sheet from a spreadsheet to another spreadsheet. use when you need to duplicate a sheet into a different spreadsheet.
```


**Action Parameters**

<ParamField path="destination_spreadsheet_id" type="string" required={true}>
</ParamField>

<ParamField path="sheet_id" type="integer" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND">
**Tool Name:** Append Values to Spreadsheet

**Description**

```text wordWrap
Tool to append values to a spreadsheet. use when you need to add new data to the end of an existing table in a google sheet.
```


**Action Parameters**

<ParamField path="includeValuesInResponse" type="boolean">
</ParamField>

<ParamField path="insertDataOption" type="string">
</ParamField>

<ParamField path="majorDimension" type="string">
</ParamField>

<ParamField path="range" type="string" required={true}>
</ParamField>

<ParamField path="responseDateTimeRenderOption" type="string">
</ParamField>

<ParamField path="responseValueRenderOption" type="string">
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>

<ParamField path="valueInputOption" type="string" required={true}>
</ParamField>

<ParamField path="values" type="array" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_SPREADSHEETS_VALUES_BATCH_CLEAR">
**Tool Name:** Batch Clear Spreadsheet Values

**Description**

```text wordWrap
Tool to clear one or more ranges of values from a spreadsheet. use when you need to remove data from specific cells or ranges while keeping formatting and other properties intact.
```


**Action Parameters**

<ParamField path="ranges" type="array" required={true}>
</ParamField>

<ParamField path="spreadsheet_id" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_SPREADSHEETS_VALUES_BATCH_CLEAR_BY_DATA_FILTER">
**Tool Name:** Batch Clear Values By Data Filter

**Description**

```text wordWrap
Clears one or more ranges of values from a spreadsheet using data filters. the caller must specify the spreadsheet id and one or more datafilters. ranges matching any of the specified data filters will be cleared. only values are cleared -- all other properties of the cell (such as formatting, data validation, etc..) are kept.
```


**Action Parameters**

<ParamField path="dataFilters" type="array" required={true}>
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_SPREADSHEETS_VALUES_BATCH_GET_BY_DATA_FILTER">
**Tool Name:** Batch Get Spreadsheet Values by Data Filter

**Description**

```text wordWrap
Tool to return one or more ranges of values from a spreadsheet that match the specified data filters. use when you need to retrieve specific data sets based on filtering criteria rather than entire sheets or fixed ranges.
```


**Action Parameters**

<ParamField path="dataFilters" type="array" required={true}>
</ParamField>

<ParamField path="dateTimeRenderOption" type="string">
</ParamField>

<ParamField path="majorDimension" type="string">
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>

<ParamField path="valueRenderOption" type="string">
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_UPDATE_SHEET_PROPERTIES">
**Tool Name:** Update Sheet Properties

**Description**

```text wordWrap
Tool to update properties of a sheet (worksheet) within a google spreadsheet, such as its title, index, visibility, tab color, or grid properties. use this when you need to modify the metadata or appearance of a specific sheet.
```


**Action Parameters**

<ParamField path="spreadsheetId" type="string" required={true}>
</ParamField>

<ParamField path="updateSheetProperties" type="object" required={true}>
</ParamField>


**Action Response**

<ParamField path="data" type="object" required={true}>
</ParamField>

<ParamField path="error" type="string">
</ParamField>

<ParamField path="successful" type="boolean" required={true}>
</ParamField>

</Accordion>

<Accordion title="GOOGLESHEETS_UPDATE_SPREADSHEET_PROPERTIES">
**Tool Name:** Update Spreadsheet Properties

**Description**

```text wordWrap
Tool to update properties of a spreadsheet, such as its title, locale, or auto-recalculation settings. use when you need to modify the overall configuration of a google sheet.
```


**Action Parameters**

<ParamField path="fields" type="string" required={true}>
</ParamField>

<ParamField path="properties" type="object" required={true}>
</ParamField>

<ParamField path="spreadsheetId" type="string" required={true}>
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
