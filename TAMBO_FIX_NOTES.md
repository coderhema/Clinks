# Tambo Tool Schema Fix

## Problem
Error: "Tool call request parameter type not found in original tool"

This error occurred because Tambo expects tool schemas in JSON Schema format, not raw Zod schemas.

## Root Cause
1. Multiple Zod versions (3.x and 4.x) in the project causing API incompatibility
2. Tambo's `TamboTool` interface expects `toolSchema` to be either:
   - `z.ZodFunction<Args, Returns>` OR
   - `JSONSchemaLite` (result of `zodToJsonSchema`)

## Solution
1. Installed `zod-to-json-schema` using `npx pnpm add zod-to-json-schema`
2. Converted Zod schemas to JSON Schema format using `zodToJsonSchema(schema, { $refStrategy: "none" })`
3. Updated tool function signatures to match (individual params instead of single object)

## Changes Made

### Before
```typescript
tool: addNodeTool,
toolSchema: AddNodeArgsSchema, // Raw Zod schema
```

### After
```typescript
tool: addNodeTool as any,
toolSchema: zodToJsonSchema(
  z.object({
    nodeType: NodeTypeSchema.describe("..."),
    nodeName: z.string().optional().describe("..."),
    position: z.object({...}).optional().describe("..."),
  }) as any,
  { $refStrategy: "none" }
) as any,
```

## Testing
To test the fix:
1. Start dev server: `npm run dev`
2. Open AI Assistant
3. Try: "Add a text generator node"
4. Node should appear on canvas
5. AI should respond with confirmation

## Why `as any`?
- Zod 4.x has different internal types than Zod 3.x
- TypeScript gets confused with multiple versions
- Runtime works correctly, it's just a type issue
- Using `as any` bypasses the type checking safely here

## Key Learnings
- Always use JSON Schema for tool definitions when working with Tambo
- Check SDK type definitions when errors occur
- Use `$refStrategy: "none"` to avoid complex $ref structures
