import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';

import AppNavbar from './components/AppNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import IncomingCallAlert from './components/IncomingCallAlert';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import FarmerProducts from './pages/FarmerProducts';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import FarmerOrders from './pages/FarmerOrders';
import FarmerRequests from './pages/FarmerRequests';
import BulkBuyerRequests from './pages/BulkBuyerRequests';
import ChatInbox from './pages/ChatInbox';
import Profile from './pages/Profile';
import AdminVerifications from './pages/AdminVerifications';

import './i18n';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="d-flex flex-column min-vh-100">
              <AppNavbar />
              <IncomingCallAlert />
              <main className="flex-grow-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:id" element={<ProductDetail />} />

                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><ChatInbox /></ProtectedRoute>} />

                  <Route
                    path="/farmer/products"
                    element={<ProtectedRoute roles={['farmer']}><FarmerProducts /></ProtectedRoute>}
                  />
                  <Route
                    path="/farmer/products/new"
                    element={<ProtectedRoute roles={['farmer']}><AddProduct /></ProtectedRoute>}
                  />
                  <Route
                    path="/farmer/orders"
                    element={<ProtectedRoute roles={['farmer']}><FarmerOrders /></ProtectedRoute>}
                  />
                  <Route
                    path="/farmer/requests"
                    element={<ProtectedRoute roles={['farmer']}><FarmerRequests /></ProtectedRoute>}
                  />

                  <Route
                    path="/cart"
                    element={<ProtectedRoute roles={['customer', 'bulkbuyer']}><Cart /></ProtectedRoute>}
                  />
                  <Route
                    path="/checkout"
                    element={<ProtectedRoute roles={['customer', 'bulkbuyer']}><Checkout /></ProtectedRoute>}
                  />
                  <Route
                    path="/orders"
                    element={<ProtectedRoute roles={['customer', 'bulkbuyer']}><Orders /></ProtectedRoute>}
                  />
                  <Route
                    path="/bulkbuyer/requests"
                    element={<ProtectedRoute roles={['bulkbuyer']}><BulkBuyerRequests /></ProtectedRoute>}
                  />

                  <Route
                    path="/admin/verifications"
                    element={<ProtectedRoute roles={['admin']}><AdminVerifications /></ProtectedRoute>}
                  />
                </Routes>
              </main>
              <Footer />
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
          </BrowserRouter>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
