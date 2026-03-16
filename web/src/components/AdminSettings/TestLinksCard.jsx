import { ExternalLink } from "lucide-react";

export function TestLinksCard({ customDomain }) {
  if (!customDomain) return null;

  const openCustomDomainLink = `https://${customDomain}`;
  const openWwwDomainLink = `https://www.${customDomain}`;

  return (
    <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 p-4">
      <div className="text-xs font-bold text-gray-400 uppercase">
        Test links (after DNS updates)
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <a
          href={openCustomDomainLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:underline"
        >
          {customDomain} <ExternalLink className="w-4 h-4" />
        </a>
        <a
          href={openWwwDomainLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:underline"
        >
          www.{customDomain} <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
