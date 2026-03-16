export function StatusPill({ status }) {
  const s = typeof status === "string" ? status.toLowerCase() : "";
  const isActive = s === "active";
  const isPending = s === "pending";

  const className = isActive
    ? "bg-green-100 text-green-800 border-green-200"
    : isPending
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  const label = status || "—";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${className}`}
    >
      {label}
    </span>
  );
}
