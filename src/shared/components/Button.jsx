export default function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  className = '',
}) {
  const base =
    'px-4 py-2 border rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500',
    default: 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </button>
  );
}