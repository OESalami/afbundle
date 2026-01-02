export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="text-center text-sm text-gray-600 p-4">{label}</div>
  );
}