const Message = require("../models/message");
const User = require("../models/user");
const mongoose = require('mongoose');

exports.sendMessage = async (req, res, io) => {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    try {
        const receiverUser = await User.findOne({ name: receiverId });

        if (!receiverUser) {
            return res.status(404).json({ msg: "Receiver not found" });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverUser._id,
            message,
            timestamp: new Date(),
        });

        await newMessage.save();

        // Emit the new message to the receiver
        io.to(receiverUser._id.toString()).emit('newMessage', newMessage);


        res.json({ msg: "Message sent successfully", newMessage });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

exports.getMessages = async (req, res) => {
    const { receiverId } = req.params;
    const senderId = req.user.id;
    console.log(senderId,receiverId,req)
    const { page = 1, limit = 200 } = req.query;
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ msg: "Invalid receiver ID" });
    }
    try {
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        })
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Message.countDocuments({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        });

        res.json({
            messages,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
};
