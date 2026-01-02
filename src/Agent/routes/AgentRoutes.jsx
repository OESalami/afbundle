import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Networks from '../pages/Networks';
import Packages from '../pages/Packages';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AgentRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Networks />} />
        <Route path="/network/:networkId" element={<Packages />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/a" replace />} />
    </Routes>
  );
}
