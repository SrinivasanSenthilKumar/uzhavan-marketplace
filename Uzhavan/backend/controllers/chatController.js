const ChatMessage = require('../models/ChatMessage');

const buildConversationId = (idA, idB) => [idA.toString(), idB.toString()].sort().join('_');

// @desc    Get chat history between logged-in user and another user
// @route   GET /api/chat/:userId
const getConversation = async (req, res) => {
  try {
    const conversationId = buildConversationId(req.user._id, req.params.userId);
    const messages = await ChatMessage.find({ conversationId }).sort('createdAt');
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
  }
};

// @desc    Get list of distinct conversations for the logged-in user (inbox)
// @route   GET /api/chat
const getInbox = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await ChatMessage.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort('-createdAt');

    const seen = new Set();
    const inbox = [];
    for (const msg of messages) {
      if (!seen.has(msg.conversationId)) {
        seen.add(msg.conversationId);
        const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
        inbox.push({ conversationId: msg.conversationId, otherUser, lastMessage: msg.message, lastMessageAt: msg.createdAt });
      }
    }
    res.json({ inbox });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inbox', error: error.message });
  }
};

module.exports = { getConversation, getInbox, buildConversationId };
