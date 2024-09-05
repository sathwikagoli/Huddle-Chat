const mongoose = require('mongoose');
const Group = require('../models/group');
const GroupMessage = require('../models/groupMessage');
const User = require('../models/user');

// Create a new group
exports.createGroup = async (req, res) => {
  const { name, members } = req.body;
  const creatorId = req.user.id;

  // Validate members (ensure they are valid user IDs)
  if (!Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ msg: 'At least one member is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(creatorId) || !members.every(id => mongoose.Types.ObjectId.isValid(id))) {
    return res.status(400).json({ msg: 'Invalid member IDs' });
  }

  try {
    // Add the creator to the members list
    const group = new Group({
      name,
      members: [...new Set([...members, creatorId])] // Ensure creator is included and remove duplicates
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Send a message to a group
exports.sendGroupMessage = async (req, res) => {
  const { groupId } = req.params;
  const { message } = req.body;
  const senderId = req.user.id;

  // Validate groupId
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ msg: 'Invalid group ID' });
  }

  try {
    // Check if group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(senderId)) {
      return res.status(403).json({ msg: 'User is not a member of the group' });
    }

    // Create the message
    const groupMessage = new GroupMessage({
      group: groupId,
      sender: senderId,
      message
    });

    await groupMessage.save();
    res.status(201).json(groupMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get messages from a group
exports.getGroupMessages = async (req, res) => {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
  
    // Validate groupId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ msg: 'Invalid group ID' });
    }
  
    try {
      // Check if group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ msg: 'Group not found' });
      }
  
      // Check if the user is a member of the group
      if (!group.members.includes(userId)) {
        return res.status(403).json({ msg: 'User is not a member of the group' });
      }
  
      // Retrieve messages
      const messages = await GroupMessage.find({ group: groupId })
        .sort({ timestamp: -1 }) // Sort by newest first
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
        .exec();
  
      const count = await GroupMessage.countDocuments({ group: groupId });
  
      res.json({
        messages,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  };
