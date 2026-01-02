import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { networkById } from '../../shared/constants/networks';
import { formatCurrency, validatePhone } from '../../shared/utils/format';
import { fetchNetworkPrices } from '../../shared/api/packages';

const DATA_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 100];
const AGENT_ORDER_KEY = 'agent_current_order';

export default function Packages() {
  const { networkId } = useParams();
  const navigate = useNavigate();
  const network = networkById(networkId);

  const [selectedSize, setSelectedSize] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!network) return;

    setLoading(true);
    setError(null);

    fetchNetworkPrices(network.id, 'agent')
      .then((priceMap) => setPrices(priceMap || {}))
      .catch((err) => {
        console.error('Failed to fetch prices:', err);
        setError('Failed to load prices');
      })
      .finally(() => setLoading(false));
  }, [network?.id]);

  if (!network) {
    return (
      <div className="p-4">
        <div className="text-sm text-gray-700">Invalid network</div>
      </div>
    );
  }

  const selectedPackage = selectedSize ? prices[selectedSize] : null;
  const isOutOfStock = !loading && selectedSize && !selectedPackage;
  const canContinue = selectedPackage && validatePhone(recipient);

  const availablePrices = Object.values(prices).map(p => p.price).filter(Boolean);
  const priceRange = availablePrices.length > 0
    ? { min: Math.min(...availablePrices), max: Math.max(...availablePrices) }
    : { min: 0, max: 0 };

  const onContinue = () => {
    if (!canContinue) return;
    
    const order = {
      packageId: selectedPackage.packageCode,
      networkId: network.id,
      networkName: network.name,
      dataSize: selectedSize,
      recipient,
      price: selectedPackage.price,
    };
    
    localStorage.setItem(AGENT_ORDER_KEY, JSON.stringify(order));
    navigate('/a/checkout');
  };

  return (
    <div className="p-4">
      {/* Back & Network Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/a')} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${network.brandColor} text-black font-bold`}>
          {network.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{network.name}</h1>
          <p className="text-xs text-gray-500">Select a package</p>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      {!loading && availablePrices.length > 0 && (
        <div className="text-xs text-gray-600 mb-3">
          Price range: {formatCurrency(priceRange.min)} – {formatCurrency(priceRange.max)}
        </div>
      )}

      <div className="text-xs font-semibold text-gray-700 mb-2">DATA SIZE</div>

      {/* Packages grid - always visible */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {DATA_SIZES.map((size) => {
          const pkg = prices[size];
          const outOfStock = !loading && !pkg;

          return (
            <button
              key={size}
              onClick={() => !outOfStock && setSelectedSize(size)}
              disabled={outOfStock}
              className={`px-3 py-2 text-sm rounded-lg border text-center transition-colors ${
                outOfStock
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : selectedSize === size
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
              }`}
            >
              <div>{size}GB</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setSelectedSize(null)}
        className="text-sm text-gray-600 hover:underline mb-4"
      >
        Clear selection
      </button>

      {/* Price display */}
      <div className="mb-4">
        <div className="text-sm text-gray-700">Selected price</div>
        <div className="text-xl font-bold text-gray-900">
          {loading ? (
            <span className="text-gray-400">Loading...</span>
          ) : isOutOfStock ? (
            <span className="text-red-500">Out of stock</span>
          ) : selectedPackage ? (
            formatCurrency(selectedPackage.price)
          ) : (
            '—'
          )}
        </div>
      </div>

      {/* Recipient input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1">Recipient Number *</label>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="0XXXXXXXXX"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.replace(/\D/g, '').slice(0, 10))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-xs text-gray-500 mt-1">Must be 10 digits</div>
      </div>

      <button
        onClick={onContinue}
        disabled={!canContinue}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
