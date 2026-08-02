import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container, Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';

const FarmerProducts = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ quantity: '', pricePerUnit: '' });

  const fetchProducts = async () => {
    setLoading(true);
    const res = await api.get('/products/mine');
    setProducts(res.data.products);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const startEdit = (p) => {
    setEditingId(p._id);
    setEditValues({ quantity: p.quantity, pricePerUnit: p.pricePerUnit });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/products/${id}`, editValues);
      toast.success('Product updated');
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const togglePublish = async (p) => {
    await api.put(`/products/${p._id}`, { isPublished: !p.isPublished });
    fetchProducts();
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-success">{t('nav.myProducts')}</h2>
        <Button as={Link} to="/farmer/products/new" variant="success" className="rounded-pill">
          <i className="bi bi-plus-circle me-1"></i> {t('nav.addProduct')}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
      ) : products.length === 0 ? (
        <p className="text-muted text-center py-5">{t('product.noProducts')}</p>
      ) : (
        <Table responsive hover className="align-middle bg-white shadow-sm rounded">
          <thead className="table-success">
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>{t('product.quantity')}</th>
              <th>{t('product.price')}</th>
              <th>District</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{i18n.language === 'ta' && p.nameTa ? p.nameTa : p.nameEn}</td>
                <td className="text-capitalize">{p.category}</td>
                <td style={{ minWidth: 100 }}>
                  {editingId === p._id ? (
                    <Form.Control
                      size="sm"
                      type="number"
                      value={editValues.quantity}
                      onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                    />
                  ) : (
                    `${p.quantity} ${p.unit}`
                  )}
                </td>
                <td style={{ minWidth: 100 }}>
                  {editingId === p._id ? (
                    <Form.Control
                      size="sm"
                      type="number"
                      value={editValues.pricePerUnit}
                      onChange={(e) => setEditValues({ ...editValues, pricePerUnit: e.target.value })}
                    />
                  ) : (
                    `₹${p.pricePerUnit}`
                  )}
                </td>
                <td>{p.district}</td>
                <td>
                  <Badge bg={p.isPublished ? 'success' : 'secondary'} className="me-1" role="button" onClick={() => togglePublish(p)}>
                    {p.isPublished ? 'Published' : 'Unpublished'}
                  </Badge>
                  {p.isSoldOut && <Badge bg="danger">{t('product.soldOut')}</Badge>}
                </td>
                <td>
                  {editingId === p._id ? (
                    <Button size="sm" variant="success" onClick={() => saveEdit(p._id)}>{t('common.save')}</Button>
                  ) : (
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => startEdit(p)}>
                      {t('product.edit')}
                    </Button>
                  )}
                  <Button size="sm" variant="outline-danger" className="ms-1" onClick={() => handleDelete(p._id)}>
                    {t('product.delete')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default FarmerProducts;
