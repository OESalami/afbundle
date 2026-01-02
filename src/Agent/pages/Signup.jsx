import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { agentSignup } from '../../shared/api/agent';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const REGISTRATION_FEE = parseInt(import.meta.env.VITE_AGENT_REGISTRATION_FEE) || 50; // GH₵
const EMAIL_DOMAIN = import.meta.env.VITE_EMAIL_DOMAIN || 'afdbundles.com';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.name || !form.phone || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      setError('Phone number must be 10 digits');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Invalid email format');
      return false;
    }

    return true;
  };

  const handlePaystackSuccess = (response) => {
    console.log('Paystack success:', response);
    setLoading(true);
    setError('');

    // Register agent with payment reference
    agentSignup({
      ...form,
      paymentReference: response.reference
    })
      .then(() => {
        navigate('/a/login', { 
          state: { message: 'Account created successfully! Please login.' } 
        });
      })
      .catch((err) => {
        setError(err.message || 'Registration failed. Please contact support with your payment reference: ' + response.reference);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePaystackClose = () => {
    setError('Payment cancelled. Please complete payment to register.');
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Generate email for Paystack
    const paystackEmail = form.email || `${form.phone}@${EMAIL_DOMAIN}`;

    // Open Paystack popup
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: paystackEmail,
      amount: REGISTRATION_FEE * 100, // Amount in pesewas
      currency: 'GHS',
      ref: `AGENT_REG_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
      metadata: {
        type: 'agent_registration',
        name: form.name,
        phone: form.phone,
        email: form.email
      },
      callback: handlePaystackSuccess,
      onClose: handlePaystackClose
    });

    handler.openIframe();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xl font-bold">A</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Become an Agent</h1>
      <p className="text-sm text-gray-600 text-center mb-6">
        Create your agent account
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="0XXXXXXXXX"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="agent@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Re-enter password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Registration Fee Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Registration Fee</span>
            <span className="text-lg font-bold text-blue-600">GH₵ 50.00</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            One-time fee to activate your agent account
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay & Sign Up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/a/login" className="text-blue-600 font-medium hover:underline">
          Login
        </Link>
      </p>

      <Link to="/" className="mt-4 text-center text-sm text-gray-500 hover:underline block">
        ← Back to Home
      </Link>
    </div>
  );
}
