import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../shared/utils/format';
import { initializePayment, createOrderInstant } from '../../shared/api/payments';
import { getAgentData } from '../../shared/api/agent';

const AGENT_ORDER_KEY = 'agent_current_order';
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const EMAIL_DOMAIN = import.meta.env.VITE_EMAIL_DOMAIN || 'afdbundles.com';

export default function Checkout() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const agentData = getAgentData();

  useEffect(() => {
    const stored = localStorage.getItem(AGENT_ORDER_KEY);
    if (stored) {
      setOrder(JSON.parse(stored));
    }
  }, []);

  if (!order) {
    return (
      <div className="p-4">
        <div className="text-sm text-gray-700 mb-4">No order selected.</div>
        <button
          onClick={() => navigate('/a')}
          className="text-sm text-blue-600 hover:underline"
        >
          Go back to networks
        </button>
      </div>
    );
  }

  // Generate email from phone number
  const phoneNumber = order.recipient;
  const generatedEmail = `${phoneNumber}@${EMAIL_DOMAIN}`;

  const handlePaystackSuccess = (response) => {
    console.log('Paystack success response:', response);
    setLoading(true);
    setError(null);

    // Create order instantly - verification happens async on backend
    createOrderInstant({
      reference: response.reference,
      packageId: order.packageId,
      phoneNumber: phoneNumber,
      email: generatedEmail,
      amountPaid: response.amount,
      agentPhone: agentData?.phone // Track which agent placed this order
    })
      .then((createdOrder) => {
        // Clear current order
        localStorage.removeItem(AGENT_ORDER_KEY);
        // Navigate to orders page
        navigate('/a/orders');
      })
      .catch((err) => {
        setError(err.message || 'Failed to create order. Please contact support.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePaystackClose = () => {
    setError('Payment cancelled. Please try again.');
    setLoading(false);
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize payment to get amount from backend
      const paymentData = await initializePayment({
        packageId: order.packageId,
        phoneNumber: phoneNumber,
        email: generatedEmail
      });

      // Load Paystack popup
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: generatedEmail,
        amount: paymentData.amount, // Amount in pesewas
        currency: 'GHS',
        ref: `AGENT_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        metadata: paymentData.metadata,
        callback: handlePaystackSuccess,
        onClose: handlePaystackClose
      });

      handler.openIframe();
    } catch (err) {
      setError(err.message || 'Failed to initialize payment. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-600 mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h1>

      {/* Order Details */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 mb-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Network</span>
            <span className="font-medium text-gray-900">{order.networkName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Data Size</span>
            <span className="font-medium text-gray-900">{order.dataSize}GB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Recipient</span>
            <span className="font-medium text-gray-900">{order.recipient}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-blue-600">
              {formatCurrency(order.price)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePay}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Pay with Paystack
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Secure payment via Paystack
      </p>
    </div>
  );
}
