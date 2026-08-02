import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Nav, Alert, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('farmer');
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState({
    name: '', mobile: '', password: '', confirmPassword: '',
    preferredLanguage: 'en',
    district: '', village: '', farmName: '',
    companyName: '', gstNumber: '', address: '',
    govtIdType: 'aadhaar', govtIdNumber: ''
  });
  const [govtIdFile, setGovtIdFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/meta/districts').then((res) => setDistricts(res.data.districts));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (role === 'farmer' && !form.district) {
      setError('District is required for farmers');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries({ ...form, role }).forEach(([key, val]) => {
        if (val !== undefined && val !== '') data.append(key, val);
      });
      if (govtIdFile) data.append('govtIdDocument', govtIdFile);

      const res = await api.post('/auth/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      login(res.data.user, res.data.token);
      toast.success('Account created successfully!');
      if (role === 'farmer') navigate('/farmer/products');
      else navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h3 className="text-center fw-bold text-success mb-4">{t('auth.signupTitle')}</h3>

              <Nav variant="pills" className="justify-content-center mb-4 flex-wrap gap-2">
                {['farmer', 'customer', 'bulkbuyer'].map((r) => (
                  <Nav.Item key={r}>
                    <Nav.Link active={role === r} onClick={() => setRole(r)} className="rounded-pill px-3">
                      {t(`auth.${r}`)}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              {error && <Alert variant="danger">{error}</Alert>}

              {/* Required by Firebase Phone Auth - stays invisible on screen */}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('auth.name')}</Form.Label>
                      <Form.Control name="name" required value={form.name} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('auth.language')}</Form.Label>
                      <Form.Select name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange}>
                        <option value="en">English</option>
                        <option value="ta">தமிழ்</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.mobile')}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      required
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="9876543210"
                    />
                  </InputGroup>
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('auth.password')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        minLength={6}
                        required
                        value={form.password}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('auth.confirmPassword')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        required
                        value={form.confirmPassword}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {role === 'farmer' && (
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('auth.district')}</Form.Label>
                          <Form.Select name="district" required value={form.district} onChange={handleChange}>
                            <option value="">--</option>
                            {districts.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('auth.village')}</Form.Label>
                          <Form.Control name="village" value={form.village} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('auth.farmName')}</Form.Label>
                      <Form.Control name="farmName" value={form.farmName} onChange={handleChange} />
                    </Form.Group>
                  </>
                )}

                {role === 'bulkbuyer' && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('auth.companyName')}</Form.Label>
                        <Form.Control name="companyName" required value={form.companyName} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('auth.gstNumber')}</Form.Label>
                        <Form.Control name="gstNumber" value={form.gstNumber} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {role !== 'farmer' && (
                  <Form.Group className="mb-3">
                    <Form.Label>{t('auth.address')}</Form.Label>
                    <Form.Control as="textarea" rows={2} name="address" value={form.address} onChange={handleChange} />
                  </Form.Group>
                )}

                <Card className="bg-light border-0 mb-3">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-shield-check text-success me-2"></i>
                      Government ID Verification
                    </h6>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('auth.govtIdType')}</Form.Label>
                          <Form.Select name="govtIdType" value={form.govtIdType} onChange={handleChange}>
                            <option value="aadhaar">Aadhaar Card</option>
                            <option value="voter_id">Voter ID</option>
                            <option value="farmer_id">Farmer ID</option>
                            <option value="pan">PAN Card</option>
                            <option value="other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('auth.govtIdNumber')}</Form.Label>
                          <Form.Control name="govtIdNumber" value={form.govtIdNumber} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group>
                      <Form.Label>{t('auth.govtIdDocument')}</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setGovtIdFile(e.target.files[0])}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                <Button type="submit" variant="success" className="w-100 rounded-pill fw-bold" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.signupButton')}
                </Button>
              </Form>

              <p className="text-center mt-3 mb-0">
                {t('auth.alreadyHaveAccount')} <Link to="/login">{t('nav.login')}</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
