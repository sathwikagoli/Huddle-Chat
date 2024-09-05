const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authmiddleware');
const chatRateLimiter = require('../middleware/rateLimit');

module.exports = (io) => {
    // Send a message
    router.post('/send', authMiddleware, chatRateLimiter, (req, res) => sendMessage(req, res, io));

    // Get all messages between the authenticated user and another user
    router.get('/messages/:receiverId', authMiddleware, getMessages);

    return router;
};
