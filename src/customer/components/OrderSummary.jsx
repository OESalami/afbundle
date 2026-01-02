import { formatCurrency } from '../../shared/utils/format'

export default function OrderSummary({ order }) {
  const { networkName, dataSize, recipient, price } = order || {};
  return (
    <div className="border border-gray-200 rounded-md bg-white p-4">
      <div className="text-sm font-semibold text-gray-900 mb-2">Order Summary</div>
      <div className="text-sm text-gray-700">
        <div className="flex justify-between py-1">
          <span>Network</span>
          <span>{networkName}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Data size</span>
          <span>{dataSize}GB</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Recipient</span>
          <span>{recipient}</span>
        </div>
        <div className="flex justify-between py-1 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(price)}</span>
        </div>
      </div>
    </div>
  );
}