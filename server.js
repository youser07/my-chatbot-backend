const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // PostgreSQL client

const app = express();
const port = process.env.PORT || 5000; // Dynamic port handling for deployment

// Load database connection from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://chat_bot_wzzl_user:99RofMuYCGb2KegoCbcv8q09k5W5IbuN@dpg-cu6k37ggph6c73c7jbu0-a.oregon-postgres.render.com/chat_bot_wzzl',
  ssl: {
    rejectUnauthorized: false, // Required for connecting securely to hosted PostgreSQL
  },
});

// Middleware
const corsOptions = {
  origin: '*', // Allow all origins (temporarily for testing)
  methods: ['GET', 'POST', 'OPTIONS'], // Allow GET, POST, and OPTIONS methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route for testing
app.get('/', (req, res) => {
  res.send('Chatbot server is running!');
});

// API route to handle message sending
app.post('/message', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Insert user message into the database
    const result = await pool.query(
      'INSERT INTO messages (text, is_user) VALUES ($1, $2) RETURNING id',
      [userMessage, true]
    );

    const userMessageId = result.rows[0].id;

    // Simulate a bot response
    const botResponse = `Bot response to: ${userMessage}`;

    // Insert bot response into the database
    await pool.query(
      'INSERT INTO messages (text, is_user) VALUES ($1, $2)',
      [botResponse, false]
    );

    // Send bot response back to frontend
    res.json({ response: botResponse });

  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  pool.end(() => {
    console.log('Database pool closed.');
    process.exit(0);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
