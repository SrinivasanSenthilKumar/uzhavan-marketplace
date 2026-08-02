import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, ListGroup, Row, Col, Spinner } from 'react-bootstrap';
import api from '../services/api';
import ChatWindow from '../components/ChatWindow';

const ChatInbox = () => {
  const { t } = useTranslation();
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/chat').then((res) => {
      setInbox(res.data.inbox);
      setLoading(false);
    });
  }, []);

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-success mb-4">{t('nav.chat')}</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
      ) : inbox.length === 0 ? (
        <p className="text-muted text-center py-5">
          No conversations yet. Visit a product page and chat with a farmer to get started.
        </p>
      ) : (
        <Row>
          <Col md={4}>
            <ListGroup>
              {inbox.map((conv) => (
                <ListGroup.Item
                  key={conv.conversationId}
                  action
                  active={selected?.otherUser._id === conv.otherUser._id}
                  onClick={() => setSelected(conv)}
                >
                  <div className="fw-bold">{conv.otherUser.name}</div>
                  <div className="small text-muted text-truncate">{conv.lastMessage}</div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col md={8}>
            {selected ? (
              <ChatWindow otherUserId={selected.otherUser._id} otherUserName={selected.otherUser.name} />
            ) : (
              <p className="text-muted text-center py-5">Select a conversation</p>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ChatInbox;
