# Clinks

**AI-Powered Generative Media Workflow Builder**

Clinks lets you create complex generative media workflows using natural language. Just tell the AI what you want to build, and it automatically creates nodes, connects them, and helps you generate images, videos, logos, audio, and more.

## ✨ Key Features

- 🤖 **AI Workflow Assistant** - Build complete workflows with simple commands
- 🎨 **Visual Workflow Canvas** - Drag, drop, and connect nodes intuitively
- ⚡ **Multi-Modal Generation** - Images, videos, logos, audio, and text
- 🔗 **Smart Connections** - AI automatically connects nodes in the right order
- 🚀 **One-Command Workflows** - Create entire pipelines instantly
- 📊 **Real-Time Execution** - Watch your workflows generate content live

## 🎯 Quick Example

Open the AI Assistant and type:
```
"Build a text-to-image workflow"
```

The AI will:
1. Create a text input node
2. Add an image generator node
3. Add an output node
4. Connect them all together
5. Position them nicely on the canvas

Then just say `"Execute the workflow"` and watch it generate!

## 🚀 Quick Start

### 1. Install Dependencies
```bash
git clone https://github.com/your-org/clinks.git
cd clinks
pnpm install
```

### 2. Configure Tambo API Key
Get your free API key from [tambo.co](https://tambo.co):
```bash
echo "NEXT_PUBLIC_TAMBO_TOKEN=your_api_key_here" > .env.local
```

### 3. Start Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) and start building!

## 💬 Example Commands

Tell the AI Assistant what you want to build:

### Complete Workflows
```
"Build a text-to-image workflow"
"Create a logo generation pipeline"
"Set up a video creation workflow"
```

### Add Individual Nodes
```
"Add a text input node"
"Create an image generator"
"Add an output node"
```

### Execute & Manage
```
"Execute the workflow"
"Show my workflow status"
"What nodes do I have?"
```

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[AI Workflow Guide](./AI_WORKFLOW_GUIDE.md)** - Complete guide with examples
- **[Tambo Integration](./TAMBO_INTEGRATION.md)** - Technical details and setup
- **[Troubleshooting](./TAMBO_TROUBLESHOOTING.md)** - Common issues and solutions

## 🎨 What Can You Build?

- **Text-to-Image** - Generate images from text descriptions
- **Logo Design** - Create brand logos and design elements
- **Video Generation** - Make AI-generated videos
- **Audio Creation** - Generate music and sound effects
- **Multi-Stage Pipelines** - Chain multiple AI operations together

## 🔧 Additional Setup

### Build for Production
```bash
pnpm run build
pnpm start
```

### Docker (Optional)
```bash
docker build -t clinks .
docker run -p 3000:3000 clinks
```

## 🙏 Credits

Built with [Tambo AI](https://tambo.co) for generative UI components.
