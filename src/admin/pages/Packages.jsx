import { useEffect, useState } from 'react';
import { fetchNetworkPackages, createPackage, updatePackage, deletePackage } from '../../shared/api/packages';

const networks = [
  { id: 'mtn', name: 'MTN' },
  { id: 'airteltigo', name: 'AirtelTigo' },
  { id: 'telecel', name: 'Telecel' },
];

export default function AdminPackages({ packageType = 'customer' }) {
  const [network, setNetwork] = useState(networks[0].id);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ sizeGb: '', price: '' });

  const isAgent = packageType === 'agent';
  const title = isAgent ? 'Agent Packages' : 'Customer Packages';

  async function load() {
    setError('');
    setLoading(true);
    try {
      const res = await fetchNetworkPackages(network, packageType);
      setItems(res || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [network, packageType]);

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!form.sizeGb || !form.price) {
      setError('Size and price are required');
      return;
    }
    try {
      await createPackage({ 
        networkId: network, 
        sizeGb: Number(form.sizeGb), 
        price: Number(form.price),
        type: packageType
      });
      setForm({ sizeGb: '', price: '' });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function onUpdate(item, field, value) {
    try {
      await updatePackage(item._id, { [field]: value });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function onToggleActive(item) {
    await onUpdate(item, 'active', !item.active);
  }

  async function onDelete(id) {
    if (!confirm('Delete this package?')) return;
    try {
      await deletePackage(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">{title}</h1>
      
      {/* Type indicator */}
      {isAgent && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Managing agent packages (discounted pricing for agents)
        </div>
      )}
      
      {/* Network Tabs */}
      <div className="flex gap-2 mb-3">
        {networks.map((n) => (
          <button 
            key={n.id} 
            className={`px-3 py-1.5 text-xs rounded border ${
              network === n.id 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`} 
            onClick={() => setNetwork(n.id)}
          >
            {n.name}
          </button>
        ))}
      </div>

      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      {/* Add Package Form */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs font-medium text-gray-700 mb-2">Add New Package</div>
        <form onSubmit={onCreate} className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Size (GB)</label>
            <input 
              type="number" 
              min="1" 
              className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm" 
              value={form.sizeGb} 
              onChange={(e) => onChange('sizeGb', e.target.value)} 
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Price (₵)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0"
              className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm" 
              value={form.price} 
              onChange={(e) => onChange('price', e.target.value)} 
              placeholder="20.00"
            />
          </div>
          <button 
            type="submit" 
            className="px-3 py-1.5 text-xs rounded bg-gray-900 text-white hover:bg-gray-800"
          >
            Add
          </button>
        </form>
      </div>

      {/* Packages List */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">No packages for this network.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <PackageCard 
              key={item._id} 
              item={item} 
              onUpdate={onUpdate}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PackageCard({ item, onUpdate, onToggleActive, onDelete }) {
  const [price, setPrice] = useState(item.price);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    if (Number(price) !== item.price) {
      onUpdate(item, 'price', Number(price));
    }
    setEditing(false);
  };

  return (
    <div className={`border rounded-lg bg-white p-3 ${!item.active ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{item.sizeGb}GB</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              item.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {item.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{item.packageCode}</div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <input 
                type="number" 
                step="0.01" 
                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                autoFocus
              />
              <button 
                className="text-xs px-2 py-1 rounded border border-green-300 text-green-700 hover:bg-green-50"
                onClick={handleSave}
              >
                Save
              </button>
              <button 
                className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => { setPrice(item.price); setEditing(false); }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-gray-900">₵{Number(item.price).toFixed(2)}</span>
              <button 
                className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button 
                className={`text-xs px-2 py-1 rounded border ${
                  item.active 
                    ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' 
                    : 'border-green-300 text-green-700 hover:bg-green-50'
                }`}
                onClick={() => onToggleActive(item)}
              >
                {item.active ? 'Disable' : 'Enable'}
              </button>
              <button 
                className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => onDelete(item._id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}