import { apiRequest } from './client';

// Initialize payment - get payment data for Paystack
export async function initializePayment(payload) {
  const { paymentData } = await apiRequest('/payments/initialize', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return paymentData;
}

// Create order instantly after Paystack success
export async function createOrderInstant(payload) {
  const { order } = await apiRequest('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return order;
}
