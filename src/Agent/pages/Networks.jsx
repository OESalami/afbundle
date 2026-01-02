import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NETWORKS } from '../../shared/constants/networks';
import { getAgentData, getAgentMe } from '../../shared/api/agent';

export default function Networks() {
  const [agentData, setAgentData] = useState(getAgentData());
  const [loading, setLoading] = useState(true);

  // Fetch fresh agent data on mount
  useEffect(() => {
    const refreshAgentData = async () => {
      try {
        const freshAgent = await getAgentMe();
        setAgentData(freshAgent);
        // Update localStorage with fresh data
        localStorage.setItem('agent_data', JSON.stringify(freshAgent));
      } catch (e) {
        console.error('Failed to refresh agent data:', e);
      } finally {
        setLoading(false);
      }
    };
    refreshAgentData();
  }, []);

  const isApproved = agentData?.status === 'approved';


  return (
    <div className="p-4">
      {/* Welcome Card */}
      <div className="border border-blue-200 rounded-lg bg-blue-50 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {agentData?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Welcome, {agentData?.name || 'Agent'}</h1>
            <p className="text-xs text-gray-600">Buy data at discounted prices</p>
          </div>
        </div>
        {isApproved && (
          <>
            <div className="mt-3 text-xs text-gray-700">
              1) Select a network → 2) Choose a package → 3) Checkout
            </div>
            <div className="mt-3">
              <Link to="/a/orders" className="text-sm text-blue-600 hover:underline">
                View your orders →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Pending Approval Banner */}
      {!isApproved && (
        <div className="border border-yellow-300 rounded-lg bg-yellow-50 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Pending Approval</h2>
          <p className="text-sm text-yellow-700 mb-3">
            Your agent account is currently under review. Our team will verify your details shortly.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-yellow-800">Estimated wait: 10-30 minutes</span>
          </div>
          <p className="text-xs text-yellow-600 mt-4">
            You'll be able to purchase data bundles once approved. Check back soon!
          </p>
        </div>
      )}

      {/* Network Selection - Only show when approved */}
      {isApproved && (
        <>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Select Network</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {NETWORKS.map((network) => (
              <NetworkCard key={network.id} network={network} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NetworkCard({ network }) {
  const navigate = useNavigate();
  const { id, name, brandColor } = network;

  return (
    <button
      onClick={() => navigate(`/a/network/${id}`)}
      className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${brandColor} text-black font-bold`}>
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="text-left">
        <div className="text-sm font-semibold text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">Agent pricing</div>
      </div>
      <div className="ml-auto">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
