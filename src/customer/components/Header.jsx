export default function Header({ breadcrumb = [], title = '' }) {
  return (
    <div className="mb-4">
      <div className="text-xs text-gray-500">
        {breadcrumb.join(' / ')}
      </div>
      {title ? (
        <h1 className="mt-1 text-lg font-semibold text-gray-900">{title}</h1>
      ) : null}
    </div>
  );
}