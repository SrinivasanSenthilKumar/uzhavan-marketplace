import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container className="text-center">
        <h5 className="mb-1">
          <i className="bi bi-flower2 me-2"></i>
          {t('appName')}
        </h5>
        <p className="mb-1 small text-light-emphasis">{t('tagline')}</p>
        <p className="mb-0 small text-secondary">
          &copy; {new Date().getFullYear()} {t('appName')}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
