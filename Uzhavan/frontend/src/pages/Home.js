import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import api from '../services/api';

const CATEGORY_ICONS = {
  cereals: 'bi-basket',
  pulses: 'bi-egg-fried',
  vegetables: 'bi-flower1',
  fruits: 'bi-apple',
  spices: 'bi-fire',
  oilseeds: 'bi-droplet',
  flowers: 'bi-flower3',
  dairy: 'bi-cup-straw',
  others: 'bi-box-seam'
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/meta/categories').then((res) => setCategories(res.data.categories));
  }, []);

  return (
    <div>
      <div className="hero-section text-white text-center py-5">
        <Container>
          <h1 className="display-5 fw-bold mb-3">{t('home.heroTitle')}</h1>
          <p className="lead mb-4">{t('home.heroSubtitle')}</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button as={Link} to="/products" variant="warning" size="lg" className="rounded-pill px-4 fw-bold text-dark">
              {t('home.browseProducts')}
            </Button>
            <Button as={Link} to="/signup" variant="outline-light" size="lg" className="rounded-pill px-4">
              {t('home.joinAsFarmer')}
            </Button>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <h2 className="text-center fw-bold mb-4 text-success">{t('home.categories')}</h2>
        <Row className="g-3 justify-content-center">
          {categories.map((cat) => (
            <Col xs={6} sm={4} md={3} lg={2} key={cat.key}>
              <Link to={`/products?category=${cat.key}`} className="text-decoration-none">
                <Card className="text-center h-100 border-0 shadow-sm category-card">
                  <Card.Body>
                    <i className={`bi ${CATEGORY_ICONS[cat.key] || 'bi-box-seam'} fs-1 text-success`}></i>
                    <div className="mt-2 fw-semibold text-dark">
                      {i18n.language === 'ta' ? cat.ta : cat.en}
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>

      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center fw-bold mb-5 text-success">{t('home.howItWorks')}</h2>
          <Row className="g-4 text-center">
            <Col md={4}>
              <div className="step-circle mx-auto mb-3">1</div>
              <h5 className="fw-bold">{t('home.step1Title')}</h5>
              <p className="text-muted">{t('home.step1Desc')}</p>
            </Col>
            <Col md={4}>
              <div className="step-circle mx-auto mb-3">2</div>
              <h5 className="fw-bold">{t('home.step2Title')}</h5>
              <p className="text-muted">{t('home.step2Desc')}</p>
            </Col>
            <Col md={4}>
              <div className="step-circle mx-auto mb-3">3</div>
              <h5 className="fw-bold">{t('home.step3Title')}</h5>
              <p className="text-muted">{t('home.step3Desc')}</p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Home;
