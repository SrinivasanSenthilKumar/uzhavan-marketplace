import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Card, Badge, Button, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';

const STATUS_COLORS = { pending: 'warning', accepted: 'success', rejected: 'danger', completed: 'secondary' };

const FarmerRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await api.get('/consumer-requests/received');
    setRequests(res.data.requests);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const respond = async (id, status) => {
    try {
      await api.put(`/consumer-requests/${id}/respond`, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch {
      toast.error('Failed to respond');
    }
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-success mb-4">{t('requests.received')}</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
      ) : requests.length === 0 ? (
        <p className="text-muted text-center py-5">No requests yet.</p>
      ) : (
        <Row className="g-3">
          {requests.map((r) => (
            <Col md={6} key={r._id}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>{r.bulkBuyer?.companyName || r.bulkBuyer?.name}</strong>
                    <Badge bg={STATUS_COLORS[r.status]} className="text-capitalize">{t(`requests.${r.status}`) || r.status}</Badge>
                  </div>
                  <p className="mb-1 small text-muted">{r.bulkBuyer?.mobile}</p>
                  {r.product && <p className="mb-1">Product: {r.product.nameEn}</p>}
                  <p className="mb-1">{t('requests.requestedQuantity')}: {r.requestedQuantity} {r.unit}</p>
                  {r.offeredPricePerUnit && <p className="mb-1">{t('requests.offeredPrice')}: ₹{r.offeredPricePerUnit}</p>}
                  {r.message && <p className="mb-2 fst-italic">"{r.message}"</p>}

                  {r.status === 'pending' && (
                    <div className="d-flex gap-2 mt-2">
                      <Button size="sm" variant="success" className="rounded-pill" onClick={() => respond(r._id, 'accepted')}>
                        {t('requests.accept')}
                      </Button>
                      <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => respond(r._id, 'rejected')}>
                        {t('requests.reject')}
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default FarmerRequests;
