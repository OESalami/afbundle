import { apiRequest } from './client';

const AGENT_TOKEN_KEY = 'agent_token';
const AGENT_DATA_KEY = 'agent_data';

// Get agent token
export function getAgentToken() {
  try {
    return localStorage.getItem(AGENT_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

// Check if agent is logged in
export function isAgentLoggedIn() {
  return Boolean(getAgentToken());
}

// Get agent data
export function getAgentData() {
  try {
    const data = localStorage.getItem(AGENT_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Agent signup
export async function agentSignup(data) {
  const response = await apiRequest('/agent/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response;
}

// Agent login
export async function agentLogin(identifier, password) {
  const response = await apiRequest('/agent/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  });
  
  if (response.token) {
    localStorage.setItem(AGENT_TOKEN_KEY, response.token);
    localStorage.setItem(AGENT_DATA_KEY, JSON.stringify(response.agent));
  }
  
  return response;
}

// Agent logout
export function agentLogout() {
  try {
    localStorage.removeItem(AGENT_TOKEN_KEY);
    localStorage.removeItem(AGENT_DATA_KEY);
  } catch {}
}

// Get current agent
export async function getAgentMe() {
  const token = getAgentToken();
  const response = await apiRequest('/agent/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.agent;
}
