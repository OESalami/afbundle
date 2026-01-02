import { NavLink } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        {/* Hamburger Menu Button */}
        <button
          className="text-gray-700 p-2 rounded-md hover:bg-gray-100"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black font-bold text-sm">
            DB
          </div>
          <span className="text-base font-semibold text-gray-900">Data Bundles</span>
        </NavLink>

        {/* Placeholder for balance */}
        <div className="w-10"></div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
    </nav>
  );
}

function Sidebar({ isOpen, onClose }) {
  const linkClass = "flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50";
  const activeLinkClass = "flex items-center gap-3 px-4 py-3 text-sm text-gray-900 bg-yellow-50 border-l-4 border-yellow-400";

  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
            DB
          </div>
          <span className="font-semibold text-gray-900">Data Bundles</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="py-2">
        <NavLink
          to="/"
          onClick={onClose}
          className={({ isActive }) => isActive ? activeLinkClass : linkClass}
        >
          <HomeIcon />
          Home
        </NavLink>
        
        <NavLink
          to="/orders"
          onClick={onClose}
          className={({ isActive }) => isActive ? activeLinkClass : linkClass}
        >
          <OrdersIcon />
          Orders
        </NavLink>
        
        <NavLink
          to="/contact"
          onClick={onClose}
          className={({ isActive }) => isActive ? activeLinkClass : linkClass}
        >
          <ContactIcon />
          Contact
        </NavLink>

        {/* Divider with "Become an Agent" */}
        <div className="my-3 px-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500">Become an Agent</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
        </div>

        <NavLink
          to="/a/login"
          onClick={onClose}
          className={linkClass}
        >
          <LoginIcon />
          Login
        </NavLink>
        
        <NavLink
          to="/a/signup"
          onClick={onClose}
          className={linkClass}
        >
          <SignUpIcon />
          Sign Up
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2025 Data Bundles
        </div>
      </div>
    </div>
  );
}

// Icons
function HomeIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}

function SignUpIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}