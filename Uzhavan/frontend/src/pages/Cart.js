import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { resolveUploadUrl } from '../services/api';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const { cart, refreshCart, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.info('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-success mb-4">{t('cart.title')}</h2>

      {(!cart.items || cart.items.length === 0) ? (
        <div className="text-center py-5">
          <p className="text-muted">{t('cart.empty')}</p>
          <Button as={Link} to="/products" variant="success" className="rounded-pill">
            {t('home.browseProducts')}
          </Button>
        </div>
      ) : (
        <>
          <Table responsive className="align-middle bg-white shadow-sm rounded">
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>{t('product.price')}</th>
                <th>{t('product.quantity')}</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => {
                const p = item.product;
                if (!p) return null;
                const name = i18n.language === 'ta' && p.nameTa ? p.nameTa : p.nameEn;
                return (
                  <tr key={p._id}>
                    <td style={{ width: 70 }}>
                      <Image
                        src={p.images?.[0] ? resolveUploadUrl(p.images[0]) : ''}
                        rounded
                        style={{ width: 60, height: 60, objectFit: 'cover' }}
                      />
                    </td>
                    <td>{name}<div className="small text-muted">{p.district}</div></td>
                    <td>{t('common.rupee')}{item.priceAtAdd}/{p.unit}</td>
                    <td>{item.quantity} {p.unit}</td>
                    <td>{t('common.rupee')}{(item.quantity * item.priceAtAdd).toFixed(2)}</td>
                    <td>
                      <Button variant="outline-danger" size="sm" onClick={() => handleRemove(p._id)}>
                        {t('cart.remove')}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="d-flex justify-content-end align-items-center gap-3 mt-4">
            <h4 className="fw-bold">
              {t('cart.total')}: {t('common.rupee')}{cartTotal.toFixed(2)}
            </h4>
            <Button variant="success" size="lg" className="rounded-pill" onClick={() => navigate('/checkout')}>
              {t('cart.checkout')}
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default Cart;
