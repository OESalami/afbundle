import { NETWORKS } from '../../shared/constants/networks'
import NetworkCard from '../components/NetworkCard'
import { Link } from 'react-router-dom'

export default function Networks() {
  return (
    <div className="max-w-md mx-auto p-4">
      {/* Hero */}
      <div className="border border-gray-200 rounded-md bg-white p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black font-bold">DB</div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Buy Data Bundles</h1>
            <p className="text-xs text-gray-600">Fast, simple, and secure. No frills.</p>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-700">
          1) Select a network  2) Choose a package  3) Checkout
        </div>
        <div className="mt-3">
          <Link to="/orders" className="text-sm text-gray-800 underline">Track your orders</Link>
        </div>
      </div>

      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-900">Select Network</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {NETWORKS.map((n) => (
          <NetworkCard key={n.id} network={n} />
        ))}
      </div>
    </div>
  );
}