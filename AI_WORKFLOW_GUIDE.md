# AI Workflow Building Guide

This guide shows you how to use the AI Assistant to build generative media workflows in Clinks through natural language commands.

## 🎯 Overview

The AI Assistant can help you:
- **Add individual nodes** to your canvas
- **Build complete multi-node workflows** with automatic connections
- **Connect nodes together** to create custom data flows
- **Execute workflows** to generate content
- **Check workflow status** and monitor progress

## 🚀 Getting Started

### 1. Open the AI Assistant

Click the **"AI ASSISTANT"** button at the bottom-center of the screen to open the chat interface.

### 2. Start Building

Simply tell the AI what you want to create. The AI understands natural language and will:
- Choose the right node types
- Position them intelligently
- Connect them in the correct order
- Provide visual feedback as it builds

## 💬 Example Commands

### Adding Single Nodes

Add individual nodes one at a time:

```
"Add a text input node"
"Create an image generator"
"Add a video generator node"
"I need a logo generator"
"Add an output node"
```

**Node Types Available:**
- `text-input` - For entering text prompts
- `image-input` - For uploading reference images
- `text-generator` - For AI text generation
- `image-generator` - For creating AI images
- `video-generator` - For creating AI videos
- `logo-generator` - For generating brand logos
- `audio-generator` - For creating AI audio
- `output` - For displaying and exporting results

### Building Complete Workflows

Create entire pipelines with one command:

```
"Build a text-to-image workflow"
"Create a logo generation pipeline"
"Set up a video creation workflow with text input and output"
"Build a workflow that takes text and generates an image"
```

The AI will:
1. Determine the required nodes
2. Add them in the correct order
3. Automatically connect them
4. Position them nicely on the canvas

### Checking Workflow Status

See what's in your current workflow:

```
"Show my workflow status"
"What nodes do I have?"
"What's in my workflow?"
"How many nodes are there?"
```

### Executing Workflows

Run your workflow to generate content:

```
"Execute the workflow"
"Run my workflow"
"Generate content"
"Execute this pipeline"
```

## 🏗️ Common Workflow Patterns

### Text-to-Image Workflow

```
"Build a text-to-image workflow"
```

This creates:
1. **Text Input** - Where you enter your prompt
2. **Image Generator** - Generates the image from text
3. **Output** - Displays the generated image

### Logo Generation Workflow

```
"Create a logo generation workflow"
```

This creates:
1. **Text Input** - Describe the logo you want
2. **Logo Generator** - Creates the logo
3. **Output** - Shows the generated logo

### Video Creation Workflow

```
"Build a video generation pipeline"
```

This creates:
1. **Text Input** - Video description/prompt
2. **Video Generator** - Creates the video
3. **Output** - Displays the video

### Multi-Stage Workflow

```
"Build a workflow that generates text, then uses that text to create an image"
```

This creates:
1. **Text Input** - Initial prompt
2. **Text Generator** - Generates descriptive text
3. **Image Generator** - Creates image from generated text
4. **Output** - Shows the final image

## 🔧 Advanced Usage

### Custom Positioning

You can specify where nodes should appear:

```
"Add an image generator at position 500, 300"
```

### Multiple Nodes at Once

Ask for several nodes in one request:

```
"Add a text input, an image generator, and an output node"
```

### Custom Connections

Build nodes first, then connect them specifically:

```
1. "Add a text input called 'Prompt A'"
2. "Add a text input called 'Prompt B'"
3. "Add an image generator"
4. "Connect both text inputs to the image generator"
```

### Workflow Templates

Ask for common patterns:

```
"Create a basic generation workflow"
"Set up a standard image pipeline"
"Build a complete video workflow with all the nodes I need"
```

## 📊 Understanding Workflow Execution

When you execute a workflow:

1. **Input Nodes** are processed first (text-input, image-input)
2. **Generator Nodes** receive data from inputs and create content
3. **Output Nodes** display the final results
4. Data flows along the connections you've created

