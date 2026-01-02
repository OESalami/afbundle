import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  let authed = false;
  try {
    authed = Boolean(localStorage.getItem('admin_token'));
  } catch {}
  if (!authed) return <Navigate to="/admin/login" replace />
  return <Outlet />
}