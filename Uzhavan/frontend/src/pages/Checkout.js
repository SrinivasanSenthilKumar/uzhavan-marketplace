import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cart, cartTotal, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalizeOrder = async (razorpayDetails) => {
    const res = await api.post('/orders', {
      deliveryAddress: address,
      contactMobile: mobile,
      paymentMethod,
      razorpayDetails
    });
    toast.success('Order placed successfully!');
    await clearCart();
    refreshCart();
    navigate('/orders');
    return res.data.order;
  };

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Failed to load payment gateway. Check your connection.');
      return;
    }

    try {
      const orderRes = await api.post('/payments/create-order', { amount: cartTotal });
      const { order, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'TN Farmer Marketplace',
        description: 'Secure payment to farmer',
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', response);
            await finalizeOrder(response);
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user?.name, contact: mobile },
        theme: { color: '#2e7d32' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Payment gateway not available. You can select Cash on Delivery instead.'
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (paymentMethod === 'cod') {
        await finalizeOrder(null);
      } else {
        await handleRazorpayPayment();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={7}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-success mb-4">{t('cart.checkout')}</h3>
              {error && <Alert variant="warning">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('cart.deliveryAddress')}</Form.Label>
                  <Form.Control as="textarea" rows={2} required value={address} onChange={(e) => setAddress(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('cart.contactMobile')}</Form.Label>
                  <Form.Control required value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="radio"
                    label={t('cart.payNow') + ' (Razorpay)'}
                    name="paymentMethod"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <Form.Check
                    type="radio"
                    label={t('cart.codOption')}
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                </Form.Group>

                <h5 className="mb-3">{t('cart.total')}: {t('common.rupee')}{cartTotal.toFixed(2)}</h5>

                <Button type="submit" variant="success" size="lg" className="w-100 rounded-pill fw-bold" disabled={loading}>
                  {loading ? t('common.loading') : paymentMethod === 'cod' ? 'Place Order' : t('cart.payNow')}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
