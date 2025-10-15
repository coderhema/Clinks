# Tambo Tools Architecture Diagram

## Component Hierarchy

```
app/layout.tsx
    └── ClientProviders (wraps entire app)
            ├── WorkflowProvider (provides workflow state)
            │       └── app/page.tsx
            │               ├── WorkflowCanvas
            │               ├── NodeLibrary
            │               ├── PreviewPanel
            │               └── MessageThreadCollapsible (Tambo chat)
            │
            └── TamboProvider (when API key is valid)
                    └── tools={workflowTools} ← Tools registered here
```

## Tool Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER TYPES: "Add a text generator node"                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. MessageThreadCollapsible sends message via useTamboThread   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Tambo API processes with LLM                                 │
│    - Analyzes user intent                                       │
│    - Identifies "add_workflow_node" tool is needed              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Tambo calls tool function with parameters:                  │
│    { nodeType: "text-generator", nodeName: "Text Generator" }   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. lib/tambo-tools.ts:addNodeTool() executes                   │
│    - Validates parameters                                       │
│    - Calculates position                                        │
│    - Calls context.addNode()                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. WorkflowProvider:addNode() updates state                     │
│    - Creates new node with unique ID                            │
│    - Adds to nodes array                                        │
│    - Triggers React re-render                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. WorkflowCanvas displays new node                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Tool returns success response to Tambo                       │
│    { success: true, nodeId: "node-123", message: "Success!" }  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. AI generates natural language response                       │
│    "I've added a text generator node to your workflow!"         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. User sees message in chat + node on canvas ✓               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────┐
│ WorkflowProvider    │
│ ┌─────────────────┐ │
│ │ State:          │ │
│ │ - nodes []      │ │
│ │ - connections []│ │
│ │ - isExecuting   │ │
│ │                 │ │
│ │ Methods:        │ │
│ │ - addNode()     │ │◄────┐
│ │ - updateNode()  │ │     │
│ │ - deleteNode()  │ │     │
│ └─────────────────┘ │     │
└─────────────────────┘     │
           ↓                │
    (provides context)      │
           ↓                │
┌─────────────────────┐     │
│ TamboProvider       │     │
│                     │     │
│ tools = [           │     │
│   add_workflow_node │─────┘ (calls addNode)
│   get_workflow_status│
│ ]                   │
└─────────────────────┘
           ↓
    (AI can call tools)
           ↓
┌─────────────────────┐
│ MessageThread       │
│ Collapsible         │
└─────────────────────┘
```

## File Structure

```
Clinks/
├── lib/
│   └── tambo-tools.ts           ← Tool definitions & logic
│
├── components/
│   ├── client-providers.tsx     ← Wraps app, registers tools
│   ├── workflow-provider.tsx    ← Provides workflow state
│   └── ...
│
├── source/components/
│   └── message-thread-collapsible.tsx  ← Chat UI
│
└── app/
    ├── layout.tsx               ← Root, uses ClientProviders
    └── page.tsx                 ← Main workflow page
```

## Tool Schema Definition

```typescript
// lib/tambo-tools.ts

// 1. Define argument schema
const AddNodeArgsSchema = z.object({
  nodeType: z.enum([...]),
  nodeName: z.string().default("New Node"),
  position: z.object({ x: z.number(), y: z.number() }).optional()
});

// 2. Define tool function
const addNodeTool = async (args: z.infer<typeof AddNodeArgsSchema>) => {
  const nodeId = context.addNode({ ... });
  return { success: true, nodeId, message: "..." };
};

// 3. Export as TamboTool
{
  name: "add_workflow_node",
  description: "...",
  tool: addNodeTool,
  toolSchema: AddNodeArgsSchema
}
```

## Key Concepts

1. **Tools are async functions** - They can call APIs, update state, etc.
2. **Zod schemas define parameters** - Type-safe and validated
3. **Context provides app state** - Tools have access to workflow methods
4. **Tools return structured data** - AI uses this to generate responses
5. **Registration happens at provider level** - Tools available to all messages

## Example Tool Call

```json
{
  "tool": "add_workflow_node",
  "arguments": {
    "nodeType": "text-generator",
    "nodeName": "My Generator",
    "position": { "x": 200, "y": 150 }
  }
}
```

↓ Tool executes ↓

```json
{
  "success": true,
  "nodeId": "node-1234567890",
  "message": "Successfully added text-generator node named 'My Generator' at position (200, 150)"
}
```
