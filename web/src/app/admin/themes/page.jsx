"use client";

import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";
import { useThemeData } from "@/hooks/useThemeData";
import { useTemplates } from "@/hooks/useTemplates";
import { useThemeMutations } from "@/hooks/useThemeMutations";
import { useThemeState } from "@/hooks/useThemeState";
import { useImageUpload } from "@/hooks/useImageUpload";
import { LoadingState } from "@/components/AdminThemes/LoadingState";
import { UnauthenticatedState } from "@/components/AdminThemes/UnauthenticatedState";
import { ErrorState } from "@/components/AdminThemes/ErrorState";
import { ThemeHeader } from "@/components/AdminThemes/ThemeHeader";
import { BrandingSourceSection } from "@/components/AdminThemes/BrandingSourceSection";
import { SocialLinksSection } from "@/components/AdminThemes/SocialLinksSection";
import { ThemeTemplatesSection } from "@/components/AdminThemes/ThemeTemplatesSection";
import { TemplatePreview } from "@/components/AdminThemes/TemplatePreview";
import { ImageUploadSection } from "@/components/AdminThemes/ImageUploadSection";
import { ContactInfoSection } from "@/components/AdminThemes/ContactInfoSection";
import { LivePreviewCard } from "@/components/AdminThemes/LivePreviewCard";
import { TypographySection } from "@/components/AdminThemes/TypographySection";
import { HeaderCtaSection } from "@/components/AdminThemes/HeaderCtaSection";
import { NavigationStyleSection } from "@/components/AdminThemes/NavigationStyleSection";

