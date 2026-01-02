export const NETWORKS = [
  { id: 'mtn', name: 'MTN', brandColor: 'bg-yellow-400', textColor: 'text-yellow-700' },
  { id: 'airteltigo', name: 'AirtelTigo', brandColor: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'telecel', name: 'Telecel', brandColor: 'bg-red-500', textColor: 'text-red-700' },
];

export const networkById = (id) => NETWORKS.find((n) => n.id === id);