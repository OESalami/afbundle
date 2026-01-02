import React from 'react';
import Button from '../../shared/components/Button';
import OrderSummary from '../components/OrderSummary';
import { getCurrentOrder, clearCurrentOrder, getOrders, saveOrders } from '../../shared/utils/storage';
import { initializePayment, createOrderInstant } from '../../shared/api/payments';
import { useNavigate } from 'react-router-dom';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const EMAIL_DOMAIN = import.meta.env.VITE_EMAIL_DOMAIN || 'afdbundles.com';

export default function Checkout() {
  const navigate = useNavigate();
  const order = getCurrentOrder();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  if (!order) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="text-sm text-gray-700">No order selected.</div>
        <div className="mt-2">
          <Button variant="default" onClick={() => navigate('/')}>Back</Button>
        </div>
      </div>
    );
  }

  // Generate email from phone number
  const phoneNumber = order.recipient || order.phoneNumber;
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
      amountPaid: response.amount
    })
      .then((createdOrder) => {
        // Store order locally
        const localOrder = {
          id: createdOrder.id,
          orderId: createdOrder.orderId,
          packageId: order.packageId,
          networkId: order.networkId,
          networkName: createdOrder.networkName,
          dataSize: createdOrder.sizeGb,
          recipient: createdOrder.phoneNumber,
          price: createdOrder.amount,
          paymentStatus: createdOrder.paymentStatus,
          deliveryStatus: createdOrder.deliveryStatus,
          createdAt: createdOrder.createdAt,
        };

        const orders = getOrders();
        saveOrders([localOrder, ...orders]);

        // Clear current order from session
        clearCurrentOrder();

        // Navigate to orders page immediately
        navigate('/orders');
      })
      .catch((err) => {
        setError(err.message || 'Failed to create order. Please contact support with your payment reference.');
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

  const onPay = async () => {
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
        ref: `DATA_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
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
    <div className="max-w-md mx-auto p-4">
      <OrderSummary order={order} />
      
      {error && (
        <div className="mt-3 p-2 bg-red-100 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      
      <div className="mt-4">
        <Button 
          variant="primary" 
          onClick={onPay}
        >
          Pay with Paystack
        </Button>
      </div>
    </div>
  );
}