import { useCallback } from "react";
import { toast } from "sonner";
import { slugify } from "@/utils/slugify";
import { buildPresetContent } from "@/utils/presetPageContent";

function presetDefaultInNavigation(preset) {
  const key = typeof preset?.key === "string" ? preset.key : "";
  // Join Us + Member Login are typically header CTAs, not main-nav items.
  if (key === "membership" || key === "login") return false;
  return true;
}

export function useDashboardActions({
  website,
  pages,
  existingSlugs,
  addPageMutation,
  updatePageMutation,
  reorderPagesMutation,
  queryClient,
}) {
  const onAddPresetPage = useCallback(
    (preset) => {
      if (!website?.id) return;
      if (existingSlugs.has(preset.slug)) {
        toast.message("That page already exists");
        return;
      }

      const content = buildPresetContent(preset.key, website?.club_name);
      addPageMutation.mutate({
        title: preset.title,
        slug: preset.slug,
        content,
        in_navigation: presetDefaultInNavigation(preset),
      });
    },
    [addPageMutation, existingSlugs, website?.club_name, website?.id],
  );

  const onAddPage = useCallback(() => {
    if (!website?.id) return;
    if (typeof window === "undefined") return;

    const rawTitle = window.prompt("Page title", "New Page");
    if (!rawTitle) return;
    const title = rawTitle.trim();
    if (!title) return;

    const suggestedSlug = slugify(title) || `page-${Date.now()}`;
    const rawSlug = window.prompt("Page slug (URL)", suggestedSlug);
    if (!rawSlug) return;

    const slug = slugify(rawSlug);
    if (!slug) {
      toast.error("Invalid slug");
      return;
    }

    addPageMutation.mutate({ title, slug });
  }, [website?.id, addPageMutation]);

  const onCopyUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/s/${website?.club_slug}?preview=1`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Copied"))
      .catch((e) => {
        console.error(e);
        toast.error("Could not copy");
      });
  }, [website?.club_slug]);

  const onTogglePageEnabled = useCallback(
    (pageRow) => {
      updatePageMutation.mutate({
        id: pageRow.id,
        is_enabled: !pageRow.is_enabled,
      });
    },
    [updatePageMutation],
  );

  const onMovePage = useCallback(
    (idx, direction) => {
      if (!Array.isArray(pages) || pages.length === 0) return;
      const newIndex = direction === "up" ? idx - 1 : idx + 1;
      if (newIndex < 0 || newIndex >= pages.length) return;

      const nextPages = [...pages];
      const temp = nextPages[idx];
      nextPages[idx] = nextPages[newIndex];
      nextPages[newIndex] = temp;

      // optimistic
      queryClient.setQueryData(["pages", website?.id], nextPages);
      reorderPagesMutation.mutate(nextPages);
    },
    [pages, queryClient, reorderPagesMutation, website?.id],
  );

  const onSetHome = useCallback(
    (idx) => {
      if (!Array.isArray(pages) || pages.length === 0) return;
      if (idx === 0) return;
      const nextPages = [...pages];
      const [picked] = nextPages.splice(idx, 1);
      nextPages.unshift(picked);
      queryClient.setQueryData(["pages", website?.id], nextPages);
      reorderPagesMutation.mutate(nextPages);
      toast.success("Home page updated");
    },
    [pages, queryClient, reorderPagesMutation, website?.id],
  );

  return {
    onAddPresetPage,
    onAddPage,
    onCopyUrl,
    onTogglePageEnabled,
    onMovePage,
    onSetHome,
  };
}
