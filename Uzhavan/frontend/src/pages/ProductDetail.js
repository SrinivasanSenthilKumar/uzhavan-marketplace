import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Badge, Button, Form, Card, Carousel, Modal, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api, { resolveUploadUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ChatWindow from '../components/ChatWindow';
import VideoCallModal from '../components/VideoCallModal';

const ProductDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ requestedQuantity: '', offeredPricePerUnit: '', message: '' });

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  if (!product) return <Container className="py-5 text-center">{t('common.loading')}</Container>;

  const isTa = i18n.language === 'ta';
  const name = isTa && product.nameTa ? product.nameTa : product.nameEn;
  const description = isTa && product.descriptionTa ? product.descriptionTa : product.descriptionEn;

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    try {
      await addToCart(product._id, qty);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    await handleAddToCart();
    navigate('/cart');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/consumer-requests', {
        farmerId: product.farmer._id,
        productId: product._id,
        requestedQuantity: requestForm.requestedQuantity,
        unit: product.unit,
        offeredPricePerUnit: requestForm.offeredPricePerUnit || undefined,
        message: requestForm.message
      });
      toast.success('Request sent to farmer');
      setShowRequestModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col md={6}>
          {product.images?.length > 0 ? (
            <Carousel>
              {product.images.map((img, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    src={resolveUploadUrl(img)}
                    className="d-block w-100 rounded"
                    style={{ height: 400, objectFit: 'cover' }}
                    alt={name}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: 400 }}>
              <span className="text-muted">No Image</span>
            </div>
          )}
        </Col>

        <Col md={6}>
          <div className="d-flex justify-content-between align-items-start">
            <h2 className="fw-bold">{name}</h2>
            {product.isOrganic && <Badge bg="success">{t('product.organic')}</Badge>}
          </div>

          {product.farmer?.isGovtIdVerified === 'verified' && (
            <Badge bg="info" className="mb-2">
              <i className="bi bi-patch-check-fill me-1"></i>{t('product.verifiedFarmer')}
            </Badge>
          )}

          <p className="text-muted mb-1"><i className="bi bi-geo-alt me-1"></i>{product.district}{product.village ? `, ${product.village}` : ''}</p>
          <h3 className="text-success fw-bold my-3">
            {t('common.rupee')}{product.pricePerUnit} <span className="fs-6 text-muted">/ {product.unit}</span>
          </h3>
          <p>{description}</p>
          <p className="mb-1"><strong>{t('product.quantity')}:</strong> {product.quantity} {product.unit}</p>
          <p className="mb-3"><strong>Farmer:</strong> {product.farmer?.name} ({product.farmer?.mobile})</p>

          {product.isSoldOut ? (
            <Alert variant="secondary">{t('product.soldOut')}</Alert>
          ) : (
            (user?.role === 'customer' || user?.role === 'bulkbuyer' || !user) && (
              <div className="d-flex align-items-center gap-2 mb-3">
                <Form.Control
                  type="number"
                  min={1}
                  max={product.quantity}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  style={{ width: 90 }}
                />
                <Button variant="success" className="rounded-pill" onClick={handleAddToCart}>
                  {t('product.addToCart')}
                </Button>
                <Button variant="warning" className="rounded-pill text-dark" onClick={handleBuyNow}>
                  {t('product.buyNow')}
                </Button>
              </div>
            )
          )}

          {user && user.role !== 'farmer' && user._id !== product.farmer?._id && (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline-success" className="rounded-pill" onClick={() => setShowChat(!showChat)}>
                <i className="bi bi-chat-dots me-1"></i> {t('product.chatWithFarmer')}
              </Button>
              <Button variant="outline-primary" className="rounded-pill" onClick={() => setShowCall(true)}>
                <i className="bi bi-camera-video me-1"></i> {t('product.videoCall')}
              </Button>
              {user.role === 'bulkbuyer' && (
                <Button variant="outline-dark" className="rounded-pill" onClick={() => setShowRequestModal(true)}>
                  <i className="bi bi-briefcase me-1"></i> {t('requests.sendRequest')}
                </Button>
              )}
            </div>
          )}

          {!user && (
            <p className="text-muted mt-2">
              <Link to="/login">Login</Link> to chat, call, or contact the farmer directly.
            </p>
          )}
        </Col>
      </Row>

      {showChat && (
        <Row className="mt-4">
          <Col md={6}>
            <ChatWindow otherUserId={product.farmer._id} otherUserName={product.farmer.name} productId={product._id} />
          </Col>
        </Row>
      )}

      {showCall && (
        <VideoCallModal
          show={showCall}
          onHide={() => setShowCall(false)}
          mode="outgoing"
          targetUserId={product.farmer._id}
          targetName={product.farmer.name}
        />
      )}

      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('requests.sendRequest')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSendRequest}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('requests.requestedQuantity')} ({product.unit})</Form.Label>
              <Form.Control
                type="number"
                required
                value={requestForm.requestedQuantity}
                onChange={(e) => setRequestForm({ ...requestForm, requestedQuantity: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('requests.offeredPrice')} ({t('common.rupee')})</Form.Label>
              <Form.Control
                type="number"
                value={requestForm.offeredPricePerUnit}
                onChange={(e) => setRequestForm({ ...requestForm, offeredPricePerUnit: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('requests.message')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={requestForm.message}
                onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRequestModal(false)}>{t('common.cancel')}</Button>
            <Button variant="success" type="submit">{t('common.submit')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductDetail;
