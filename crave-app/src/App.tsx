import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing      from './pages/Landing';
import Menu         from './pages/Menu';
import Cart         from './pages/Cart';
import Payment      from './pages/Payment';
import Confirmation from './pages/Confirmation';
import Tracking     from './pages/Tracking';
import AdminLogin   from './pages/admin/AdminLogin';
import AdminLayout  from './pages/admin/AdminLayout';
import Dashboard    from './pages/admin/Dashboard';
import Orders       from './pages/admin/Orders';
import MenuManager  from './pages/admin/MenuManager';
import Tables       from './pages/admin/Tables';
import Kitchen      from './pages/admin/Kitchen';
import Settings     from './pages/admin/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client routes */}
        <Route path="/"                                   element={<Landing />} />
        <Route path="/menu/:tableId"                      element={<Menu />} />
        <Route path="/cart/:tableId"                      element={<Cart />} />
        <Route path="/payment/:tableId"                   element={<Payment />} />
        <Route path="/confirmation/:tableId/:orderId"     element={<Confirmation />} />
        <Route path="/tracking/:tableId/:orderId"         element={<Tracking />} />

        {/* Admin routes */}
        <Route path="/admin"                              element={<AdminLogin />} />
        <Route path="/admin"                              element={<AdminLayout />}>
          <Route path="dashboard"                         element={<Dashboard />} />
          <Route path="orders"                            element={<Orders />} />
          <Route path="menu"                              element={<MenuManager />} />
          <Route path="tables"                            element={<Tables />} />
          <Route path="kitchen"                           element={<Kitchen />} />
          <Route path="vue-serveur"                       element={<Kitchen />} />
          <Route path="settings"                          element={<Settings />} />
          <Route index                                    element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
