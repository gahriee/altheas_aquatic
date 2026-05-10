import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StorefrontLayout from './components/storefront/StorefrontLayout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/ui/Toast';

// Storefront Pages
import Home from './pages/storefront/Home';
import ProductDetail from './pages/storefront/ProductDetail';
import Cart from './pages/storefront/Cart';
import Checkout from './pages/storefront/Checkout';
import OrderConfirmation from './pages/storefront/OrderConfirmation';
import Register from './pages/storefront/Register';
import StorefrontLogin from './pages/storefront/Login';
import MyOrders from './pages/storefront/MyOrders';
import MyOrderDetail from './pages/storefront/MyOrderDetail';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProfileSettings from './pages/admin/ProfileSettings';
import InventoryList from './pages/admin/inventory/InventoryList';
import ProductForm from './pages/admin/inventory/ProductForm';
import SupplierList from './pages/admin/suppliers/SupplierList';
import SupplierForm from './pages/admin/suppliers/SupplierForm';
import DeliveryForm from './pages/admin/suppliers/DeliveryForm';
import OrderList from './pages/admin/orders/OrderList';
import OrderDetail from './pages/admin/orders/OrderDetail';
import Reports from './pages/admin/reports/Reports';

import UserList from './pages/admin/users/UserList';
import UserForm from './pages/admin/users/UserForm';
import NotificationHistory from './pages/admin/notifications/NotificationHistory';

// Public Auth Pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Storefront Routes */}
        <Route path="/" element={<StorefrontLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<StorefrontLogin />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="my-orders/:id" element={<MyOrderDetail />} />
        </Route>

        {/* Admin Login & Password Reset */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes (Protected) */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/add" element={<UserForm />} />
            <Route path="users/edit/:id" element={<UserForm />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="inventory/add" element={<ProductForm />} />
            <Route path="inventory/edit/:id" element={<ProductForm />} />
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="suppliers/add" element={<SupplierForm />} />
            <Route path="suppliers/edit/:id" element={<SupplierForm />} />
            <Route path="suppliers/delivery" element={<DeliveryForm />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<NotificationHistory />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </ToastProvider>
  );
}
