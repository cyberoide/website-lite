"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  ArrowRight,
  FileText,
  Palette,
  Image as ImageIcon,
  Settings,
  Eye,
} from "lucide-react";

import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";

import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";

export default function AdminDashboard() {
  const {
    session,
    isLoading: sessionLoading,
    isClubSoftAdmin,
    isClubEditor,
    readOnly,
  } = useWebsiteLiteSession();
  const clubId = session?.club_id || null;

  const canEdit = !!isClubEditor && !readOnly;

  const { website, websiteLoading, pages, pagesLoading } = useDashboardData(
    clubId,
    null,
  );

  const { publishMutation } = useDashboardMutations(website, pages, clubId);

  // NEW: analytics range selector
  const [analyticsRange, setAnalyticsRange] = useState("7d");

  // If we have a session but no club, guide the user instead of defaulting to club #1.
  if (!sessionLoading && session && !clubId) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="text-2xl font-extrabold text-[#111418]">
            Select a club
          </div>
          <div className="text-gray-500 mt-2 max-w-2xl">
            You’re signed in, but ClubSoft didn’t send an active club for this
            session.
          </div>
          <div className="text-gray-500 mt-2 max-w-2xl">
            {isClubSoftAdmin
              ? "Use the club dropdown in the left menu to pick which site you’re editing."
              : "Go back to the ClubSoft app and open Website Builder from the club you want to edit."}
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

  const rangeLabel = useMemo(() => {
    if (analyticsRange === "30d") return "Last 30 days";
    if (analyticsRange === "365d") return "Last 365 days";
    return "Last 7 days";
  }, [analyticsRange]);

  const rangeShortLabel = useMemo(() => {
    if (analyticsRange === "30d") return "30d";
    if (analyticsRange === "365d") return "365d";
    return "7d";
  }, [analyticsRange]);

  const { data: analyticsSummary } = useQuery({
    queryKey: ["analyticsSummary", clubId, analyticsRange],
    enabled: !!clubId,
    queryFn: async () => {
      const res = await fetch(
        `/api/analytics/summary?clubId=${clubId}&range=${analyticsRange}`,
      );
      if (!res.ok) {
        throw new Error(
          `When fetching /api/analytics/summary, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });

  if (websiteLoading || (website?.id && pagesLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  const sitePreviewHref = website?.club_slug
    ? `/s/${website.club_slug}?preview=1`
    : "#";

  const pagesCount = Array.isArray(pages) ? pages.length : 0;
  const enabledPagesCount = Array.isArray(pages)
    ? pages.filter((p) => p?.is_enabled !== false).length
    : 0;

  const views = analyticsSummary?.views || 0;
  const previewViews = analyticsSummary?.previewViews || 0;
  const topPages = Array.isArray(analyticsSummary?.topPages)
    ? analyticsSummary.topPages
    : [];

  const quickLinks = [
    {
      href: "/admin/pages",
      label: "Edit Pages",
      description: "Add pages, reorder navigation, and manage what’s visible.",
      Icon: FileText,
    },
    {
      href: "/admin/themes",
      label: "Branding",
      description: "Logo, colors, fonts, and header button.",
      Icon: Palette,
    },
    {
      href: "/admin/media",
      label: "Media",
      description: "Upload and manage images.",
      Icon: ImageIcon,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      description: "Preview link, domains/DNS (soon), and technical settings.",
      Icon: Settings,
    },
  ];

  const recentPages = Array.isArray(pages) ? pages.slice(0, 4) : [];

  const canPreview = !!website?.club_slug;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <DashboardHeader
        title="Dashboard"
        subtitle="Quick actions and a snapshot of your site."
        website={website}
        publishMutation={publishMutation}
        sitePreviewHref={sitePreviewHref}
        canEdit={canEdit}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {quickLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-extrabold text-[#111418] text-lg flex items-center gap-2">
                      <l.Icon className="w-5 h-5 text-gray-500" />
                      {l.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {l.description}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300" />
                </div>
              </a>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="font-extrabold text-[#111418]">Recent pages</div>
              <div className="text-xs text-gray-500 mt-1">
                Jump straight into editing.
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {recentPages.map((p) => (
                <div
                  key={p.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[#111418] truncate">
                      {p.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      /{p.slug}
                    </div>
                  </div>
                  <a
                    href={`/admin/editor/${p.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold"
                  >
                    Edit
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}

              {recentPages.length === 0 && (
                <div className="px-6 py-10 text-sm text-gray-500">
                  No pages yet. Head to{" "}
                  <a
                    className="text-[#0066FF] font-semibold"
                    href="/admin/pages"
                  >
                    Pages
                  </a>{" "}
                  to add your first page.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Site snapshot
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Traffic range: {rangeLabel}
                </div>
              </div>

              <div className="shrink-0">
                <label className="sr-only" htmlFor="analyticsRange">
                  Analytics range
                </label>
                <select
                  id="analyticsRange"
                  value={analyticsRange}
                  onChange={(e) => setAnalyticsRange(e.target.value)}
                  className="text-sm font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="365d">Last 365 days</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-extrabold text-[#111418]">
                  {pagesCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total pages</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-extrabold text-[#111418]">
                  {enabledPagesCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">Visible pages</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 col-span-2">
                <div className="text-2xl font-extrabold text-[#111418]">
                  {views}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Views ({rangeShortLabel})
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 col-span-2">
                <div className="text-2xl font-extrabold text-[#111418]">
                  {previewViews}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Preview views ({rangeShortLabel})
                </div>
              </div>
            </div>

            {topPages.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Top pages ({rangeShortLabel})
                </div>
                <div className="mt-3 space-y-2">
                  {topPages.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="text-gray-700 font-semibold truncate">
                        {row.key}
                      </div>
                      <div className="text-gray-500 font-bold tabular-nums">
                        {row.views}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canPreview ? (
              <a
                href={sitePreviewHref}
                target="_blank"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#111418] text-white font-semibold hover:bg-black"
              >
                <Eye className="w-4 h-4" />
                Open Preview
              </a>
            ) : (
              <div
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-semibold cursor-not-allowed"
                title="Select a club to generate a preview link"
              >
                <Eye className="w-4 h-4" />
                Open Preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
