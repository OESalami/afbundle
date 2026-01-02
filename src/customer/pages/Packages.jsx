import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PackageButton from '../components/PackageButton';
import Button from '../../shared/components/Button';
import { networkById } from '../../shared/constants/networks';
import { formatCurrency, validatePhone } from '../../shared/utils/format';
import { setCurrentOrder } from '../../shared/utils/storage';
import { fetchNetworkPrices } from '../../shared/api/packages';

// Hardcoded data sizes (like a menu)
const DATA_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 100];

export default function Packages() {
  const { networkId } = useParams();
  const navigate = useNavigate();
  const network = networkById(networkId);
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [prices, setPrices] = useState({}); // { sizeGb: { price, packageCode } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch prices from database
  useEffect(() => {
    if (!network) return;
    
    setLoading(true);
    setError(null);
    
    fetchNetworkPrices(network.id)
      .then((priceMap) => {
        setPrices(priceMap || {});
      })
      .catch((err) => {
        console.error('Failed to fetch prices:', err);
        setError('Failed to load prices');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [network?.id]);

  if (!network) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Header breadcrumb={["Home", "Customers"]} title="Invalid network" />
      </div>
    );
  }

  // Get price for selected size
  const selectedPackage = selectedSize ? prices[selectedSize] : null;
  const isOutOfStock = selectedSize && !selectedPackage;
  const canContinue = selectedPackage && validatePhone(recipient);

  // Calculate price range from available packages
  const availablePrices = Object.values(prices).map(p => p.price).filter(Boolean);
  const priceRange = availablePrices.length > 0 
    ? { min: Math.min(...availablePrices), max: Math.max(...availablePrices) }
    : { min: 0, max: 0 };

  const onContinue = () => {
    if (!canContinue) return;
    setCurrentOrder({
      packageId: selectedPackage.packageCode,  // e.g., 'mtn_5'
      networkId: network.id,
      networkName: network.name,
      dataSize: selectedSize,
      recipient,
      price: selectedPackage.price,
    });
    navigate('/checkout');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Top logo */}
      <div className="flex items-center justify-center mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${network.brandColor} text-black font-bold`}>
          {network.name.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Breadcrumb and Title */}
      <Header
        breadcrumb={["Home", "Customers", network.name]}
        title={`${network.name} (C)`}
      />

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 mb-2">{error}</div>
      )}

      {/* Price range */}
      {!loading && availablePrices.length > 0 && (
        <div className="text-xs text-gray-600 mb-2">
          Price range: {formatCurrency(priceRange.min)} – {formatCurrency(priceRange.max)}
        </div>
      )}

      {/* Label */}
      <div className="text-xs font-semibold text-gray-700 mb-2">DATA SIZE</div>

      {/* Packages grid - always visible */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {DATA_SIZES.map((size) => {
          const pkg = prices[size];
          const outOfStock = !loading && !pkg;
          
          return (
            <PackageButton
              key={size}
              size={size}
              selected={selectedSize === size}
              disabled={outOfStock}
              outOfStock={outOfStock}
              onClick={() => !outOfStock && setSelectedSize(size)}
            />
          );
        })}
      </div>

      {/* Clear selection */}
      <div className="mb-3">
        <Button variant="default" onClick={() => setSelectedSize(null)}>Clear</Button>
      </div>

      {/* Price display */}
      <div className="mb-3">
        <div className="text-sm text-gray-700">Selected price</div>
        <div className="text-lg font-semibold text-gray-900">
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
      <label className="block text-sm text-gray-700 mb-1" htmlFor="recipient">Number *</label>
      <input
        id="recipient"
        type="tel"
        inputMode="numeric"
        placeholder="Enter receiver's number"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value.replace(/\D/g, '').slice(0, 10))}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
      />
      <div className="text-xs text-gray-600 mb-4">Must be 10 digits</div>

      {/* Continue button */}
      <Button variant="primary" onClick={onContinue} disabled={!canContinue}>
        Continue
      </Button>
    </div>
  );
}