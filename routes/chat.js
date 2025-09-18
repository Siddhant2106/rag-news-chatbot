const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const redisService = require('../services/redisService');
const { ragService } = require('../services/ragService');

// Create new session
router.post('/session', (req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});

// Get session history
router.get('/session/:sessionId/history', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await redisService.getSessionHistory(sessionId);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session history' });
  }
});

// Clear session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await redisService.clearSession(sessionId);
    res.json({ message: 'Session cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear session' });
  }
});

// Send message
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, sender } = req.body;

    // Save user message
    const userMessage = {
      id: uuidv4(),
      message,
      sender,
      type: 'user'
    };
    await redisService.saveMessage(sessionId, userMessage);

    // Process with RAG
    const ragResult = await ragService.processQuery(message);

    // Save bot response
    const botMessage = {
      id: uuidv4(),
      message: ragResult.response,
      sender: 'bot',
      type: 'bot',
      sources: ragResult.sources
    };
    await redisService.saveMessage(sessionId, botMessage);

    res.json({
      userMessage,
      botMessage
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

module.exports = router;
