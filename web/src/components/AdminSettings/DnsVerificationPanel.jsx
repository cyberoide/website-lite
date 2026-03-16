import { CheckCircle } from "lucide-react";
import { HttpStatusRow } from "./HttpStatusRow";

export function DnsVerificationPanel({
  dnsStatus,
  onVerify,
  isVerifying,
  hasCustomDomain,
}) {
  const notes = Array.isArray(dnsStatus?.notes) ? dnsStatus.notes : [];
  const hasNotes = notes.length > 0;

  const apexHttp = dnsStatus?.checks?.http?.apex;
  const wwwHttp = dnsStatus?.checks?.http?.www;

  const has525 = apexHttp?.status === 525 || wwwHttp?.status === 525;
  const hasDeploymentNotFound =
    apexHttp?.vercelError === "DEPLOYMENT_NOT_FOUND" ||
    wwwHttp?.vercelError === "DEPLOYMENT_NOT_FOUND";

  return (
    <div className="mt-5 rounded-2xl bg-gray-50 border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold text-[#111418]">DNS check</div>
          <div className="text-sm text-gray-500 mt-1">
            We’ll check DNS + a live HTTPS request and tell you what’s still
            missing.
          </div>
        </div>
        <button
          type="button"
          onClick={onVerify}
          disabled={!hasCustomDomain || isVerifying}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
        >
          <CheckCircle className="w-4 h-4" />
          {isVerifying ? "Checking…" : "Run DNS check"}
        </button>
      </div>

      {dnsStatus ? (
        <div className="mt-4">
          {hasNotes ? (
            <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-4 text-sm text-yellow-900">
              <div className="font-bold mb-1">What we found</div>
              <ul className="list-disc pl-5 space-y-1">
                {notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-900">
              Looks good from here.
            </div>
          )}

          {dnsStatus?.checks?.http ? (
            <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-4">
              <div className="text-xs font-bold text-gray-400 uppercase">
                Live HTTPS check
              </div>
              <div className="mt-2 text-sm text-gray-500">
                This is what a browser would see right now.
              </div>

              <div className="mt-3 divide-y divide-gray-100">
                <HttpStatusRow
                  label="apex"
                  result={dnsStatus.checks.http.apex}
                />
                <HttpStatusRow label="www" result={dnsStatus.checks.http.www} />
              </div>

              {has525 && (
                <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-800">
                  Cloudflare is returning <span className="font-bold">525</span>
                  . That means Cloudflare can’t complete SSL to the origin.
                </div>
              )}

              {hasDeploymentNotFound && (
                <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-800">
                  We’re seeing{" "}
                  <span className="font-bold">DEPLOYMENT_NOT_FOUND</span> from
                  Vercel.
                  <div className="mt-2 text-red-800/90">
                    In Cloudflare SSL for SaaS setups, this usually means your
                    custom domain request is still hitting Vercel directly. The
                    reliable fix is a Cloudflare Worker route of{" "}
                    <span className="font-mono">*/*</span> on your{" "}
                    <span className="font-mono">clubsoft.site</span> zone,
                    proxying to{" "}
                    <span className="font-mono">www.clubsoft.site</span>.
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <details className="mt-4 rounded-2xl bg-white border border-gray-100 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">
              View observed DNS records
            </summary>

            <div className="mt-3">
              <div className="text-xs font-bold text-gray-500 uppercase">
                www
              </div>
              <div className="mt-1 text-sm text-gray-700">
                CNAME:{" "}
                {dnsStatus?.records?.www?.cname?.length
                  ? dnsStatus.records.www.cname.join(", ")
                  : "—"}
              </div>
              <div className="mt-1 text-sm text-gray-700">
                A:{" "}
                {dnsStatus?.records?.www?.a?.length
                  ? dnsStatus.records.www.a.join(", ")
                  : "—"}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-bold text-gray-500 uppercase">
                apex
              </div>
              <div className="mt-1 text-sm text-gray-700">
                CNAME:{" "}
                {dnsStatus?.records?.apex?.cname?.length
                  ? dnsStatus.records.apex.cname.join(", ")
                  : "—"}
              </div>
              <div className="mt-1 text-sm text-gray-700">
                A:{" "}
                {dnsStatus?.records?.apex?.a?.length
                  ? dnsStatus.records.apex.a.join(", ")
                  : "—"}
              </div>
            </div>

            {Array.isArray(dnsStatus?.checks?.txt) &&
            dnsStatus.checks.txt.length > 0 ? (
              <div className="mt-5">
                <div className="text-xs font-bold text-gray-500 uppercase">
                  TXT verification
                </div>
                <div className="mt-2 space-y-3">
                  {dnsStatus.checks.txt.map((t) => (
                    <div
                      key={`${t.hostname}-${t.name}`}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="text-sm font-mono text-gray-800 break-all">
                        {t.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        for {t.hostname}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        Status: {t.ok ? "OK" : "Missing"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </details>
        </div>
      ) : null}
    </div>
  );
}
