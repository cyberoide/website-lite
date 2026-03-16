import { Globe, LinkIcon } from "lucide-react";
import { CustomDomainInput } from "./CustomDomainInput";
import { DnsInstructions } from "./DnsInstructions";
import { DnsVerificationPanel } from "./DnsVerificationPanel";
import { CloudflareStatusPanel } from "./CloudflareStatusPanel";
import { TestLinksCard } from "./TestLinksCard";

export function DomainSection({
  // suggestedSubdomain is intentionally not used here anymore; it's shown in the left column
  customDomainInput,
  onInputChange,
  onSave,
  onActivate,
  onRefresh,
  onVerify,
  isSaving,
  isActivating,
  isRefreshing,
  isVerifying,
  normalizedDomain,
  hasCustomDomain,
  customDomain,
  wwwCnameRows,
  apexRows,
  dnsStatus,
  cloudflareHosts,
  ownershipTxtRows,
  certificateTxtRows,
  isCloudflareLoading,
  cloudflareError,
}) {
  const liveApex = dnsStatus?.checks?.http?.apex;
  const liveWww = dnsStatus?.checks?.http?.www;

  const has525 = liveApex?.status === 525 || liveWww?.status === 525;
  const hasDeploymentNotFound =
    liveApex?.vercelError === "DEPLOYMENT_NOT_FOUND" ||
    liveWww?.vercelError === "DEPLOYMENT_NOT_FOUND";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="font-bold text-[#111418] flex items-center gap-2">
        <Globe className="w-5 h-5" />
        Domain + DNS
      </div>
      <div className="text-sm text-gray-500 mt-1">
        Connect your club’s custom domain. We’ll tell you exactly what DNS
        records to add, and verify when it’s live.
      </div>

      <div className="mt-5">
        <div className="font-bold text-[#111418] flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Connect your domain
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Example: <span className="font-mono">exampleyachtclub.com</span>.
          We’ll support both the <span className="font-mono">apex</span> and
          <span className="font-mono"> www</span>.
        </div>

        <CustomDomainInput
          customDomainInput={customDomainInput}
          onInputChange={onInputChange}
          onSave={onSave}
          onActivate={onActivate}
          onRefresh={onRefresh}
          isSaving={isSaving}
          isActivating={isActivating}
          isRefreshing={isRefreshing}
          normalizedDomain={normalizedDomain}
          hasCustomDomain={hasCustomDomain}
        />

        <DnsInstructions
          normalizedDomain={normalizedDomain}
          wwwCnameRows={wwwCnameRows}
          apexRows={apexRows}
        />

        <DnsVerificationPanel
          dnsStatus={dnsStatus}
          onVerify={onVerify}
          isVerifying={isVerifying}
          hasCustomDomain={hasCustomDomain}
        />

        {(has525 || hasDeploymentNotFound) && (
          <details className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-[#111418]">
              Troubleshooting
            </summary>
            <div className="mt-3 text-sm text-gray-600 space-y-3">
              {has525 ? (
                <div>
                  <div className="font-semibold text-gray-800">Error 525</div>
                  <div className="mt-1">
                    Cloudflare is having trouble reaching the origin over SSL.
                    This is usually a Cloudflare-for-SaaS fallback origin /
                    origin SSL setup issue.
                  </div>
                </div>
              ) : null}

              {hasDeploymentNotFound ? (
                <div>
                  <div className="font-semibold text-gray-800">
                    Vercel: DEPLOYMENT_NOT_FOUND
                  </div>
                  <div className="mt-1">
                    This means the request reached Vercel, but Vercel does not
                    recognize the custom domain as a valid deployment hostname.
                  </div>
                  <div className="mt-2">
                    Fix: create a Cloudflare Worker on your
                    <span className="font-mono"> clubsoft.site</span> zone, then
                    add a route of <span className="font-mono">*/*</span> (not
                    <span className="font-mono"> *.clubsoft.site/*</span>) so it
                    also runs for custom domains like
                    <span className="font-mono"> rivryachtclub.com</span>.
                  </div>
                </div>
              ) : null}
            </div>
          </details>
        )}

        <CloudflareStatusPanel
          cloudflareHosts={cloudflareHosts}
          ownershipTxtRows={ownershipTxtRows}
          certificateTxtRows={certificateTxtRows}
          isLoading={isCloudflareLoading}
          error={cloudflareError}
        />

        <TestLinksCard customDomain={customDomain} />
      </div>
    </div>
  );
}
