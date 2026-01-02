import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AgentRoutes from './routes/AgentRoutes';
import { agentLogout, isAgentLoggedIn, getAgentData, getAgentMe } from '../shared/api/agent';

export default function AgentApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agentData, setAgentData] = useState(getAgentData());
  const location = useLocation();
  const isAuthPage = location.pathname === '/a/login' || location.pathname === '/a/signup';
  const isLoggedIn = isAgentLoggedIn();

  // Refresh agent data on mount (to get latest status)
  useEffect(() => {
    if (isLoggedIn && !isAuthPage) {
      getAgentMe()
        .then((freshAgent) => {
          setAgentData(freshAgent);
          localStorage.setItem('agent_data', JSON.stringify(freshAgent));
        })
        .catch((e) => console.error('Failed to refresh agent data:', e));
    }
  }, [isLoggedIn, isAuthPage]);

  // Show simple layout for auth pages
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-md">
          <AgentRoutes />
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
        agentData={agentData}
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
              <h1 className="text-base font-semibold text-gray-900">Agent Portal</h1>
              {agentData && (
                <p className="text-xs text-gray-500">Welcome, {agentData.name}</p>
              )}
            </div>
          </div>
          {agentData && (
            <StatusBadge status={agentData.status} />
          )}
        </header>

        {/* Routes */}
        <AgentRoutes />
      </div>
    </div>
  );
}

function Sidebar({ isOpen, onClose, agentData }) {
  const location = useLocation();

  const menuItems = [
    { path: '/a', label: 'Home', icon: HomeIcon },
    { path: '/a/orders', label: 'Orders', icon: OrdersIcon },
  ];

  const handleLogout = () => {
    agentLogout();
    window.location.href = '/a/login';
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-900">Agent Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        {agentData && (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{agentData.name}</div>
            <div className="text-xs text-gray-500">{agentData.email}</div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="p-2">
        {menuItems.map((item) => {
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

function HomeIcon({ className }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function OrdersIcon({ className }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

function StatusBadge({ status }) {
  const config = {
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: 'text-green-600',
      label: 'Verified'
    },
    pending: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: 'text-gray-500',
      label: 'Pending'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: 'text-red-600',
      label: 'Rejected'
    }
  };

  const { bg, text, icon, label } = config[status] || config.pending;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 ${bg} rounded-full`}>
      {status === 'approved' ? (
        <svg className={`w-4 h-4 ${icon}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : status === 'rejected' ? (
        <svg className={`w-4 h-4 ${icon}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className={`w-4 h-4 ${icon}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )}
      <span className={`text-xs font-medium ${text}`}>{label}</span>
    </div>
  );
}
