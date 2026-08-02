import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const AppNavbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('appLanguage', lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="success" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="bi bi-flower2 me-2"></i>
          {t('appName')}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">{t('nav.home')}</Nav.Link>
            <Nav.Link as={Link} to="/products">{t('nav.products')}</Nav.Link>

            {user?.role === 'farmer' && (
              <>
                <Nav.Link as={Link} to="/farmer/products">{t('nav.myProducts')}</Nav.Link>
                <Nav.Link as={Link} to="/farmer/products/new">{t('nav.addProduct')}</Nav.Link>
                <Nav.Link as={Link} to="/farmer/requests">{t('nav.requests')}</Nav.Link>
                <Nav.Link as={Link} to="/farmer/orders">{t('nav.orders')}</Nav.Link>
              </>
            )}

            {(user?.role === 'customer' || user?.role === 'bulkbuyer') && (
              <>
                <Nav.Link as={Link} to="/cart" className="position-relative">
                  {t('nav.cart')}
                  {cartCount > 0 && (
                    <Badge bg="warning" text="dark" pill className="ms-1">{cartCount}</Badge>
                  )}
                </Nav.Link>
                <Nav.Link as={Link} to="/orders">{t('nav.orders')}</Nav.Link>
              </>
            )}

            {user?.role === 'bulkbuyer' && (
              <Nav.Link as={Link} to="/bulkbuyer/requests">{t('nav.requests')}</Nav.Link>
            )}

            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin/verifications">
                <i className="bi bi-shield-check me-1"></i>
                {t('nav.verifications')}
              </Nav.Link>
            )}

            {user && user.role !== 'admin' && <Nav.Link as={Link} to="/chat">{t('nav.chat')}</Nav.Link>}
          </Nav>

          <Nav className="align-items-lg-center">
            <NavDropdown title={i18n.language === 'ta' ? 'தமிழ்' : 'English'} id="lang-dropdown">
              <NavDropdown.Item onClick={() => changeLanguage('en')}>English</NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLanguage('ta')}>தமிழ்</NavDropdown.Item>
            </NavDropdown>

            {user ? (
              <NavDropdown title={user.name} id="user-dropdown" align="end">
                <NavDropdown.Item as={Link} to="/profile">{t('nav.profile')}</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>{t('nav.logout')}</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">{t('nav.login')}</Nav.Link>
                <Nav.Link as={Link} to="/signup" className="btn btn-warning text-dark px-3 ms-2 rounded-pill">
                  {t('nav.signup')}
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
