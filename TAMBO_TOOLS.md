# Tambo Workflow Tools

This document explains how the Tambo AI assistant can interact with your Clinks workflow using tools.

## Overview

The Tambo integration includes **workflow tools** that allow the AI to perform real actions in your application, such as adding nodes to the canvas and querying workflow status.

## Available Tools

### 1. `add_workflow_node`

Adds a new node to the workflow canvas.

**Description:** Use this when the user wants to add any type of node (text input, image generator, video generator, etc.) to their workflow. This will create and place the node on the canvas.

**Parameters:**
- `nodeType` (required): The type of node to add
  - Valid values: `text-input`, `image-input`, `image-gen`, `video-gen`, `audio-gen`, `output`, `image-generator`, `video-generator`, `audio-generator`, `logo-generator`, `text-generator`
- `nodeName` (optional): A descriptive name/label for the node (default: "New Node")
- `position` (optional): Position on the canvas
  - `x`: X coordinate (number)
  - `y`: Y coordinate (number)
  - If not provided, a random position will be chosen

**Returns:**
```json
{
  "success": true,
  "nodeId": "node-123456789",
  "message": "Successfully added text-generator node named 'My Generator' at position (200, 150)"
}
```

**Example User Requests:**
- "Add a text generator node"
- "Create an image generator called 'Logo Maker'"
- "Add a video generator at position 300, 200"

### 2. `get_workflow_status`

Gets the current status and statistics of the workflow.

**Description:** Use this when the user asks about the workflow state or wants to know what's currently in their workflow.

**Parameters:** None

**Returns:**
```json
{
  "totalNodes": 5,
  "totalConnections": 3,
  "nodeTypes": {
    "text-generator": 2,
    "image-generator": 1,
    "output": 2
  },
  "isExecuting": false
}
```

**Example User Requests:**
- "Show me my workflow status"
- "What nodes do I have?"
- "How many generators are in my workflow?"

## Implementation Details

### Tool Registration

Tools are registered with the `TamboProvider` in `components/client-providers.tsx`:

```tsx
<TamboProvider apiKey={apiKey} tools={tools}>
  {children}
</TamboProvider>
```

### Tool Creation

Tools are created in `lib/tambo-tools.ts` using the `createWorkflowTools` function, which takes the workflow context:

```typescript
const tools = createWorkflowTools({
  addNode,              // Function to add a node
  getNodes: () => nodes,    // Function to get current nodes
  getConnections: () => connections,  // Function to get connections
  isExecuting,          // Current execution state
});
```

### Tool Schema

Each tool uses a Zod schema to define its parameters:

```typescript
{
  name: "add_workflow_node",
  description: "Add a new node to the workflow canvas...",
  tool: addNodeTool,           // The actual function
  toolSchema: AddNodeArgsSchema, // Zod schema for parameters
}
```

## How It Works

1. **User sends a message** like "Add a text generator node"
2. **Tambo AI processes the message** and determines it needs to use the `add_workflow_node` tool
3. **AI calls the tool** with appropriate parameters: `{ nodeType: "text-generator", nodeName: "Text Generator" }`
4. **Tool executes** the `addNode` function from the workflow context
5. **Node appears on canvas** immediately
6. **AI responds** with a confirmation message to the user

## Testing

To test the tools:

1. Open the AI Assistant by clicking the button at the bottom of the screen
2. Try these commands:
   - "Add a text generator node"
   - "Add an image generator called 'My Logo Maker'"
   - "Show me the workflow status"
   - "Create 3 text generators"

## Extending with New Tools

To add new tools:

1. Define the tool function in `lib/tambo-tools.ts`:
```typescript
const myNewTool = async (args: z.infer<typeof MyArgsSchema>) => {
  // Implement your tool logic
  return { success: true, message: "Done!" };
};
```

2. Create a Zod schema for the arguments:
```typescript
const MyArgsSchema = z.object({
  param1: z.string().describe("Description of param1"),
  param2: z.number().optional(),
});
```

3. Add to the tools array:
```typescript
return [
  // ... existing tools
  {
    name: "my_new_tool",
    description: "What this tool does",
    tool: myNewTool,
    toolSchema: MyArgsSchema,
  },
];
```

## Troubleshooting

### Tool Not Being Called

If the AI doesn't call your tool:
- Check that the tool description clearly explains when to use it
- Ensure the tool name is descriptive
- Verify the tool is properly registered in the tools array

### Tool Execution Errors

If the tool executes but fails:
- Check browser console for error messages
- Verify the workflow context is available
- Ensure the tool returns the expected schema

### Schema Validation Errors

If you see schema-related errors:
- Verify your Zod schema matches what you're returning
- Check that all required parameters are provided
- Ensure parameter types match (string, number, boolean, etc.)

## Related Documentation

- [TAMBO_INTEGRATION.md](./TAMBO_INTEGRATION.md) - General Tambo setup
- [TAMBO_TROUBLESHOOTING.md](./TAMBO_TROUBLESHOOTING.md) - Common issues
- [Tambo Tools Documentation](https://docs.tambo.co/concepts/tools) - Official docs