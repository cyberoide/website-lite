import React from "react";

export function usePublicSiteNavigation(pages, website, preview) {
  const [currentPageSlug, setCurrentPageSlug] = React.useState("home");

  const allPages = Array.isArray(pages) ? pages : [];

  // Hidden pages are not accessible (even in preview). Preview mode is for
  // unpublished styling/content, not for surfacing hidden pages.
  const enabledPages = allPages.filter((p) => p?.is_enabled === true);

  // What we expose to the rest of the public site should only be enabled pages.
  const visiblePages = enabledPages;

  const requestedMode =
    website?.navigation_mode === "single" ? "single" : "multi";

  const inferredSingle = enabledPages.length <= 1;
  const isSinglePageMode = requestedMode === "single" ? true : inferredSingle;

  const firstEnabled = enabledPages[0];
  const homePage =
    enabledPages.find((p) => p.slug === "home") || firstEnabled || null;
  const homeSlug = homePage?.slug || "home";

  React.useEffect(() => {
    if (!homeSlug) return;

    const currentExists = enabledPages.some((p) => p.slug === currentPageSlug);
    if (!currentExists) {
      setCurrentPageSlug(homeSlug);
      return;
    }

    if (requestedMode !== "single" && inferredSingle) {
      if (currentPageSlug !== homeSlug) {
        setCurrentPageSlug(homeSlug);
      }
    }
  }, [homeSlug, enabledPages, currentPageSlug, requestedMode, inferredSingle]);

  const effectiveRequestedSlug = currentPageSlug;

  const resolvedPageSlug = enabledPages.find(
    (p) => p.slug === effectiveRequestedSlug,
  )
    ? effectiveRequestedSlug
    : homeSlug;

  const currentPage =
    enabledPages.find((p) => p.slug === resolvedPageSlug) || homePage;

  const onePageSourcePage = isSinglePageMode ? homePage : currentPage;

  const onePageNavItems = isSinglePageMode
    ? (onePageSourcePage?.content || [])
        .map((b) => {
          const label = b?.data?.navLabel;
          const anchor = b?.data?.anchor;
          if (!label || !anchor) {
            return null;
          }
          return { label, anchor };
        })
        .filter(Boolean)
    : [];

  const onAnchorClick = (anchor) => {
    if (typeof window === "undefined") return;

    const doScroll = () => {
      if (anchor === "__top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.hash = anchor;
      }
    };

    if (isSinglePageMode && resolvedPageSlug !== homeSlug) {
      setCurrentPageSlug(homeSlug);
      setTimeout(doScroll, 50);
      return;
    }

    doScroll();
  };

  return {
    currentPageSlug,
    setCurrentPageSlug,
    visiblePages,
    isSinglePageMode,
    resolvedPageSlug,
    currentPage,
    onePageNavItems,
    onAnchorClick,
  };
}
