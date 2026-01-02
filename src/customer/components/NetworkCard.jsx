import { useNavigate } from 'react-router-dom'

export default function NetworkCard({ network }) {
  const navigate = useNavigate();
  const { id, name, brandColor } = network;

  return (
    <button
      onClick={() => navigate(`/network/${id}`)}
      className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-md bg-white hover:bg-gray-50"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${brandColor} text-black font-bold`}> 
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="text-left">
        <div className="text-sm font-semibold text-gray-900">{name}</div>
      </div>
    </button>
  );
}