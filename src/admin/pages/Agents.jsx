import { useEffect, useState } from 'react';
import { apiRequest } from '../../shared/api/client';

const TABS = [
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' }
];

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('approved');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/admin/agents', { auth: true });
      setAgents(data.items || []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleApprove = async (agentId) => {
    try {
      setActionLoading(agentId);
      await apiRequest(`/admin/agents/${agentId}/approve`, {
        method: 'PUT',
        auth: true
      });
      await fetchAgents();
    } catch (e) {
      alert('Failed to approve agent: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (agentId, agentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to reject "${agentName}"? This action cannot be undone easily.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(agentId);
      await apiRequest(`/admin/agents/${agentId}/reject`, {
        method: 'PUT',
        auth: true
      });
      await fetchAgents();
    } catch (e) {
      alert('Failed to reject agent: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (agentId, agentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${agentName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(agentId);
      await apiRequest(`/admin/agents/${agentId}`, {
        method: 'DELETE',
        auth: true
      });
      await fetchAgents();
    } catch (e) {
      alert('Failed to delete agent: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAgents = agents.filter(agent => agent.status === activeTab);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">Agents</h1>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">Agents</h1>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map(tab => {
          const count = agents.filter(a => a.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Agents List */}
      {filteredAgents.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">
          No {activeTab} agents found
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              activeTab={activeTab}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
              isLoading={actionLoading === agent.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent, activeTab, onApprove, onReject, onDelete, isLoading }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{agent.name}</h3>
          <p className="text-sm text-gray-500">{agent.phone}</p>
          {agent.email && (
            <p className="text-xs text-gray-400">{agent.email}</p>
          )}
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-500">Orders:</span>{' '}
          <span className="font-medium">{agent.orderCount || 0}</span>
        </div>
        <div>
          <span className="text-gray-500">Joined:</span>{' '}
          <span className="font-medium">
            {new Date(agent.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {activeTab === 'pending' && (
          <>
            <button
              onClick={() => onApprove(agent.id)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Approve'}
            </button>
            <button
              onClick={() => onReject(agent.id, agent.name)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Reject'}
            </button>
          </>
        )}

        {activeTab === 'approved' && (
          <button
            onClick={() => onReject(agent.id, agent.name)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 disabled:opacity-50"
          >
            {isLoading ? '...' : 'Revoke Access'}
          </button>
        )}

        {activeTab === 'rejected' && (
          <>
            <button
              onClick={() => onApprove(agent.id)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Approve'}
            </button>
            <button
              onClick={() => onDelete(agent.id, agent.name)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Delete'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
