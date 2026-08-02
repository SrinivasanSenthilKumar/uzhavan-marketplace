import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resolveUploadUrl } from '../services/api';

const PLACEHOLDER_IMG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23e8f5e9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%232e7d32" font-family="sans-serif" font-size="20">No Image</text></svg>`
  );

const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const name = isTa && product.nameTa ? product.nameTa : product.nameEn;
  const image = product.images?.[0] ? resolveUploadUrl(product.images[0]) : PLACEHOLDER_IMG;

  return (
    <Card className="h-100 shadow-sm product-card border-0">
      <div style={{ height: 180, overflow: 'hidden' }}>
        <Card.Img
          variant="top"
          src={image}
          alt={name}
          style={{ height: '100%', objectFit: 'cover' }}
          onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
        />
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <Card.Title className="mb-0 fs-6 fw-bold">{name}</Card.Title>
          {product.isOrganic && <Badge bg="success">{t('product.organic')}</Badge>}
        </div>
        <div className="text-muted small mb-2">
          <i className="bi bi-geo-alt me-1"></i>
          {product.district}
        </div>
        <div className="fw-bold text-success mb-2">
          {t('common.rupee')}{product.pricePerUnit} / {product.unit}
        </div>
        <div className="small text-muted mb-3">
          {t('product.quantity')}: {product.quantity} {product.unit}
        </div>
        <div className="mt-auto">
          <Button as={Link} to={`/products/${product._id}`} variant="success" className="w-100 rounded-pill">
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
