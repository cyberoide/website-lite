import { useState, useEffect, useMemo } from "react";
import { normalizeDomainInput } from "@/utils/domainHelpers";

export function useSettingsState(website, cloudflareData) {
  const [customDomainInput, setCustomDomainInput] = useState("");

  useEffect(() => {
    const existing =
      typeof website?.custom_domain === "string" ? website.custom_domain : "";
    setCustomDomainInput(existing);
  }, [website?.custom_domain]);

  const normalizedDomain = useMemo(() => {
    return normalizeDomainInput(customDomainInput);
  }, [customDomainInput]);

  const dnsTarget = "clubsoft.site";

  const wwwCnameRows = useMemo(() => {
    if (!normalizedDomain) return [];
    return [
      {
        type: "CNAME",
        name: "www",
        value: dnsTarget,
        note: "If you use Cloudflare for your domain, set this record to DNS-only (grey cloud), not Proxied.",
      },
    ];
  }, [normalizedDomain]);

  const apexRows = useMemo(() => {
    if (!normalizedDomain) return [];
    return [
      {
        type: "CNAME",
        name: "@",
        value: dnsTarget,
        note: "If you use Cloudflare for your domain, set this record to DNS-only (grey cloud), not Proxied.",
      },
    ];
  }, [normalizedDomain]);

  const cloudflareHosts = useMemo(() => {
    const hosts = cloudflareData?.cloudflare?.hosts;
    if (!hosts || typeof hosts !== "object") return [];

    const entries = Object.keys(hosts).map((k) => ({
      hostname: k,
      ...hosts[k],
    }));

    entries.sort((a, b) => a.hostname.localeCompare(b.hostname));
    return entries;
  }, [cloudflareData?.cloudflare?.hosts]);

  const ownershipTxtRows = useMemo(() => {
    const rows = [];
    for (const host of cloudflareHosts) {
      const v = host?.verification;
      if (v?.type === "txt" || v?.type === "TXT") {
        rows.push({
          type: "TXT",
          name: v.name,
          value: v.value,
          note: `Ownership verification for ${host.hostname}.`,
        });
      }
    }
    return rows;
  }, [cloudflareHosts]);

  const certificateTxtRows = useMemo(() => {
    const rows = [];
    for (const host of cloudflareHosts) {
      const records = host?.sslValidationRecords;
      if (!Array.isArray(records)) continue;
      for (const r of records) {
        if (!r?.name || !r?.value) continue;
        rows.push({
          type: "TXT",
          name: r.name,
          value: r.value,
          note: `Certificate validation (ACME) for ${host.hostname}.`,
        });
      }
    }
    return rows;
  }, [cloudflareHosts]);

  // Backwards compatible: a combined list some UI still uses.
  const txtVerificationRows = useMemo(() => {
    return [...ownershipTxtRows, ...certificateTxtRows];
  }, [ownershipTxtRows, certificateTxtRows]);

  const previewHref = useMemo(() => {
    const slug = website?.club_slug;
    if (!slug) return null;
    return `/s/${slug}?preview=1`;
  }, [website?.club_slug]);

  const suggestedSubdomain = useMemo(() => {
    const slug = website?.club_slug;
    if (!slug) return null;
    return `${slug}.clubsoft.site`;
  }, [website?.club_slug]);

  return {
    customDomainInput,
    setCustomDomainInput,
    normalizedDomain,
    wwwCnameRows,
    apexRows,
    cloudflareHosts,
    ownershipTxtRows,
    certificateTxtRows,
    txtVerificationRows,
    previewHref,
    suggestedSubdomain,
  };
}
