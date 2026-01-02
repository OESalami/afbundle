import { Navigate, Outlet } from 'react-router-dom';
import { isAgentLoggedIn } from '../../shared/api/agent';

export default function ProtectedRoute() {
  if (!isAgentLoggedIn()) {
    return <Navigate to="/a/login" replace />;
  }
  return <Outlet />;
}
