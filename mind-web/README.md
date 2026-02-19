# MIND Web Application

**MIND** - Multi-Agent Intelligence Network Dashboard

A web-based interface for interacting with the MIND multi-agent AI system. Chat with specialized agents (@strategist, @maker, @market, @systems), manage projects with pipeline visualization, and organize tasks.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Ollama running locally (for AI features)

### Installation

```bash
# Navigate to the mind-web directory
cd /Users/peteroberts/.openclaw/workspace/mind-web

# Install dependencies
npm install

# Start the server
npm start
```

### Access the App

Open your browser and navigate to: `http://localhost:3000`

## 🏗️ Architecture

```
mind-web/
├── server/              # Express backend
│   ├── agents/          # Agent definitions (strategist, maker, market, systems)
│   ├── routes/          # API routes
│   ├── storage/         # Data persistence
│   └── index.js         # Server entry point
├── web/                 # Frontend
│   ├── index.html       # Main HTML
│   ├── css/
│   │   └── main.css     # Stylesheet with theming
│   └── js/
│       ├── api.js       # API client
│       ├── app.js       # Main app initialization
│       ├── chat.js      # Chat interface
│       ├── agents.js    # Agent directory
│       ├── projects.js  # Project management
│       ├── tasks.js     # Task board
│       └── search.js    # Search functionality
└── package.json
```

## 🎯 Features

### Chat with Agents
- **@strategist** - Strategic thinking, vision, and long-term planning
- **@maker** - Building, coding, and creating deliverables
- **@market** - Business strategy, users, and market analysis
- **@systems** - Operations, processes, and workflow optimization

Type `@` to mention an agent, or just chat and MIND will route to the right agent.

### Project Management
- Create and manage projects
- Visual pipeline stages: Chaos → Emerge → Focus → Build → Ship
- Track project status and metadata

### Task Board
- Kanban-style task management
- Filter by status (All, To Do, In Progress, Done)
- Assign priorities and track progress

### Search
- Search across notes, projects, and decisions
- Filter by content type
- Real-time results

### Theming
- Light/Dark mode support
- Persistent theme preference
- CSS custom properties for easy customization

## 🎨 Theming

Toggle between light and dark mode using the moon/sun button in the sidebar. Theme preference is saved to localStorage.

## 📱 Mobile Support

The app is fully responsive:
- Collapsible sidebar on mobile
- Touch-friendly interface
- Optimized layouts for small screens

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List available agents |
| POST | `/api/chat` | Send chat message |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create/update project |
| GET | `/api/projects/:id` | Get specific project |
| POST | `/api/tasks` | Create task |
| GET | `/api/search?q=query` | Search knowledge base |
| GET | `/health` | Health check |

## ⚙️ Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `DATA_DIR` - Data storage directory (default: `../data`)
- `NODE_ENV` - Environment mode (development/production)

## 🐛 Troubleshooting

### Backend not connecting
- Ensure the server is running: `npm start`
- Check the status indicator in the sidebar
- Verify port 3000 is available

### Ollama not responding
- Ensure Ollama is running locally
- Check that models are downloaded: `ollama list`
- Default model: `llama3.2`

### Data not persisting
- Check that the `data/` directory exists and is writable
- Verify `DATA_DIR` environment variable if set

## 🛠️ Development

```bash
# Run in development mode with auto-restart
npm run dev
```

## 📄 License

MIT
