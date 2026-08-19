export default function Spinner({ size = 22, className = "" }) {
  return (
    <svg
      className={`animate-spin text-gray-300 ${className}`}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-gray-900"
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex justify-center items-center h-[70vh]">
      <Spinner size={26} />
    </div>
  );
}
