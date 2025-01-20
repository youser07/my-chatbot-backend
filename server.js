const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // PostgreSQL client

const app = express();
const port = process.env.PORT || 5000; // Dynamic port handling for deployment

const pool = new Pool({
  connectionString: 'postgresql://chat_bot_wzzl_user:99RofMuYCGb2KegoCbcv8q09k5W5IbuN@dpg-cu6k37ggph6c73c7jbu0-a.oregon-postgres.render.com/chat_bot_wzzl', // Directly use the external URL from Render
  ssl: {
    rejectUnauthorized: false, // Required for connecting securely to hosted PostgreSQL
  },
});

const corsOptions = {
  origin: 'https://my-chatbot-frontend-qc5qsx8s4-youser07s-projects.vercel.app', // Your Vercel frontend URL
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// API route to handle message sending
app.post('/message', async (req, res) => {
  const userMessage = req.body.message;

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
