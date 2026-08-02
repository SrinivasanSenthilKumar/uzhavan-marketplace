import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Table, Badge, Spinner } from 'react-bootstrap';
import api from '../services/api';

const STATUS_COLORS = {
  placed: 'secondary', confirmed: 'info', packed: 'primary',
  shipped: 'warning', delivered: 'success', cancelled: 'danger'
};

const Orders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mine').then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    });
  }, []);

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-success mb-4">{t('order.title')}</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
      ) : orders.length === 0 ? (
        <p className="text-muted text-center py-5">No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="bg-white rounded shadow-sm p-3 mb-3">
            <div className="d-flex justify-content-between flex-wrap mb-2">
              <div>
                <strong>{t('order.orderId')}:</strong> {order._id.slice(-8).toUpperCase()}
                <div className="text-muted small">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-end">
                <Badge bg={STATUS_COLORS[order.orderStatus]} className="text-capitalize me-2">
                  {order.orderStatus}
                </Badge>
                <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'secondary'} className="text-capitalize">
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
            <Table size="sm" borderless className="mb-2">
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.nameEn}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>{t('common.rupee')}{item.pricePerUnit}</td>
                    <td>{t('common.rupee')}{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="text-end fw-bold">{t('order.totalAmount')}: {t('common.rupee')}{order.totalAmount}</div>
          </div>
        ))
      )}
    </Container>
  );
};

export default Orders;
