import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StorefrontLayout from './components/storefront/StorefrontLayout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Storefront Pages
import Home from './pages/storefront/Home';
import ProductDetail from './pages/storefront/ProductDetail';
import Cart from './pages/storefront/Cart';
import Checkout from './pages/storefront/Checkout';
import OrderConfirmation from './pages/storefront/OrderConfirmation';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import InventoryList from './pages/admin/inventory/InventoryList';
import ProductForm from './pages/admin/inventory/ProductForm';
import SupplierList from './pages/admin/suppliers/SupplierList';
import SupplierForm from './pages/admin/suppliers/SupplierForm';
import DeliveryForm from './pages/admin/suppliers/DeliveryForm';
import OrderList from './pages/admin/orders/OrderList';
import OrderDetail from './pages/admin/orders/OrderDetail';
import Reports from './pages/admin/reports/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Storefront Routes */}
        <Route path="/" element={<StorefrontLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Routes (Protected) */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
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
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
