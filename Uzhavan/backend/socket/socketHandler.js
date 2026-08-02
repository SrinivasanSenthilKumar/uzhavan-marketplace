const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');

const buildConversationId = (idA, idB) => [idA.toString(), idB.toString()].sort().join('_');

// Maps userId -> socket.id so we can deliver messages/calls directly to online users
const onlineUsers = new Map();

const initSocket = (io) => {
  // Authenticate every socket connection using the JWT sent from the client
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    io.emit('presence:update', Array.from(onlineUsers.keys()));

    // ---------- CHAT ----------
    socket.on('chat:send', async ({ receiverId, message, productId }) => {
      try {
        const conversationId = buildConversationId(socket.userId, receiverId);
        const saved = await ChatMessage.create({
          conversationId,
          sender: socket.userId,
          receiver: receiverId,
          product: productId || undefined,
          message
        });

        const payload = {
          _id: saved._id,
          conversationId,
          sender: socket.userId,
          receiver: receiverId,
          product: productId,
          message,
          createdAt: saved.createdAt
        };

        // send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('chat:receive', payload);
        // echo back to sender for UI confirmation
        socket.emit('chat:receive', payload);
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:typing', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit('chat:typing', { senderId: socket.userId });
    });

    // ---------- VIDEO CALL (WebRTC signaling) ----------
    // Caller initiates a call
    socket.on('call:invite', ({ receiverId, offer, callerName }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call:incoming', { callerId: socket.userId, offer, callerName });
      } else {
        socket.emit('call:unavailable', { receiverId });
      }
    });

    // Receiver accepts and sends back an answer
    socket.on('call:answer', ({ callerId, answer }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) io.to(callerSocketId).emit('call:accepted', { answer });
    });

    // Exchange of ICE candidates between both peers
    socket.on('call:ice-candidate', ({ targetId, candidate }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) io.to(targetSocketId).emit('call:ice-candidate', { candidate, fromId: socket.userId });
    });

    // Either side can decline or hang up
    socket.on('call:reject', ({ callerId }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) io.to(callerSocketId).emit('call:rejected');
    });

    socket.on('call:end', ({ targetId }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) io.to(targetSocketId).emit('call:ended');
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      io.emit('presence:update', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = initSocket;
