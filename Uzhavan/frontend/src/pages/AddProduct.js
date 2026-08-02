import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddProduct = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nameEn: '', nameTa: '', descriptionEn: '', descriptionTa: '',
    category: '', quantity: '', unit: 'kg', pricePerUnit: '',
    district: user?.district || '', village: user?.village || '',
    contactName: user?.name || '', contactMobile: user?.mobile || '',
    isOrganic: false, harvestDate: ''
  });

  useEffect(() => {
    api.get('/meta/districts').then((res) => setDistricts(res.data.districts));
    api.get('/meta/categories').then((res) => setCategories(res.data.categories));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== undefined) data.append(key, val);
      });
      images.forEach((img) => data.append('images', img));

      await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product published successfully!');
      navigate('/farmer/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={9}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-success mb-4">{t('nav.addProduct')}</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name (English)</Form.Label>
                      <Form.Control name="nameEn" required value={form.nameEn} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>பொருள் பெயர் (Tamil)</Form.Label>
                      <Form.Control name="nameTa" value={form.nameTa} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description (English)</Form.Label>
                      <Form.Control as="textarea" rows={3} name="descriptionEn" value={form.descriptionEn} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>விளக்கம் (Tamil)</Form.Label>
                      <Form.Control as="textarea" rows={3} name="descriptionTa" value={form.descriptionTa} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.category')}</Form.Label>
                      <Form.Select name="category" required value={form.category} onChange={handleChange}>
                        <option value="">--</option>
                        {categories.map((c) => (
                          <option key={c.key} value={c.key}>{c.en} / {c.ta}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.quantity')}</Form.Label>
                      <Form.Control type="number" name="quantity" min={0} required value={form.quantity} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.unit')}</Form.Label>
                      <Form.Select name="unit" value={form.unit} onChange={handleChange}>
                        {['kg', 'quintal', 'ton', 'dozen', 'litre', 'piece', 'bag'].map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.price')} (₹)</Form.Label>
                      <Form.Control type="number" name="pricePerUnit" min={0} required value={form.pricePerUnit} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.district')}</Form.Label>
                      <Form.Select name="district" required value={form.district} onChange={handleChange}>
                        <option value="">--</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.village')}</Form.Label>
                      <Form.Control name="village" value={form.village} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.contactName')}</Form.Label>
                      <Form.Control name="contactName" value={form.contactName} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.contactMobile')}</Form.Label>
                      <Form.Control name="contactMobile" value={form.contactMobile} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('product.harvestDate')}</Form.Label>
                      <Form.Control type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="d-flex align-items-center">
                    <Form.Check
                      className="mt-3"
                      label={t('product.organic')}
                      name="isOrganic"
                      checked={form.isOrganic}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>{t('product.images')} (up to 5)</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
                  />
                </Form.Group>

                <Button type="submit" variant="success" className="rounded-pill px-4 fw-bold" disabled={loading}>
                  {loading ? t('common.loading') : t('product.publish')}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddProduct;
