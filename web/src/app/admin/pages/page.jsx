"use client";

import React, { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { presetPages } from "@/utils/presetPageDefinitions";

import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { PageList } from "@/components/Dashboard/PageList";
import { PageOptionsPanel } from "@/components/Dashboard/PageOptionsPanel";
import { ThemeSettingsPanel } from "@/components/Dashboard/ThemeSettingsPanel";
import { PreviewUrlPanel } from "@/components/Dashboard/PreviewUrlPanel";
import SiteStructurePanel from "@/components/Dashboard/SiteStructurePanel";

function normalizeBooleanTrue(v) {
  return v === true;
}

function normalizeInNavigation(v) {
  // Treat null/undefined as true so existing sites behave as before.
  if (v === false) return false;
  return true;
}

function splitPages(list) {
  const ordered = Array.isArray(list) ? list : [];

  const enabled = ordered.filter((p) => normalizeBooleanTrue(p?.is_enabled));
  const hidden = ordered.filter((p) => !normalizeBooleanTrue(p?.is_enabled));

  const nav = enabled.filter((p) => normalizeInNavigation(p?.in_navigation));
  const pages = enabled.filter((p) => !normalizeInNavigation(p?.in_navigation));

  return { nav, pages, hidden };
}

function composePages({ nav, pages, hidden }) {
  return [...(nav || []), ...(pages || []), ...(hidden || [])];
}

export default function AdminPages() {
  const queryClient = useQueryClient();
  const {
    session,
    isLoading: sessionLoading,
    isClubSoftAdmin,
    isClubViewer,
    isClubEditor,
    readOnly,
  } = useWebsiteLiteSession();
  const clubId = session?.club_id || null;

  // IMPORTANT: always call data hooks (React hook rules)
  const { website, websiteLoading, pages, pagesLoading } = useDashboardData(
    clubId,
    null,
  );

  const {
    addPageMutation,
    updatePageMutation,
    reorderPagesMutation,
    deletePageMutation,
    publishMutation,
  } = useDashboardMutations(website, pages, clubId);

  const existingSlugs = useMemo(() => {
    const s = new Set();
    (pages || []).forEach((p) => {
      if (p?.slug) s.add(String(p.slug));
    });
    return s;
  }, [pages]);

  const {
    onAddPresetPage,
    onAddPage,
    onCopyUrl,
    onTogglePageEnabled,
    // NOTE: onMovePage/onSetHome are now handled in-page so we can keep
    // Navigation ordering separate from “Pages”.
  } = useDashboardActions({
    website,
    pages,
    existingSlugs,
    addPageMutation,
    updatePageMutation,
    reorderPagesMutation,
    queryClient,
  });

  const orderedPages = useMemo(() => {
    const list = Array.isArray(pages) ? [...pages] : [];
    list.sort(
      (a, b) => Number(a?.order_index || 0) - Number(b?.order_index || 0),
    );
    return list;
  }, [pages]);

  const {
    nav: navigationPages,
    pages: nonNavPages,
    hidden: hiddenPages,
  } = useMemo(() => splitPages(orderedPages), [orderedPages]);

  const commitNextPages = useCallback(
    (next) => {
      const nextPages = composePages(next);
      queryClient.setQueryData(["pages", website?.id], nextPages);
      reorderPagesMutation.mutate(nextPages);
    },
    [queryClient, reorderPagesMutation, website?.id],
  );

  const setInNavigation = useCallback(
    (pageId, inNav) => {
      if (!pageId) return;

      // optimistic update
      const current = queryClient.getQueryData(["pages", website?.id]);
      const list = Array.isArray(current) ? current : [];
      const next = list.map((p) =>
        String(p?.id) === String(pageId) ? { ...p, in_navigation: inNav } : p,
      );
      queryClient.setQueryData(["pages", website?.id], next);

      updatePageMutation.mutate({ id: pageId, in_navigation: inNav });
    },
    [queryClient, updatePageMutation, website?.id],
  );

  const moveWithinSection = useCallback(
    (sectionKey, fromId, toId) => {
      if (!fromId || !toId) return;

      const current = splitPages(
        Array.isArray(queryClient.getQueryData(["pages", website?.id]))
          ? queryClient.getQueryData(["pages", website?.id])
          : orderedPages,
      );

      const list = sectionKey === "nav" ? [...current.nav] : [...current.pages];
      const fromIndex = list.findIndex((p) => String(p.id) === String(fromId));
      const toIndex = list.findIndex((p) => String(p.id) === String(toId));
      if (fromIndex < 0 || toIndex < 0) return;

      const nextList = [...list];
      const [moved] = nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, moved);

      commitNextPages({
        nav: sectionKey === "nav" ? nextList : current.nav,
        pages: sectionKey === "pages" ? nextList : current.pages,
        hidden: current.hidden,
      });
    },
    [commitNextPages, orderedPages, queryClient, website?.id],
  );

  const moveToSection = useCallback(
    (pageId, targetSectionKey, beforePageId = null) => {
      if (!pageId) return;

      const currentList = Array.isArray(
        queryClient.getQueryData(["pages", website?.id]),
      )
        ? queryClient.getQueryData(["pages", website?.id])
        : orderedPages;

      const current = splitPages(currentList);
      const allEnabled = [...current.nav, ...current.pages];
      const pageRow = allEnabled.find((p) => String(p.id) === String(pageId));
      if (!pageRow) return;

      const wasInNav = normalizeInNavigation(pageRow.in_navigation);
      const shouldBeInNav = targetSectionKey === "nav";

      const nextNav = current.nav.filter(
        (p) => String(p.id) !== String(pageId),
      );
      const nextPages = current.pages.filter(
        (p) => String(p.id) !== String(pageId),
      );

      const insertInto = (list, row) => {
        if (!beforePageId) {
          return [...list, row];
        }
        const idx = list.findIndex(
          (p) => String(p.id) === String(beforePageId),
        );
        if (idx < 0) {
          return [...list, row];
        }
        const next = [...list];
        next.splice(idx, 0, row);
        return next;
      };

      const rowWithNav = { ...pageRow, in_navigation: shouldBeInNav };

      const finalNav = shouldBeInNav
        ? insertInto(nextNav, rowWithNav)
        : nextNav;
      const finalPages = !shouldBeInNav
        ? insertInto(nextPages, rowWithNav)
        : nextPages;

      if (wasInNav !== shouldBeInNav) {
        setInNavigation(pageId, shouldBeInNav);
      }

      commitNextPages({
        nav: finalNav,
        pages: finalPages,
        hidden: current.hidden,
      });
    },
    [commitNextPages, orderedPages, queryClient, setInNavigation, website?.id],
  );

  const onSetHome = useCallback(
    (pageId) => {
      if (!pageId) return;

      const currentList = Array.isArray(
        queryClient.getQueryData(["pages", website?.id]),
      )
        ? queryClient.getQueryData(["pages", website?.id])
        : orderedPages;

      const current = splitPages(currentList);
      const allEnabled = [...current.nav, ...current.pages];
      const pageRow = allEnabled.find((p) => String(p.id) === String(pageId));
      if (!pageRow) return;

      // Home lives at the top of Navigation.
      const nextNav = [
        { ...pageRow, in_navigation: true },
        ...current.nav.filter((p) => String(p.id) !== String(pageId)),
      ];
      const nextPages = current.pages.filter(
        (p) => String(p.id) !== String(pageId),
      );

      if (!normalizeInNavigation(pageRow.in_navigation)) {
        setInNavigation(pageId, true);
      }

      commitNextPages({
        nav: nextNav,
        pages: nextPages,
        hidden: current.hidden,
      });
    },
    [commitNextPages, orderedPages, queryClient, setInNavigation, website?.id],
  );

  // If the user is signed in but only has read access, keep the page usable.
  const canEdit = !!isClubEditor && !readOnly;

  if (!sessionLoading && session && !clubId) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="text-2xl font-extrabold text-[#111418]">
            Select a club
          </div>
          <div className="text-gray-500 mt-2 max-w-2xl">
            You’re signed in, but there’s no active club selected yet.
          </div>
          <div className="text-gray-500 mt-2 max-w-2xl">
            {isClubSoftAdmin
              ? "Use the club dropdown in the left menu."
              : "Open Website Builder from the ClubSoft app for the club you want to edit."}
          </div>
          {isClubSoftAdmin ? (
            <a
              href="/admin/clubs"
              className="inline-flex mt-5 items-center justify-center px-5 py-2 rounded-2xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC]"
            >
              Go to Clubs
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  if (websiteLoading || (website?.id && pagesLoading)) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        data-testid="loading-spinner"
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  // If there's no website yet (rare, but can happen), show a friendly message.
  if (session && clubId && !website?.id) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="text-2xl font-extrabold text-[#111418]">
            Website not ready yet
          </div>
          <div className="text-gray-500 mt-2 max-w-2xl">
            This club doesn’t have a Website Lite site yet.
          </div>
          <div className="text-gray-500 mt-2 max-w-2xl">
            Try re-opening Website Builder from the ClubSoft app, or ask an
            admin to enable Website Builder for this club.
          </div>
        </div>
      </div>
    );
  }

  const sitePreviewHref = website?.club_slug
    ? `/s/${website.club_slug}?preview=1`
    : "#";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <DashboardHeader
        title="Pages"
        subtitle="Manage your pages and navigation."
        website={website}
        publishMutation={publishMutation}
        sitePreviewHref={sitePreviewHref}
        canEdit={canEdit}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <PageList
          navigationPages={navigationPages}
          pages={nonNavPages}
          hiddenPages={hiddenPages}
          onAddPage={onAddPage}
          onSetHome={onSetHome}
          onMoveWithinSection={moveWithinSection}
          onMoveToSection={moveToSection}
          onTogglePageEnabled={onTogglePageEnabled}
          deletePageMutation={deletePageMutation}
          readOnly={!canEdit}
        />

        <div className="space-y-6">
          <SiteStructurePanel website={website} clubId={clubId} />

          <PageOptionsPanel
            presetPages={presetPages}
            existingSlugs={existingSlugs}
            onAddPresetPage={onAddPresetPage}
            addPageMutation={addPageMutation}
            readOnly={!canEdit}
          />

          <ThemeSettingsPanel website={website} />

          <PreviewUrlPanel website={website} onCopyUrl={onCopyUrl} />
        </div>
      </div>
    </div>
  );
}
