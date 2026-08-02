import React, { useEffect, useRef, useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ otherUserId, otherUserName, productId }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    if (!otherUserId) return;
    api.get(`/chat/${otherUserId}`).then((res) => setMessages(res.data.messages));
  }, [otherUserId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      const isRelevant =
        (msg.sender === otherUserId && msg.receiver === user._id) ||
        (msg.sender === user._id && msg.receiver === otherUserId);
      if (isRelevant) setMessages((prev) => [...prev, msg]);
    };
    socket.on('chat:receive', handler);
    return () => socket.off('chat:receive', handler);
  }, [socket, otherUserId, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit('chat:send', { receiverId: otherUserId, message: text.trim(), productId });
    setText('');
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        <i className="bi bi-chat-dots me-2"></i>
        {otherUserName || 'Chat'}
      </Card.Header>
      <Card.Body style={{ height: 350, overflowY: 'auto' }} className="bg-light">
        {messages.length === 0 && (
          <p className="text-muted text-center mt-5">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`d-flex mb-2 ${msg.sender === user._id ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div
              className={`px-3 py-2 rounded-4 ${
                msg.sender === user._id ? 'bg-success text-white' : 'bg-white border'
              }`}
              style={{ maxWidth: '75%' }}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </Card.Body>
      <Card.Footer>
        <Form onSubmit={sendMessage} className="d-flex gap-2">
          <Form.Control
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="submit" variant="success">
            <i className="bi bi-send-fill"></i>
          </Button>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default ChatWindow;
