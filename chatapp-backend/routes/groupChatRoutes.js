const express = require('express');
const router = express.Router();
const { createGroup, sendGroupMessage, getGroupMessages } = require('../controllers/groupChatControllers');
const authMiddleware = require('../middleware/authmiddleware');

// Create a new group
router.post('/groups', authMiddleware, createGroup);

// Send a message to a group
router.post('/groups/:groupId/messages', authMiddleware, sendGroupMessage);

// Get messages from a group
router.get('/groups/:groupId/messages', authMiddleware, getGroupMessages);

module.exports = router;
