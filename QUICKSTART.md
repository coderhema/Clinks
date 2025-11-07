# Clinks Quick Start Guide

Get up and running with AI-powered workflow building in 5 minutes!

## 🚀 Installation

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Tambo API Key

Get your free API key from [tambo.co](https://tambo.co) and add it to `.env.local`:

```bash
# Create .env.local file
echo "NEXT_PUBLIC_TAMBO_TOKEN=your_api_key_here" > .env.local
```

Replace `your_api_key_here` with your actual Tambo API key.

### 3. Start the Development Server

```bash
pnpm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🎯 Your First Workflow

### Step 1: Open the AI Assistant

Look for the **"AI ASSISTANT"** button at the bottom-center of your screen and click it.

### Step 2: Build Your First Workflow

Try one of these commands:

```
"Build a text-to-image workflow"
```

The AI will automatically:
- Create a text input node
- Add an image generator node
- Add an output node
- Connect them all together

### Step 3: Configure Your Nodes

1. Click on the **Text Input** node
2. Enter your prompt (e.g., "a cyberpunk city at night")
3. Click on the **Image Generator** node
4. Select your preferred model

### Step 4: Generate Content

Ask the AI:

```
"Execute the workflow"
```

Watch as your workflow processes and generates an image!

## 💡 What Can You Build?

### Text-to-Image Generation
```
"Build a text-to-image workflow"
```
Perfect for creating AI-generated images from text descriptions.

### Logo Creation
```
"Create a logo generation pipeline"
```
Generate brand logos and design elements.

### Video Generation
```
"Set up a video creation workflow"
```
Create AI-generated videos from text prompts.

### Audio Generation
```
"Build an audio generation workflow"
```
Generate music, sound effects, or voice content.

### Multi-Stage Workflows
```
"Build a workflow that generates text, then uses that to create an image"
```
Chain multiple AI operations together for complex outputs.

## 🎨 Common Commands

### Building Workflows
- `"Build a text-to-image workflow"`
- `"Create a logo generation pipeline"`
- `"Set up a video workflow"`

### Adding Nodes
- `"Add a text input node"`
- `"Add an image generator"`
- `"Create an output node"`

### Managing Workflows
- `"Show my workflow status"`
- `"Execute the workflow"`
- `"What nodes do I have?"`

### Getting Help
- `"How do I create a text-to-image workflow?"`
- `"What can I build with this?"`
- `"Help me set up image generation"`

## 🔥 Pro Tips

1. **Start with Complete Workflows** - Use `"Build a [type] workflow"` commands for quick setup
2. **Use Natural Language** - Talk to the AI like you would a colleague
3. **Check Status Often** - Ask `"Show my workflow status"` to see what you've built
4. **Experiment Freely** - Try different combinations and workflows
5. **Ask for Help** - The AI is here to guide you!

## 📚 Next Steps

- **Explore Examples**: Try the example workflows in the [AI Workflow Guide](./AI_WORKFLOW_GUIDE.md)
- **Learn More**: Read the full [Tambo Integration docs](./TAMBO_INTEGRATION.md)
- **Troubleshoot**: Check [Troubleshooting Guide](./TAMBO_TROUBLESHOOTING.md) if you hit issues

## 🆘 Common Issues

### Chat button shows "SETUP"
**Solution**: Make sure you've added your Tambo API key to `.env.local` and restarted the dev server.

### "No nodes in workflow" error
**Solution**: Ask the AI to build a workflow first: `"Build a text-to-image workflow"`

### Nodes not generating content
**Solution**: Make sure to configure your input nodes with content before executing.

## 🎉 You're Ready!

You now know enough to start building AI workflows. Open the AI Assistant and try:

```
"Build a text-to-image workflow"
```

Then explore, experiment, and create amazing content!

---

**Need more help?** Check out the [complete AI Workflow Guide](./AI_WORKFLOW_GUIDE.md) for detailed examples and best practices.