export default function AdminSettings() {
  const {
    session,
    isLoading: sessionLoading,
    isClubEditor,
    readOnly,
  } = useWebsiteLiteSession();
  const clubId = session?.club_id || null;

  const canEdit = !!isClubEditor && !readOnly;

  const [hoveredTemplateKey, setHoveredTemplateKey] = useState(null);
  const [previewTemplateKey, setPreviewTemplateKey] = useState(null);

  const { templateCards } = useTemplates();
  const { website, isLoading, error } = useThemeData(clubId, sessionLoading);

  // Fetch current pages so we can apply Website Styles safely by default.
  const websiteId = website?.id || null;
  const {
    data: pages,
    isLoading: pagesLoading,
    error: pagesError,
  } = useQuery({
    queryKey: ["pages", websiteId],
    enabled: !!websiteId && !sessionLoading,
    queryFn: async () => {
      const res = await fetch(`/api/pages?websiteId=${websiteId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When fetching /api/pages, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return Array.isArray(data) ? data : [];
    },
  });

  const pagesCount = Array.isArray(pages) ? pages.length : 0;
  const isNewSite = !pagesLoading && !pagesError && pagesCount === 0;

  const activeTemplateKey =
    typeof website?.selected_template_key === "string" &&
    website.selected_template_key.trim()
      ? website.selected_template_key
      : "coastal";

  const templatePreviewVersion =
    typeof website?.updated_at === "string" && website.updated_at.trim()
      ? website.updated_at
      : "";

  const effectivePreviewKey = previewTemplateKey || hoveredTemplateKey;

  const templatePreviewSrc = effectivePreviewKey
    ? `/template-preview/${effectivePreviewKey}?clubId=${encodeURIComponent(String(clubId || ""))}&v=${encodeURIComponent(templatePreviewVersion)}`
    : null;

  const { applyTemplateMutation, saveMutation, syncBrandingMutation } =
    useThemeMutations(clubId);

  const {
    localPrimary,
    setLocalPrimary,
    localSecondary,
    setLocalSecondary,
    localBrandingSource,
    setLocalBrandingSource,
    localLogoUrl,
    setLocalLogoUrl,
    localIconUrl,
    setLocalIconUrl,
    localPhone,
    setLocalPhone,
    localEmail,
    setLocalEmail,
    localAddress,
    setLocalAddress,
    localSocialBarPosition,
    setLocalSocialBarPosition,
    localSocialDisplayStyle,
    setLocalSocialDisplayStyle,
    localSocialLinks,
    setLocalSocialLinks,

    // ADD: typography
    localBodyFont,
    setLocalBodyFont,
    localHeadingFont,
    setLocalHeadingFont,
    localBodyTextColor,
    setLocalBodyTextColor,
    localHeadingTextColor,
    setLocalHeadingTextColor,

    // ADD: header CTA
    localHeaderCtaEnabled,
    setLocalHeaderCtaEnabled,
    localHeaderCtaAction,
    setLocalHeaderCtaAction,

    // Header/nav styling
    localNavColorMode,
    setLocalNavColorMode,
    localNavLinkColor,
    setLocalNavLinkColor,
    localNavActiveColor,
    setLocalNavActiveColor,

    // Social bar options
    localSocialShowAddress,
    setLocalSocialShowAddress,
  } = useThemeState(website);

  const {
    uploading,
    logoInputRef,
    iconInputRef,
    onPickLogo,
    onPickIcon,
    createUploadHandler,
  } = useImageUpload();

  const onLogoSelected = createUploadHandler(setLocalLogoUrl, "Logo uploaded");
  const onIconSelected = createUploadHandler(setLocalIconUrl, "Icon uploaded");

  const handleSyncBranding = useCallback(() => {
    if (!canEdit) {
      toast.error("Read-only access");
      return;
    }
    syncBrandingMutation.mutate(undefined, {
      onSuccess: (updated) => {
        setLocalBrandingSource("clubsoft");
        if (updated?.primary_color) setLocalPrimary(updated.primary_color);
        if (updated?.secondary_color)
          setLocalSecondary(updated.secondary_color);
        if (updated?.logo_url) setLocalLogoUrl(updated.logo_url);
      },
    });
  }, [
    canEdit,
    syncBrandingMutation,
    setLocalBrandingSource,
    setLocalPrimary,
    setLocalSecondary,
    setLocalLogoUrl,
  ]);

  const onSave = useCallback(() => {
    if (!canEdit) {
      toast.error("Read-only access");
      return;
    }

    if (!website?.club_id) {
      toast.error("Website not loaded");
      return;
    }

    const payload = {
      club_id: clubId,
      branding_source: localBrandingSource,
      logo_url: localLogoUrl,
      icon_url: localIconUrl,
      contact_phone: localPhone,
      contact_email: localEmail,
      contact_address: localAddress,
      social_links: localSocialLinks,
      social_bar_position: localSocialBarPosition,
      social_display_style: localSocialDisplayStyle,
      social_show_address: localSocialShowAddress,

      // typography + CTA
      body_font: localBodyFont,
      heading_font: localHeadingFont,
      body_text_color: localBodyTextColor,
      heading_text_color: localHeadingTextColor,
      header_cta_enabled: localHeaderCtaEnabled,
      header_cta_action: localHeaderCtaAction,

      // header/menu styling
      nav_color_mode: localNavColorMode,
      nav_link_color: localNavLinkColor,
      nav_active_color: localNavActiveColor,
    };

    if (localBrandingSource === "custom") {
      payload.primary_color = localPrimary;
      payload.secondary_color = localSecondary;
    }

    saveMutation.mutate(payload);
  }, [
    canEdit,
    website?.club_id,
    clubId,
    localBrandingSource,
    localLogoUrl,
    localIconUrl,
    localPrimary,
    localSecondary,
    localPhone,
    localEmail,
    localAddress,
    localSocialLinks,
    localSocialBarPosition,
    localSocialDisplayStyle,
    localSocialShowAddress,
    localBodyFont,
    localHeadingFont,
    localBodyTextColor,
    localHeadingTextColor,
    localHeaderCtaEnabled,
    localHeaderCtaAction,
    localNavColorMode,
    localNavLinkColor,
    localNavActiveColor,
    saveMutation,
  ]);

  const isClubSoftSource = localBrandingSource === "clubsoft";
  const disabledStyle = isClubSoftSource
    ? "opacity-50 pointer-events-none"
    : "";

  const onPreviewTemplate = useCallback((key) => {
    setPreviewTemplateKey(key);
  }, []);

  const onApplyTemplate = useCallback(
    ({ templateKey, includePages }) => {
      if (!canEdit) {
        toast.error("Read-only access");
        return;
      }
      applyTemplateMutation.mutate({
        templateKey,
        replaceExisting: includePages === true,
      });

      // After applying, keep the preview pinned on the applied style so the user
      // can immediately see the result.
      setPreviewTemplateKey(templateKey);
    },
    [canEdit, applyTemplateMutation],
  );

  const templatePreviewHelp = useMemo(() => {
    if (!effectivePreviewKey) return null;
    const isActive = effectivePreviewKey === activeTemplateKey;
    if (isActive) return "Previewing your current style";
    return "Previewing a different style";
  }, [effectivePreviewKey, activeTemplateKey]);

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!clubId) {
    return <UnauthenticatedState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <ThemeHeader
        onSave={onSave}
        isSaving={saveMutation.isPending}
        canEdit={canEdit}
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left: Brand customization */}
        <div className="space-y-8">
          <BrandingSourceSection
            localBrandingSource={localBrandingSource}
            setLocalBrandingSource={setLocalBrandingSource}
            onSyncBranding={handleSyncBranding}
            isClubSoftSource={isClubSoftSource}
            disabledStyle={disabledStyle}
            localPrimary={localPrimary}
            setLocalPrimary={setLocalPrimary}
            localSecondary={localSecondary}
            setLocalSecondary={setLocalSecondary}
            isSyncing={syncBrandingMutation.isPending}
            lastSyncedAt={website?.clubsoft_branding_last_synced_at}
          />

          {/* ADD: typography + header button */}
          <TypographySection
            localBodyFont={localBodyFont}
            setLocalBodyFont={setLocalBodyFont}
            localHeadingFont={localHeadingFont}
            setLocalHeadingFont={setLocalHeadingFont}
            localBodyTextColor={localBodyTextColor}
            setLocalBodyTextColor={setLocalBodyTextColor}
            localHeadingTextColor={localHeadingTextColor}
            setLocalHeadingTextColor={setLocalHeadingTextColor}
          />

          <NavigationStyleSection
            localNavColorMode={localNavColorMode}
            setLocalNavColorMode={setLocalNavColorMode}
            localNavLinkColor={localNavLinkColor}
            setLocalNavLinkColor={setLocalNavLinkColor}
            localNavActiveColor={localNavActiveColor}
            setLocalNavActiveColor={setLocalNavActiveColor}
            localHeadingTextColor={localHeadingTextColor}
            localPrimaryColor={localPrimary}
          />

          <HeaderCtaSection
            localHeaderCtaEnabled={localHeaderCtaEnabled}
            setLocalHeaderCtaEnabled={setLocalHeaderCtaEnabled}
            localHeaderCtaAction={localHeaderCtaAction}
            setLocalHeaderCtaAction={setLocalHeaderCtaAction}
          />

          <SocialLinksSection
            localSocialBarPosition={localSocialBarPosition}
            setLocalSocialBarPosition={setLocalSocialBarPosition}
            localSocialDisplayStyle={localSocialDisplayStyle}
            setLocalSocialDisplayStyle={setLocalSocialDisplayStyle}
            localSocialLinks={localSocialLinks}
            setLocalSocialLinks={setLocalSocialLinks}
            localSocialShowAddress={localSocialShowAddress}
            setLocalSocialShowAddress={setLocalSocialShowAddress}
          />

          <ThemeTemplatesSection
            templateCards={templateCards}
            activeTemplateKey={activeTemplateKey}
            previewTemplateKey={effectivePreviewKey}
            templatePreviewSrc={templatePreviewSrc}
            templatePreviewHelp={templatePreviewHelp}
            isNewSite={isNewSite}
            pagesCount={pagesCount}
            pagesError={pagesError}
            onApplyTemplate={onApplyTemplate}
            isApplying={applyTemplateMutation.isPending}
            onTemplateHover={setHoveredTemplateKey}
            onTemplateLeave={() => setHoveredTemplateKey(null)}
            onPreviewTemplate={onPreviewTemplate}
            onClearPreview={() => setPreviewTemplateKey(null)}
          />
        </div>

        {/* Right: Themes/templates */}
        <div className="space-y-6 relative">
          <TemplatePreview templatePreviewSrc={templatePreviewSrc} />

          <ImageUploadSection
            title="Site Logo"
            description="Optional override. If empty, we fall back to the club logo."
            currentUrl={localLogoUrl}
            onUpload={onPickLogo}
            onRemove={() => setLocalLogoUrl(null)}
            uploading={uploading}
            inputRef={logoInputRef}
            onFileChange={onLogoSelected}
            altText="Site logo"
          />

          <ImageUploadSection
            title="Site Icon (Favicon)"
            description="Used as the browser tab icon and iOS home screen icon."
            currentUrl={localIconUrl}
            onUpload={onPickIcon}
            onRemove={() => setLocalIconUrl(null)}
            uploading={uploading}
            inputRef={iconInputRef}
            onFileChange={onIconSelected}
            altText="Site icon"
          />

          <ContactInfoSection
            localPhone={localPhone}
            setLocalPhone={setLocalPhone}
            localEmail={localEmail}
            setLocalEmail={setLocalEmail}
            localAddress={localAddress}
            setLocalAddress={setLocalAddress}
          />

          <LivePreviewCard
            localPrimary={localPrimary}
            localSecondary={localSecondary}
            clubName={website?.club_name}
            isClubSoftSource={isClubSoftSource}
          />
        </div>
      </div>
    </div>
  );
}
