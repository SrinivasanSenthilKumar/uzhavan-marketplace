import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Nav,
  Alert
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    mobile: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const afterLoginRedirect = (userRole) => {
    if (userRole === 'farmer') {
      navigate('/farmer/products');
    } else if (userRole === 'admin') {
      navigate('/admin/verifications');
    } else {
      navigate('/products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        mobile: form.mobile,
        password: form.password,
        role,
      });

      login(res.data.user, res.data.token);

      toast.success(`Welcome back, ${res.data.user.name}!`);

      afterLoginRedirect(res.data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">

              <h3 className="text-center fw-bold text-success mb-4">
                {t('auth.loginTitle')}
              </h3>

              <Nav
                variant="pills"
                className="justify-content-center mb-4 flex-wrap gap-2"
              >
                {['farmer', 'customer', 'bulkbuyer', 'admin'].map((r) => (
                  <Nav.Item key={r}>
                    <Nav.Link
                      active={role === r}
                      onClick={() => setRole(r)}
                      className="rounded-pill px-3"
                    >
                      {t(`auth.${r}`)}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.mobile')}</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    pattern="[6-9]{1}[0-9]{9}"
                    placeholder="9876543210"
                    required
                    value={form.mobile}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>{t('auth.password')}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="success"
                  className="w-100 rounded-pill fw-bold"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('auth.loginButton')}
                </Button>

              </Form>

              <p className="text-center mt-3 mb-0">
                {t('auth.noAccount')}{' '}
                <Link to="/signup">
                  {t('nav.signup')}
                </Link>
              </p>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;