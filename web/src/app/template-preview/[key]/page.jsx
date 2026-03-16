"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { LoadingState } from "@/components/PublicSite/LoadingState";
import { ErrorState } from "@/components/PublicSite/ErrorState";
import { Navigation } from "@/components/PublicSite/Navigation";
import { Footer } from "@/components/PublicSite/Footer";
import { BlockRenderer } from "@/components/PublicSite/BlockRenderer";
import { usePublicSiteNavigation } from "@/hooks/usePublicSiteNavigation";

function getFontClass(key) {
  const k = typeof key === "string" ? key : "inter";
  if (k === "crimson-text") return "font-crimson-text";
  if (k === "playfair-display") return "font-playfair-display";
  if (k === "libre-baskerville") return "font-libre-baskerville";
  if (k === "montserrat") return "font-montserrat";
  return "font-inter";
}

export default function TemplatePreviewPage({ params }) {
  const templateKey = params?.key;

  // If opened from /admin/themes, we include ?clubId=123 so the preview uses that
  // club's branding (colors, logo, fonts, etc) while still previewing the chosen layout.
  const [clubId, setClubId] = React.useState(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("clubId");
    const next = typeof raw === "string" && raw.trim() ? raw.trim() : null;
    setClubId(next);
  }, []);

  const {
    data: websiteFromClub,
    isLoading: websiteLoading,
    error: websiteError,
  } = useQuery({
    queryKey: ["templatePreviewWebsite", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const res = await fetch(
        `/api/website?clubId=${encodeURIComponent(clubId)}`,
      );
      if (!res.ok) {
        throw new Error(
          `When fetching /api/website, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    retry: 0,
  });

  const {
    data: templateData,
    isLoading: templateLoading,
    error: templateError,
  } = useQuery({
    queryKey: ["templatePreview", templateKey],
    enabled: !!templateKey,
    queryFn: async () => {
      const res = await fetch(
        `/api/templates/preview?templateKey=${templateKey}`,
      );
      if (!res.ok) {
        throw new Error(
          `When fetching /api/templates/preview, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
  });

  const template = templateData?.template || null;
  const pages = Array.isArray(template?.pages) ? template.pages : [];

  const {
    setCurrentPageSlug,
    visiblePages,
    isSinglePageMode,
    resolvedPageSlug,
    currentPage,
    onePageNavItems,
    onAnchorClick,
  } = usePublicSiteNavigation(pages, true);

  if (templateLoading || websiteLoading) {
    return <LoadingState />;
  }

  if (templateError || websiteError) {
    const err = templateError || websiteError;
    const message = err instanceof Error ? err.message : "Could not load";
    return <ErrorState message={message} />;
  }

  if (!templateKey) {
    return <ErrorState message="Missing template key" />;
  }

  if (!template) {
    return <ErrorState message="Template not found" />;
  }

  const club = {
    name: websiteFromClub?.club_name || template.name || "Template Preview",
    slug: websiteFromClub?.club_slug || "template-preview",
    logo_url: null,
  };

  const websiteDefaults = {
    primary_color: "#0B3A67",
    secondary_color: "#D6B25E",
    logo_url: null,
    icon_url: null,
    branding_source: "custom",
    social_links: {},
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    social_bar_position: "above",
    social_display_style: "names",

    // typography defaults
    body_font: "inter",
    heading_font: "crimson-text",
    body_text_color: "#111418",
    heading_text_color: "#111418",

    // header CTA defaults
    header_cta_enabled: false,
    header_cta_action: "join",
  };

  // Use the real club branding when provided, but ALWAYS preview the selected layout.
  const website = {
    ...websiteDefaults,
    ...(websiteFromClub || {}),
    selected_template_key: template.key,
  };

  const primaryColor = website.primary_color || "#0066FF";
  const secondaryColor = website.secondary_color || "#FFD400";

  const logoUrl = website.logo_url || null;

  const bodyTextColor = website.body_text_color || "#111418";
  const headingColor = website.heading_text_color || "#111418";
  const bodyFontClassName = getFontClass(website.body_font);
  const headingFontClassName = getFontClass(website.heading_font);

  const firstBlockType = currentPage?.content?.[0]?.type;
  const firstBlockIsHero = firstBlockType === "hero";
  const mainClassName = firstBlockIsHero
    ? "max-w-7xl mx-auto px-6 pt-0 pb-14 md:pb-20"
    : "max-w-7xl mx-auto px-6 py-14 md:py-20";

  return (
    <div
      className={`min-h-screen bg-[#fbfbfc] ${bodyFontClassName}`}
      style={{
        "--primary": primaryColor,
        "--secondary": secondaryColor,
        color: bodyTextColor,
      }}
    >
      <Navigation
        club={club}
        website={website}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        isSinglePageMode={isSinglePageMode}
        onePageNavItems={onePageNavItems}
        visiblePages={visiblePages}
        apiPreview={true}
        resolvedPageSlug={resolvedPageSlug}
        onAnchorClick={onAnchorClick}
        onPageChange={setCurrentPageSlug}
      />

      <main className={mainClassName}>
        <div className="space-y-10 md:space-y-14">
          {currentPage?.content?.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              primaryColor={primaryColor}
              headingColor={headingColor}
              bodyTextColor={bodyTextColor}
              headingFontClassName={headingFontClassName}
            />
          ))}
        </div>
      </main>

      <Footer
        club={club}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        website={website}
        isSinglePageMode={isSinglePageMode}
        onePageNavItems={onePageNavItems}
        visiblePages={visiblePages}
        apiPreview={true}
        resolvedPageSlug={resolvedPageSlug}
        onAnchorClick={onAnchorClick}
        onPageChange={setCurrentPageSlug}
      />
    </div>
  );
}