### Before Execution

Make sure:
- ✅ All input nodes have content
- ✅ Generator nodes are properly configured
- ✅ Nodes are connected in the right order
- ✅ There's an output node to see results

### During Execution

- Watch the Preview Panel for real-time results
- Execution logs show progress for each node
- Errors will be displayed if something goes wrong

### After Execution

- Check the Preview Panel for generated content
- Click on output nodes to see final results
- Review execution logs for any issues

## 🎨 Tips for Best Results

### 1. Start Simple
Begin with basic workflows and add complexity:
```
"Build a simple text-to-image workflow"
```

### 2. Be Specific
Clear instructions help the AI choose the right nodes:
```
"Create a workflow for generating product logos with text input and output"
```

### 3. Build Incrementally
Add and test nodes step by step:
```
1. "Add a text input"
2. "Add an image generator"
3. "Show my workflow status"
4. "Connect them together"
```

### 4. Use Natural Language
Don't worry about exact syntax:
```
"I want to make images from text descriptions"
"Help me build something that generates videos"
"Set me up to create logos"
```

### 5. Ask for Help
The AI can guide you:
```
"What kind of workflow should I build for creating marketing images?"
"How do I set up a video generation pipeline?"
"What nodes do I need for text-to-image generation?"
```

## 🔍 Troubleshooting

### "No nodes in workflow"
**Solution:** Add nodes first before trying to execute
```
"Build a text-to-image workflow"
```

### "Nodes not connected"
**Solution:** Make sure nodes are connected
```
"Connect my nodes together"
```

### "No input provided"
**Solution:** Configure input nodes with content before executing

### "Component not rendering"
**Problem:** AI response doesn't show a component
**Solution:** Try rephrasing your request more specifically:
- Instead of: "add node"
- Try: "add a text generator node"

## 📚 Workflow Examples Library

### Example 1: Basic Image Generation
```
User: "Build a text-to-image workflow"
AI: Creates text-input → image-generator → output
User: "Execute the workflow"
```

### Example 2: Logo Design
```
User: "Create a logo generation pipeline"
AI: Creates text-input → logo-generator → output
```

### Example 3: Video Creation
```
User: "Set up a video creation workflow"
AI: Creates text-input → video-generator → output
```

### Example 4: Audio Generation
```
User: "Build an audio generation workflow"
AI: Creates text-input → audio-generator → output
```

### Example 5: Complex Multi-Stage
```
User: "Build a workflow that generates a description, then creates an image, then shows the output"
AI: Creates text-input → text-generator → image-generator → output
```

## 🎯 Best Practices

### ✅ DO:
- Use clear, descriptive node names
- Build workflows step by step when learning
- Check workflow status before executing
- Test with simple inputs first
- Ask the AI for help when stuck

### ❌ DON'T:
- Try to execute empty workflows
- Skip connecting nodes in custom workflows
- Forget to configure generator nodes
- Ignore error messages
- Be afraid to experiment!

## 🆘 Getting Help

If you're stuck, ask the AI:

```
"How do I create a text-to-image workflow?"
"What's wrong with my workflow?"
"Help me set up image generation"
"Show me an example workflow"
"What can I build with this?"
```

## 🚀 Next Steps

1. **Try the examples** - Start with simple workflows
2. **Experiment** - Mix and match different node types
3. **Share** - Export your workflows for others
4. **Build** - Create custom pipelines for your needs

## 📖 Related Documentation

- [Tambo Integration](./TAMBO_INTEGRATION.md) - Setup and technical details
- [README](./README.md) - General project information
- [Tambo Troubleshooting](./TAMBO_TROUBLESHOOTING.md) - Common issues

---

**Remember:** The AI Assistant is here to help! Don't hesitate to ask questions, try different approaches, or request clarification. Building workflows should be intuitive and fun! 🎉