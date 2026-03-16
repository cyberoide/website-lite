"use client";

import React, { useMemo } from "react";
import { ArrowLeft } from "lucide-react";

import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";
import { useSettingsData } from "@/hooks/useSettingsData";
import { useSettingsMutations } from "@/hooks/useSettingsMutations";
import { useSettingsState } from "@/hooks/useSettingsState";
import { normalizeDomainInput } from "@/utils/domainHelpers";
import { PreviewSection } from "@/components/AdminSettings/PreviewSection";
import { DomainSection } from "@/components/AdminSettings/DomainSection";
import { ClubSoftAddressCard } from "@/components/AdminSettings/ClubSoftAddressCard";

export default function AdminSettingsPage() {
  const { session, isClubSoftAdmin } = useWebsiteLiteSession();
  const clubId = session?.club_id;

  const {
    website,
    isLoading,
    error,
    cloudflareData,
    isCloudflareLoading,
    cloudflareError,
  } = useSettingsData(clubId);

  const {
    saveDomainMutation,
    activateDomainMutation,
    refreshStatusMutation,
    dnsVerifyMutation,
  } = useSettingsMutations(clubId);

  const {
    customDomainInput,
    setCustomDomainInput,
    normalizedDomain,
    wwwCnameRows,
    apexRows,
    cloudflareHosts,
    ownershipTxtRows,
    certificateTxtRows,
    previewHref,
    suggestedSubdomain,
  } = useSettingsState(website, cloudflareData);

  const dnsStatus = dnsVerifyMutation.data;

  const showError = useMemo(() => {
    if (!error) return null;
    if (error instanceof Error) return error.message;
    return "Could not load settings";
  }, [error]);

  const handleSaveDomain = () => {
    const toSave = normalizeDomainInput(customDomainInput);
    saveDomainMutation.mutate({ clubId, customDomain: toSave });
  };

  const handleActivateDomain = () => {
    activateDomainMutation.mutate({ normalizedDomain });
  };

  const handleRefreshStatus = () => {
    refreshStatusMutation.mutate();
  };

  const handleVerifyDns = () => {
    dnsVerifyMutation.mutate();
  };

  if (!clubId) {
    // Distinguish between unauthenticated and "needs club selection"
    if (session && isClubSoftAdmin) {
      return (
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="font-extrabold text-[#111418]">Select a club</div>
            <div className="mt-2 text-sm text-gray-600">
              You’re signed in, but there’s no club selected yet. Pick one from
              the <span className="font-semibold">Editing club</span> dropdown
              in the left menu.
            </div>
            <a
              href="/admin/clubs"
              className="inline-flex mt-4 items-center justify-center px-4 py-2 rounded-2xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC]"
            >
              Go to Clubs
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-600">
          Sign in required.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (showError) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <a
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
        <div className="mt-6 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-800">
          {showError}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div>
        <a
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
        <h1 className="text-3xl font-extrabold text-[#111418] mt-3">
          Settings
        </h1>
        <p className="text-gray-500 mt-2">Preview links and domains.</p>
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-8">
        {/* Left column: preview + ClubSoft address */}
        <div className="space-y-8">
          <PreviewSection previewHref={previewHref} />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <ClubSoftAddressCard suggestedSubdomain={suggestedSubdomain} />
          </div>
        </div>

        {/* Right column: DNS + custom domain */}
        <DomainSection
          customDomainInput={customDomainInput}
          onInputChange={setCustomDomainInput}
          onSave={handleSaveDomain}
          onActivate={handleActivateDomain}
          onRefresh={handleRefreshStatus}
          onVerify={handleVerifyDns}
          isSaving={saveDomainMutation.isPending}
          isActivating={activateDomainMutation.isPending}
          isRefreshing={refreshStatusMutation.isPending}
          isVerifying={dnsVerifyMutation.isPending}
          normalizedDomain={normalizedDomain}
          hasCustomDomain={!!website?.custom_domain}
          customDomain={website?.custom_domain}
          wwwCnameRows={wwwCnameRows}
          apexRows={apexRows}
          dnsStatus={dnsStatus}
          cloudflareHosts={cloudflareHosts}
          ownershipTxtRows={ownershipTxtRows}
          certificateTxtRows={certificateTxtRows}
          isCloudflareLoading={isCloudflareLoading}
          cloudflareError={cloudflareError}
        />
      </div>
    </div>
  );
}
