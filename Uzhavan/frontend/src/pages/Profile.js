import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Form, Button, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name, address: user.address || '',
    village: user.village || '', farmName: user.farmName || '',
    companyName: user.companyName || ''
  });
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (idFile) data.append('govtIdDocument', idFile);
      const res = await api.put('/auth/me', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const idStatusVariant = { pending: 'warning', verified: 'success', rejected: 'danger' };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={7}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-success mb-3">{t('nav.profile')}</h3>
              <p className="text-muted">
                Mobile: {user.mobile} &middot; Role: <span className="text-capitalize">{user.role}</span>
              </p>
              <Alert variant={idStatusVariant[user.isGovtIdVerified] || 'secondary'}>
                Government ID status: <Badge bg={idStatusVariant[user.isGovtIdVerified]} className="text-capitalize">{user.isGovtIdVerified}</Badge>
              </Alert>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.name')}</Form.Label>
                  <Form.Control name="name" value={form.name} onChange={handleChange} />
                </Form.Group>

                {user.role === 'farmer' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('auth.village')}</Form.Label>
                      <Form.Control name="village" value={form.village} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('auth.farmName')}</Form.Label>
                      <Form.Control name="farmName" value={form.farmName} onChange={handleChange} />
                    </Form.Group>
                  </>
                )}

                {user.role === 'bulkbuyer' && (
                  <Form.Group className="mb-3">
                    <Form.Label>{t('auth.companyName')}</Form.Label>
                    <Form.Control name="companyName" value={form.companyName} onChange={handleChange} />
                  </Form.Group>
                )}

                {user.role !== 'farmer' && (
                  <Form.Group className="mb-3">
                    <Form.Label>{t('auth.address')}</Form.Label>
                    <Form.Control as="textarea" rows={2} name="address" value={form.address} onChange={handleChange} />
                  </Form.Group>
                )}

                <Form.Group className="mb-4">
                  <Form.Label>Re-upload Government ID (if needed)</Form.Label>
                  <Form.Control type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setIdFile(e.target.files[0])} />
                </Form.Group>

                <Button type="submit" variant="success" className="rounded-pill px-4" disabled={loading}>
                  {loading ? t('common.loading') : t('common.save')}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
