"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { usePublicSite } from "@/hooks/usePublicSite";
import { usePublicSiteNavigation } from "@/hooks/usePublicSiteNavigation";

import { LoadingState } from "@/components/PublicSite/LoadingState";
import { ErrorState } from "@/components/PublicSite/ErrorState";
import { PreviewBanner } from "@/components/PublicSite/PreviewBanner";
import { Navigation } from "@/components/PublicSite/Navigation";
import { Footer } from "@/components/PublicSite/Footer";
import { BlockRenderer } from "@/components/PublicSite/BlockRenderer";

function getFontClass(key) {
  const k = typeof key === "string" ? key : "inter";

  // IMPORTANT: keep these as explicit strings so the font classes are included.
  if (k === "crimson-text") return "font-crimson-text";
  if (k === "playfair-display") return "font-playfair-display";
  if (k === "libre-baskerville") return "font-libre-baskerville";
  if (k === "montserrat") return "font-montserrat";
  return "font-inter";
}

function normalizeHost(host) {
  if (typeof host !== "string") return "";
  let h = host.trim().toLowerCase();
  if (!h) return "";
  if (h.includes(":")) {
    h = h.split(":")[0];
  }
  if (h.startsWith("www.")) {
    h = h.slice(4);
  }
  return h;
}

export default function PublicSiteShell({ slug: slugProp, host: hostProp }) {
  const preview = usePreviewMode();

  const normalizedHost = normalizeHost(hostProp);

  // If we got a host (custom domain or slug.clubsoft.site), load everything in ONE request.
  // This avoids the previous resolve-host round trip (which adds a lot of latency on real networks).
  const shouldLoadByHost = !slugProp && !!normalizedHost;

  const {
    data: siteDataByHost,
    isLoading: siteByHostLoading,
    error: siteByHostError,
  } = useQuery({
    queryKey: ["public-site-by-host", normalizedHost, preview],
    enabled: shouldLoadByHost,
    queryFn: async () => {
      const url = preview
        ? `/api/public-site?host=${encodeURIComponent(normalizedHost)}&preview=1`
        : `/api/public-site?host=${encodeURIComponent(normalizedHost)}`;

      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When fetching /api/public-site, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    staleTime: 1000 * 60,
    retry: 0,
  });

  // IMPORTANT: when loading by host, we must NOT also fetch by slug.
  const resolvedSlug = shouldLoadByHost ? "" : slugProp || "";

  const {
    data: siteDataBySlug,
    isLoading: siteLoading,
    error: siteError,
  } = usePublicSite(resolvedSlug, preview);

  const siteData = shouldLoadByHost ? siteDataByHost : siteDataBySlug;

  const loading = shouldLoadByHost ? siteByHostLoading : siteLoading;
  const error = shouldLoadByHost ? siteByHostError : siteError;

  const {
    currentPageSlug,
    setCurrentPageSlug,
    visiblePages,
    isSinglePageMode,
    resolvedPageSlug,
    currentPage,
    onePageNavItems,
    onAnchorClick,
  } = usePublicSiteNavigation(
    siteData?.pages,
    siteData?.website,
    siteData?.preview,
  );

  const onPageChange = React.useCallback(
    (nextSlug) => {
      setCurrentPageSlug(nextSlug);

      if (typeof window === "undefined") return;

      try {
        const url = new URL(window.location.href);
        if (nextSlug && nextSlug !== "home") {
          url.searchParams.set("page", nextSlug);
        } else {
          url.searchParams.delete("page");
        }
        window.history.replaceState({}, "", url.toString());
      } catch (e) {
        // ignore
      }
    },
    [setCurrentPageSlug],
  );

  // If a page is specified in the URL (?page=membership), navigate to it.
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const requested = url.searchParams.get("page");
    if (!requested) return;

    if (requested !== currentPageSlug) {
      setCurrentPageSlug(requested);
    }
  }, [currentPageSlug, setCurrentPageSlug]);

  // --- Analytics (MUST be above early returns to avoid conditional hooks) ---
  const clubIdForAnalytics = siteData?.club?.id;
  const pageSlugForAnalytics =
    typeof resolvedPageSlug === "string" && resolvedPageSlug
      ? resolvedPageSlug
      : typeof currentPage?.slug === "string"
        ? currentPage.slug
        : "";

  const isPreviewForAnalytics = siteData?.preview === true;

  const shouldLogAnalytics =
    Number.isFinite(Number(clubIdForAnalytics)) && !!pageSlugForAnalytics;

  React.useEffect(() => {
    if (!shouldLogAnalytics) {
      return;
    }

    const path =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "";

    const payload = {
      clubId: clubIdForAnalytics,
      pageSlug: pageSlugForAnalytics,
      path,
      isPreview: isPreviewForAnalytics,
    };

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // ignore
    });
  }, [
    shouldLogAnalytics,
    clubIdForAnalytics,
    pageSlugForAnalytics,
    isPreviewForAnalytics,
  ]);

  // Page title
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const clubName = siteData?.club?.name;
    const pageTitle = currentPage?.title;

    if (typeof clubName === "string" && clubName.trim()) {
      if (typeof pageTitle === "string" && pageTitle.trim()) {
        document.title = `${clubName} – ${pageTitle}`;
        return;
      }

      document.title = clubName;
      return;
    }

    document.title = "ClubSoft Website Lite";
  }, [siteData?.club?.name, currentPage?.title]);

  // --- End analytics ---

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Site not found";
    return <ErrorState message={message} />;
  }

  const { club, website, preview: apiPreview } = siteData;

  const primaryColor = website?.primary_color || "#0066FF";
  const secondaryColor = website?.secondary_color || "#FFD400";
  const logoUrl = website?.logo_url || club?.logo_url;

  // typography
  const bodyTextColor = website?.body_text_color || "#111418";
  const headingColor = website?.heading_text_color || "#111418";
  const bodyFontClassName = getFontClass(website?.body_font);
  const headingFontClassName = getFontClass(website?.heading_font);

  const clubSlug = typeof club?.slug === "string" ? club.slug : "";

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
      {apiPreview && <PreviewBanner />}

      <Navigation
        club={club}
        website={website}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        isSinglePageMode={isSinglePageMode}
        onePageNavItems={onePageNavItems}
        visiblePages={visiblePages}
        apiPreview={apiPreview}
        resolvedPageSlug={resolvedPageSlug}
        onAnchorClick={onAnchorClick}
        onPageChange={onPageChange}
      />

      <main className={mainClassName}>
        <div className="space-y-10 md:space-y-14">
          {currentPage?.content?.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              clubSlug={clubSlug}
              primaryColor={primaryColor}
              headingColor={headingColor}
              bodyTextColor={bodyTextColor}
              headingFontClassName={headingFontClassName}
            />
          ))}

          {currentPage?.content?.length === 0 && (
            <div className="text-center py-20 text-gray-400 font-medium italic">
              This page has no content yet.
            </div>
          )}
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
        apiPreview={apiPreview}
        resolvedPageSlug={resolvedPageSlug}
        onAnchorClick={onAnchorClick}
        onPageChange={onPageChange}
      />

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
