import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes';
import { logout } from '../shared/api/auth';

export default function AdminApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Don't show header/sidebar on login page
  const isLoginPage = location.pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-md">
          <AdminRoutes />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md hover:bg-gray-100"
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Manage orders & packages</p>
            </div>
          </div>
        </header>

        {/* Routes */}
        <AdminRoutes />
      </div>
    </div>
  );
}

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const customerItems = [
    { path: '/admin', label: 'Dashboard', icon: DashboardIcon },
    { path: '/admin/orders', label: 'Orders', icon: OrdersIcon },
    { path: '/admin/packages', label: 'Packages', icon: PackagesIcon },
  ];

  const agentItems = [
    { path: '/admin/agents', label: 'Agents', icon: AgentsIcon },
    { path: '/admin/agent-orders', label: 'Agent Orders', icon: OrdersIcon },
    { path: '/admin/agent-packages', label: 'Agent Packages', icon: PackagesIcon },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  return (
    <div 
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Menu</span>
        <button 
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {/* Customers Section */}
        <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
          Customers
        </div>
        {customerItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 ${
                isActive 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={isActive ? 'text-white' : 'text-gray-500'} />
              {item.label}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3 border-t border-gray-200"></div>

        {/* Agents Section */}
        <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
          Agents
        </div>
        {agentItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={isActive ? 'text-white' : 'text-gray-500'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
        >
          <LogoutIcon className="text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}

// Icons
function HamburgerIcon() {
  return (
    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function OrdersIcon({ className }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function PackagesIcon({ className }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function AgentsIcon({ className }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}