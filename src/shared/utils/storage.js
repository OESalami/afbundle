const ORDERS_KEY = 'data_app_orders';
const CURRENT_ORDER_KEY = 'data_app_current_order';

import { createOrder as apiCreateOrder } from '../api/orders';

export const getOrders = () => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveOrders = (orders) => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
};

export const deleteOrderFromStorage = (orderId) => {
  try {
    const orders = getOrders();
    const filtered = orders.filter(o => o.id !== orderId && o.orderId !== orderId);
    saveOrders(filtered);
    return filtered;
  } catch {
    return getOrders();
  }
};

// Create order in database and store locally
export const addOrder = async (order) => {
  try {
    // Create order in database first
    const payload = {
      packageId: order.packageId,  // e.g., 'mtn_5'
      phoneNumber: order.recipient || order.phoneNumber,
    };
    
    const dbOrder = await apiCreateOrder(payload);
    
    // Store in localStorage with database ID for syncing
    const localOrder = {
      id: dbOrder.id,
      orderId: dbOrder.orderId,
      packageId: order.packageId,
      networkId: order.networkId,
      networkName: dbOrder.networkName || order.networkName,
      dataSize: dbOrder.sizeGb || order.dataSize,
      recipient: dbOrder.phoneNumber,
      price: dbOrder.amount || order.price,
      paymentStatus: dbOrder.paymentStatus,
      deliveryStatus: dbOrder.deliveryStatus,
      createdAt: dbOrder.createdAt,
    };
    
    const orders = getOrders();
    saveOrders([localOrder, ...orders]);
    
    return localOrder;
  } catch (error) {
    console.error('Failed to create order:', error);
    
    // Fallback: store locally only if API fails
    const localOrder = {
      id: Date.now(),
      packageId: order.packageId,
      networkId: order.networkId,
      networkName: order.networkName,
      dataSize: order.dataSize,
      recipient: order.recipient,
      price: order.price,
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      synced: false,  // Mark as not synced
      createdAt: new Date().toISOString(),
    };
    
    const orders = getOrders();
    saveOrders([localOrder, ...orders]);
    
    return localOrder;
  }
};

export const deleteOrder = (orderId) => {
  const orders = getOrders();
  const next = orders.filter((o) => o.id !== orderId);
  saveOrders(next);
  return next;
};

export const setCurrentOrder = (order) => {
  try {
    localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(order));
  } catch {}
};

export const getCurrentOrder = () => {
  try {
    const raw = localStorage.getItem(CURRENT_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearCurrentOrder = () => {
  try {
    localStorage.removeItem(CURRENT_ORDER_KEY);
  } catch {}
};