import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, Spinner, Pagination } from 'react-bootstrap';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);

  const district = searchParams.get('district') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    api.get('/meta/districts').then((res) => setDistricts(res.data.districts));
    api.get('/meta/categories').then((res) => setCategories(res.data.categories));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (district) params.district = district;
      if (category) params.category = category;
      if (search) params.search = search;
      const res = await api.get('/products', { params });
      setProducts(res.data.products);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [district, category, search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-success mb-4">{t('nav.products')}</h2>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Control
            placeholder={t('product.search')}
            defaultValue={search}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
            onBlur={(e) => updateParam('search', e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select value={district} onChange={(e) => updateParam('district', e.target.value)}>
            <option value="">{t('product.allDistricts')}</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="">{t('product.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>{i18n.language === 'ta' ? c.ta : c.en}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted py-5">{t('product.noProducts')}</p>
      ) : (
        <>
          <Row className="g-4">
            {products.map((p) => (
              <Col key={p._id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>

          {pages > 1 && (
            <Pagination className="justify-content-center mt-4">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Pagination.Item
                  key={p}
                  active={p === page}
                  onClick={() => updateParam('page', p)}
                >
                  {p}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductList;
