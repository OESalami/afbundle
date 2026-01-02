import { apiRequest } from './client';

// Fetch all packages for a network (optionally filter by type)
export async function fetchNetworkPackages(networkId, type = null) {
  let url = `/packages?networkId=${encodeURIComponent(networkId)}`;
  if (type) {
    url += `&type=${encodeURIComponent(type)}`;
  }
  const { items } = await apiRequest(url);
  return items;
}

// Fetch price map for a network (sizeGb -> price)
export async function fetchNetworkPrices(networkId, type = 'customer') {
  const { prices } = await apiRequest(`/packages/prices/${encodeURIComponent(networkId)}?type=${encodeURIComponent(type)}`);
  return prices;
}

// Admin: Create package
export async function createPackage(payload) {
  const { item } = await apiRequest('/packages', { 
    method: 'POST', 
    body: JSON.stringify(payload), 
    auth: true 
  });
  return item;
}

// Admin: Update package
export async function updatePackage(id, payload) {
  const { item } = await apiRequest(`/packages/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(payload), 
    auth: true 
  });
  return item;
}

// Admin: Delete package
export async function deletePackage(id) {
  await apiRequest(`/packages/${id}`, { method: 'DELETE', auth: true });
  return true;
}