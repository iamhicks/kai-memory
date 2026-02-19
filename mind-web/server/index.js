const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/api');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

// Ensure data directories exist
const dirs = ['notes', 'projects', 'decisions'];
dirs.forEach(dir => {
  const dirPath = path.join(DATA_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
      connectSrc: ["'self'", "http://localhost:11434"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "https://unpkg.com"],
    },
  },
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));
app.use(requestLogger);

// Static files
app.use(express.static(path.join(__dirname, '..', 'web')));

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'index.html'));
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    MIND Server Started                     ║
╠════════════════════════════════════════════════════════════╣
║  Port:     ${PORT.toString().padEnd(47)}║
║  Data Dir: ${DATA_DIR.toString().padEnd(47)}║
║  Mode:     ${(process.env.NODE_ENV || 'development').padEnd(47)}║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;