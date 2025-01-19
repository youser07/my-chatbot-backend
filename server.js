const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // PostgreSQL client

const app = express();
const port = 5000;

// Initialize PostgreSQL client
const pool = new Pool({
  user: 'postgres',  // Replace with your PostgreSQL username
  host: 'localhost',
  database: 'chatbot',
  password: "password@372",  // Replace with your PostgreSQL password
  port: 5432,
});

app.use(cors());
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
