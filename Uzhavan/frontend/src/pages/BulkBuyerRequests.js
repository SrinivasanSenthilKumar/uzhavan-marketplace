import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Card, Badge, Row, Col, Spinner } from 'react-bootstrap';
import api from '../services/api';

const STATUS_COLORS = { pending: 'warning', accepted: 'success', rejected: 'danger', completed: 'secondary' };

const BulkBuyerRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/consumer-requests/sent').then((res) => {
      setRequests(res.data.requests);
      setLoading(false);
    });
  }, []);

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-success mb-4">{t('requests.sent')}</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
      ) : requests.length === 0 ? (
        <p className="text-muted text-center py-5">No requests sent yet.</p>
      ) : (
        <Row className="g-3">
          {requests.map((r) => (
            <Col md={6} key={r._id}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>{r.farmer?.name}</strong>
                    <Badge bg={STATUS_COLORS[r.status]} className="text-capitalize">{t(`requests.${r.status}`) || r.status}</Badge>
                  </div>
                  <p className="mb-1 small text-muted">{r.farmer?.mobile} - {r.farmer?.district}</p>
                  {r.product && <p className="mb-1">Product: {r.product.nameEn}</p>}
                  <p className="mb-1">{t('requests.requestedQuantity')}: {r.requestedQuantity} {r.unit}</p>
                  {r.offeredPricePerUnit && <p className="mb-1">{t('requests.offeredPrice')}: ₹{r.offeredPricePerUnit}</p>}
                  {r.farmerResponseNote && <p className="mb-1 text-success">Farmer's note: {r.farmerResponseNote}</p>}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BulkBuyerRequests;
