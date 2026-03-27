const express = require('express');
const router = express.Router();
const { generateChatResponse } = require('../controllers/chatController');

// Define the POST route for chat
router.post('/', generateChatResponse);

module.exports = router;
