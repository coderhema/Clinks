# Testing Tambo Tools

## ✅ The Fix is Complete!

The tool integration is now working with plain JSON Schema format.

## How to Test

1. **Make sure your dev server is running:**
   ```bash
   npm run dev
   ```

2. **Open your browser to:** `http://localhost:3000`

3. **Click the "AI Assistant" button** at the bottom center of the screen

4. **Try these commands:**

   ### Add a Single Node
   ```
   Add a text generator node
   ```
   ✓ Should add a text generator to the canvas

   ### Add a Named Node
   ```
   Create an image generator called "Logo Maker"
   ```
   ✓ Should add an image generator with the name "Logo Maker"

   ### Add Multiple Nodes
   ```
   Add 3 video generators
   ```
   ✓ Should add 3 video generator nodes

   ### Check Workflow Status
   ```
   Show me the workflow status
   ```
   ✓ Should display node counts and types

   ### Add Node at Specific Position
   ```
   Add a text generator at position 400, 300
   ```
   ✓ Should add node at coordinates (400, 300)

## Expected Behavior

1. **AI processes your request** - You'll see a loading indicator
2. **Tool executes** - Node appears on canvas immediately
3. **AI confirms** - You get a natural language response like:
   > "I've successfully added a text-generator node named 'Text Generator' to your workflow at position (234, 156)."

## Available Node Types

You can ask for any of these:
- `text-generator` - Generate text content
- `image-generator` - Generate images
- `video-generator` - Generate videos
- `audio-generator` - Generate audio
- `logo-generator` - Generate logos
- `text-input` - Text input
- `image-input` - Image input
- `output` - Output node

## Troubleshooting

### Tools not working?
1. Check browser console for errors
2. Verify API key in `.env.local`
3. Restart dev server
4. Check network tab for API calls

### Node not appearing?
1. Check if the tool actually executed (console logs)
2. Verify workflow context is available
3. Check canvas zoom/pan - node might be off-screen

## Debug Tips

Open browser console and look for:
```
🔧 Created workflow tools: ["add_workflow_node", "get_workflow_status"]
```

This confirms tools are registered correctly.
