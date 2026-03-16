import { AlertTriangle } from "lucide-react";
import { StatusPill } from "./StatusPill";
import { DnsRow } from "./DnsRow";

export function CloudflareStatusPanel({
  cloudflareHosts,
  ownershipTxtRows,
  certificateTxtRows,
  isLoading,
  error,
}) {
  const hasOwnership =
    Array.isArray(ownershipTxtRows) && ownershipTxtRows.length > 0;
  const hasCert =
    Array.isArray(certificateTxtRows) && certificateTxtRows.length > 0;

  return (
    <div className="mt-5 rounded-2xl bg-gray-50 border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold text-[#111418]">Cloudflare status</div>
          <div className="text-sm text-gray-500 mt-1">
            If you see "pending", Cloudflare is waiting for DNS validation.
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-3 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <div>
            {error instanceof Error
              ? error.message
              : "Could not load Cloudflare status"}
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-3 text-sm text-gray-500">Loading…</div>
      ) : cloudflareHosts.length === 0 ? (
        <div className="mt-3 text-sm text-gray-500">
          Click <span className="font-semibold">Activate domain</span> to
          provision SSL for your domain in Cloudflare.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {cloudflareHosts.map((h) => (
            <div
              key={h.hostname}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-mono text-sm text-gray-800 truncate">
                  {h.hostname}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  id: {h.id || "—"}
                </div>
              </div>
              <StatusPill status={h.status} />
            </div>
          ))}

          {hasOwnership ? (
            <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-4">
              <div className="text-xs font-bold text-gray-400 uppercase">
                Ownership verification (TXT)
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Add these TXT records to prove you own the domain.
              </div>
              <div className="mt-3">
                {ownershipTxtRows.map((row) => (
                  <DnsRow
                    key={`${row.type}-${row.name}-${row.value}`}
                    type={row.type}
                    name={row.name}
                    value={row.value}
                    note={row.note}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {hasCert ? (
            <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-4">
              <div className="text-xs font-bold text-gray-400 uppercase">
                Certificate validation (TXT)
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Add these TXT records so Cloudflare can issue the SSL
                certificate. These often look like{" "}
                <span className="font-mono">_acme-challenge</span>.
              </div>
              <div className="mt-3">
                {certificateTxtRows.map((row) => (
                  <DnsRow
                    key={`${row.type}-${row.name}-${row.value}`}
                    type={row.type}
                    name={row.name}
                    value={row.value}
                    note={row.note}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {!hasOwnership && !hasCert ? (
            <div className="mt-4 rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-900">
              No TXT records needed right now.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
