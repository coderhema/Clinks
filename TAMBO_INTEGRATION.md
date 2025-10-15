# Tambo AI Integration - Clinks Workflow Builder

This document describes the Tambo AI integration in Clinks, which provides an agentic AI assistant that can help build and manage your workflows.

## 🚀 Features

### 1. **AI Workflow Assistant**
- Interactive chat interface with cyberpunk-themed design
- Bottom-center positioned chat bubble for easy access
- Real-time message streaming
- Automatic component rendering

### 2. **Agentic Node Management**
The AI assistant can autonomously add nodes to your workflow canvas:

- **Text Input** - Input text prompts
- **Image Input** - Upload reference images
- **Text Generator** - Generate AI text content
- **Image Generator** - Generate AI images
- **Video Generator** - Create AI videos
- **Logo Generator** - Generate brand logos
- **Audio Generator** - Generate audio content
- **Output** - Export any results

### 3. **Workflow Status Tracking**
The AI can display real-time workflow information including:
- Total number of nodes
- Number of connections
- Node type breakdown
- Execution status

## 📋 Setup Instructions

### Step 1: Get Your API Key

1. Go to [https://tambo.co](https://tambo.co) and sign up for a free account
2. Get your API key from the Tambo dashboard
3. Open the `.env.local` file in your project root
4. Replace `your_api_key_here` with your actual API key:

```env
NEXT_PUBLIC_TAMBO_API_KEY=your_actual_api_key_here
```

### Step 2: Run Your Application

```bash
npx pnpm run dev
```

### Step 3: Start Using the AI Assistant

1. Look for the **"AI ASSISTANT"** button at the bottom-center of your screen
2. Click it to open the chat interface
3. Start asking the AI to help with your workflow!

## 💬 Example Prompts

Try these commands with your AI assistant:

### Adding Nodes
```
"Add a text input node"
"Create an image generator node"
"Add a video generator to my workflow"
"I need a logo generator node"
```

### Workflow Information
```
"Show me my workflow status"
"How many nodes do I have?"
"What's the current state of my workflow?"
```

### Building Complete Workflows
```
"Create a text-to-image workflow"
"Set up a logo generation pipeline"
"Build a workflow for generating videos from text"
```

## 🎨 Design System

The Tambo integration follows Clinks' cyberpunk design system:

- **Primary Color**: Deep purple/blue (`oklch(0.4703 0.2364 263.19)`)
- **Background**: Dark charcoal (`oklch(0.2029 0.0037 345.62)`)
- **Success**: Bright green (`oklch(0.7 0.15 142)`)
- **Warning**: Orange/red (`oklch(0.65 0.2 45)`)
- **Typography**: Monospace font with uppercase tracking
- **Effects**: Glow effects, sharp corners, high contrast borders

## 🔧 Technical Architecture

### Components

#### 1. **MessageThreadCollapsible** (`source/components/message-thread-collapsible.tsx`)
- Main chat interface component
- Manages message display and user input
- Handles Tambo thread integration

#### 2. **AddNodeComponent** (`source/components/tambo/add-node.tsx`)
- Registered Tambo component for adding nodes
- Automatically adds nodes to the workflow canvas
- Displays confirmation with node details

#### 3. **WorkflowStatusComponent** (`source/components/tambo/workflow-status.tsx`)
- Registered Tambo component for showing workflow status
- Real-time workflow statistics
- Node type breakdown and execution status

#### 4. **ClientProviders** (`components/client-providers.tsx`)
- Wraps app with TamboProvider
- Registers custom components with Tambo
- Configures API key and component schemas

### Hooks Used

- `useTamboThread()` - Access thread messages and state
- `useTamboThreadInput()` - Handle user input and message submission
- `useWorkflow()` - Access and modify workflow state

## 🛠️ Customization

### Adding New Components

To add new Tambo-renderable components:

1. Create your component in `source/components/tambo/`
2. Export a Zod schema for props validation
3. Register in `components/client-providers.tsx`:

```tsx
const newComponentSchema = z.object({
  // your props
});

const tamboComponents = [
  // ... existing components
  {
    name: "YourComponent",
    description: "What your component does",
    component: YourComponent,
    propsSchema: newComponentSchema,
  },
];
```

### Styling the Chat Interface

Modify `source/components/message-thread-collapsible.tsx` to adjust:
- Chat window size (currently 700px × 600px)
- Position (currently bottom-center)
- Colors and effects
- Message display format

## 🐛 Troubleshooting

### Chat button not visible
- Check that your screen height is sufficient
- Verify z-index isn't being overridden by other elements
- Check browser console for errors

### API key errors
- Ensure `.env.local` file exists in project root
- Verify API key is correctly formatted (should start with `tambo_`)
- Make sure you replaced `your_api_key_here` with your actual key
- Restart dev server after changing environment variables:
  ```bash
  # Stop the server (Ctrl+C), then restart:
  npx pnpm run dev
  ```
- Check browser console for the warning message about missing API key

### Components not rendering
- Check browser console for errors
- Verify component registration in `client-providers.tsx`
- Ensure Zod schemas match component props
- Make sure `WorkflowProvider` is wrapping the components that use workflow hooks

### Stream response errors
If you see errors like `handleStreamResponse` in the console:
- **Most common cause**: API key is missing or invalid
- Open the chat - if there's an API key error, you'll see a helpful setup guide
- Follow the step-by-step instructions in the chat interface
- The error banner can be dismissed by clicking the X button
- Once configured correctly, the error will disappear on page reload

### Nodes not being added
- Check that `WorkflowProvider` is wrapping your app
- Verify `useWorkflow()` hook is accessible
- Check browser console for node addition errors

## 📚 Resources

- [Tambo Documentation](https://docs.tambo.co)
- [Tambo React Hooks Reference](https://docs.tambo.co/api-reference/react-hooks)
- [Tambo Component Library](https://ui.tambo.co)

## 🎯 Future Enhancements

Potential improvements for the Tambo integration:

- [ ] Node connection management via AI
- [ ] Workflow templates and presets
- [ ] Voice input support
- [ ] Multi-threaded conversations
- [ ] Workflow execution control
- [ ] Node configuration via chat
- [ ] Export/import workflows through AI
- [ ] Suggested workflows based on user intent

## 📄 License

This integration follows the same license as the Clinks project.