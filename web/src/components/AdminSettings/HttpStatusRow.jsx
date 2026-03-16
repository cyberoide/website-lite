export function HttpStatusRow({ label, result }) {
  const statusText = result?.status != null ? `${result.status}` : "—";

  const extraLine = result?.vercelError
    ? `Vercel: ${result.vercelError}`
    : result?.snippet
      ? result.snippet
      : null;

  const pillClass = result?.ok
    ? "bg-green-100 text-green-800 border-green-200"
    : result?.status === 525 || result?.status === 526
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200";

  const pillLabel = result?.ok
    ? "OK"
    : result?.status === 525
      ? "525"
      : result?.status === 526
        ? "526"
        : "Issue";

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="text-xs font-bold text-gray-500 uppercase">{label}</div>
        <div className="mt-1 font-mono text-sm text-gray-800 break-all">
          {statusText}
        </div>
        {extraLine ? (
          <div className="mt-1 text-xs text-gray-600 break-words">
            {extraLine}
          </div>
        ) : null}
        {result?.cfRay ? (
          <div className="mt-1 text-xs text-gray-500">
            cf-ray: {result.cfRay}
          </div>
        ) : null}
      </div>
      <span
        className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${pillClass}`}
      >
        {pillLabel}
      </span>
    </div>
  );
}
