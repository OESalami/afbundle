import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Orders from '../pages/Orders'
import Packages from '../pages/Packages'
import Networks from '../pages/Networks'
import Agents from '../pages/Agents'
import AgentOrders from '../pages/AgentOrders'
import AgentPackages from '../pages/AgentPackages'
import AdminLogin from '../pages/Login'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}> 
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/networks" element={<Networks />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agent-orders" element={<AgentOrders />} />
        <Route path="/agent-packages" element={<AgentPackages />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}