export function ClubSoftAddressCard({ suggestedSubdomain, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-gray-50 border border-gray-100 p-4 ${className}`}
    >
      <div className="text-xs font-bold text-gray-400 uppercase">
        Your ClubSoft address
      </div>
      <div className="mt-2 font-mono text-sm break-all text-gray-800">
        {suggestedSubdomain || "—"}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        This always works and requires no DNS changes.
      </div>
    </div>
  );
}
