import { DnsRow } from "./DnsRow";

export function DnsInstructions({ normalizedDomain, wwwCnameRows, apexRows }) {
  return (
    <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
      <div className="text-sm text-blue-900">
        <div className="font-bold">DNS setup</div>
        <div className="mt-1 text-sm text-blue-900/80">
          Copy/paste these records into your domain provider.
        </div>

        {normalizedDomain ? (
          <div className="mt-3 rounded-2xl bg-white/70 border border-blue-100 p-4">
            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-sm text-blue-900/80">
              <div className="font-bold text-blue-900">Quick steps</div>
              <ol className="mt-2 list-decimal pl-5 space-y-1">
                <li>
                  Add the <span className="font-mono">www</span> CNAME (below).
                </li>
                <li>
                  Make <span className="font-mono">{normalizedDomain}</span>{" "}
                  work too (pick Option A or B).
                </li>
                <li>
                  Wait a few minutes, then click{" "}
                  <span className="font-semibold">Run DNS check</span>.
                </li>
              </ol>
              <div className="mt-2 text-xs text-blue-900/70">
                If your DNS provider is Cloudflare, set these records to{" "}
                <span className="font-semibold">DNS only</span> (grey cloud).
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs font-bold text-blue-900/70 uppercase">
                1) WWW record
              </div>
              <div className="mt-2">
                {wwwCnameRows.map((row) => (
                  <DnsRow
                    key={`${row.type}-${row.name}`}
                    type={row.type}
                    name={row.name}
                    value={row.value}
                    note={row.note}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs font-bold text-blue-900/70 uppercase">
                2) Apex (domain.com)
              </div>

              <div className="mt-2 rounded-2xl bg-white border border-blue-100 p-4">
                <div className="text-sm font-bold text-blue-900">
                  Option A (recommended)
                </div>
                <div className="mt-1 text-sm text-blue-900/80">
                  Turn on a redirect in your registrar/DNS provider so
                  <span className="font-mono"> {normalizedDomain}</span>{" "}
                  redirects to
                  <span className="font-mono"> www.{normalizedDomain}</span>.
                </div>
                <div className="mt-2 text-xs text-blue-900/70">
                  Look for “URL forwarding”, “redirect”, or “domain forwarding”.
                </div>
              </div>

              <details className="mt-3 rounded-2xl bg-white border border-blue-100 p-4">
                <summary className="cursor-pointer text-sm font-bold text-blue-900">
                  Option B (advanced): add an apex DNS record
                </summary>
                <div className="mt-2 text-sm text-blue-900/80">
                  If your provider supports an apex alias record (often called
                  <span className="font-mono"> ALIAS</span> or
                  <span className="font-mono"> ANAME</span>), you can point
                  <span className="font-mono"> @</span> to
                  <span className="font-mono whitespace-nowrap">
                    {" "}
                    clubsoft.site
                  </span>
                  .
                </div>
                <div className="mt-3">
                  {apexRows.map((row) => (
                    <DnsRow
                      key={`${row.type}-${row.name}`}
                      type={row.type}
                      name={row.name}
                      value={row.value}
                      note={row.note}
                    />
                  ))}
                </div>
              </details>
            </div>

            <div className="mt-4 text-xs text-blue-900/70">
              DNS changes usually take a few minutes, but sometimes longer.
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm text-blue-900/80">
            Save a domain above to see the exact DNS records.
          </div>
        )}
      </div>
    </div>
  );
}
