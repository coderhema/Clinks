# Clinks
Clinks is a tambo extension that allows you to create generative media workflows by prompting it with text.

## Installation

### Requirements
- Node.js 18+ (includes pnpm)
- Git

### Local Setup
1. Clone the repository
   \`\`\`bash
   git clone https://github.com/your-org/clinks.git
   cd clinks
   \`\`\`

2. Install dependencies
   \`\`\`bash
   pnpm install
   \`\`\`

3. Build the project
   \`\`\`bash
   pnpm run build
   \`\`\`

4. Run locally
   \`\`\`bash
   pnpm start
   \`\`\`
   The app will open at http://localhost:3000

### Development Mode
To run with hot-reload for active development:
\`\`\`bash
pnpm run dev
\`\`\`

### Docker (optional)
\`\`\`bash
docker build -t clinks .
docker run -p 3000:3000 clinks
\`\`\`
