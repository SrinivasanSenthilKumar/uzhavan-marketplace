import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Table, Badge, Spinner, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

const FarmerOrders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await api.get('/orders/farmer-orders');
    setOrders(res.data.orders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-success mb-4">{t('order.farmerOrders')}</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
      ) : orders.length === 0 ? (
        <p className="text-muted text-center py-5">No orders yet.</p>
      ) : (
        <Table responsive className="align-middle bg-white shadow-sm rounded">
          <thead className="table-success">
            <tr>
              <th>{t('order.orderId')}</th>
              <th>Buyer</th>
              <th>Items (yours)</th>
              <th>{t('order.status')}</th>
              <th>{t('order.updateStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const myItems = order.items.filter((i) => i.farmer === user._id || i.farmer?._id === user._id);
              return (
                <tr key={order._id}>
                  <td>{order._id.slice(-8).toUpperCase()}</td>
                  <td>{order.buyer?.name}<div className="small text-muted">{order.buyer?.mobile}</div></td>
                  <td>
                    {myItems.map((item, idx) => (
                      <div key={idx}>{item.nameEn} - {item.quantity} {item.unit}</div>
                    ))}
                  </td>
                  <td><Badge bg="info" className="text-capitalize">{order.orderStatus}</Badge></td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Form.Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default FarmerOrders;
