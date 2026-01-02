export default function PackageButton({ size, selected, disabled, outOfStock, onClick }) {
  const baseClass = "px-3 py-2 text-sm rounded-md border text-center transition-colors";
  
  let stateClass;
  if (outOfStock) {
    stateClass = "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed";
  } else if (selected) {
    stateClass = "border-gray-900 bg-gray-900 text-white";
  } else if (disabled) {
    stateClass = "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed";
  } else {
    stateClass = "border-gray-300 bg-white text-gray-700 hover:border-gray-400 cursor-pointer";
  }

  return (
    <button
      type="button"
      className={`${baseClass} ${stateClass}`}
      onClick={onClick}
      disabled={disabled || outOfStock}
    >
      <div>{size}GB</div>
      {/* {outOfStock && <div className="text-xs mt-0.5">N/A</div>} */}
    </button>
  );
}