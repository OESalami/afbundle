import { apiRequest } from './client';

// Create a new order
export async function createOrder(payload) {
  const { order } = await apiRequest('/orders', { 
    method: 'POST', 
    body: JSON.stringify(payload) 
  });
  return order;
}

// Get order by ID (for customer to check status)
export async function getOrderStatus(orderId) {
  const { order } = await apiRequest(`/orders/${orderId}`);
  return order;
}

// Get orders by phone number (for customer)
export async function getOrdersByPhone(phoneNumber) {
  const { items } = await apiRequest(`/orders/phone/${encodeURIComponent(phoneNumber)}`);
  return items;
}

// Get orders placed by an agent
export async function getOrdersByAgent(agentPhone) {
  const { items } = await apiRequest(`/orders/agent/${encodeURIComponent(agentPhone)}`);
  return items;
}

// Admin: List all orders
export async function listOrders(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const { items } = await apiRequest(`/orders${query}`, { auth: true });
  return items;
}

// Admin: Update order
export async function updateOrder(id, payload) {
  const { item } = await apiRequest(`/orders/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(payload), 
    auth: true 
  });
  return item;
}

// Admin: Delete order
export async function deleteOrderById(id) {
  await apiRequest(`/orders/${id}`, { method: 'DELETE', auth: true });
  return true;
}