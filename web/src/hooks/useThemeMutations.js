import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useThemeMutations(clubId) {
  const queryClient = useQueryClient();

  const applyTemplateMutation = useMutation({
    // Accept an object so we can support non-destructive style-only applies.
    mutationFn: async (input) => {
      const templateKey =
        typeof input === "string" ? input : input?.templateKey;
      const replaceExisting =
        typeof input === "object" && input
          ? input.replaceExisting === true
          : true;

      const res = await fetch("/api/templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          templateKey,
          replaceExisting,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/templates/apply, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["website", clubId] });

      const replaceExisting =
        typeof input === "object" && input
          ? input.replaceExisting === true
          : true;

      // Only invalidate pages if we actually replaced them.
      if (replaceExisting) {
        // IMPORTANT: applying a style deletes + re-inserts pages (new ids).
        // So invalidate all page-related queries.
        queryClient.invalidateQueries({ queryKey: ["pages"] });
        queryClient.invalidateQueries({ queryKey: ["page"] });
      }

      // Also refresh any public-site previews.
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      queryClient.invalidateQueries({ queryKey: ["public-site-host"] });

      toast.success("Website style applied");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not apply website style");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(
          `When posting /api/website, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website", clubId] });

      // Also refresh any open previews.
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      queryClient.invalidateQueries({ queryKey: ["public-site-host"] });

      toast.success("Branding saved");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not save branding");
    },
  });

  const syncBrandingMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/clubsoft/branding?clubId=${clubId}`);
      const branding = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          branding?.error ||
            `When fetching /api/clubsoft/branding, the response was [${res.status}] ${res.statusText}`,
        );
      }

      const payload = {
        club_id: clubId,
        branding_source: "clubsoft",
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
        logo_url: branding.logo_url,
        clubsoft_branding_snapshot: branding,
        clubsoft_branding_last_synced_at: new Date().toISOString(),
      };

      const res2 = await fetch("/api/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res2.json().catch(() => ({}));
      if (!res2.ok) {
        throw new Error(
          updated?.error ||
            `When posting /api/website, the response was [${res2.status}] ${res2.statusText}`,
        );
      }

      return updated;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["website", clubId] });
      toast.success("Pulled branding from ClubSoft");
      return updated;
    },
    onError: (e) => {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Could not pull branding";
      toast.error(msg || "Could not pull branding from ClubSoft");
    },
  });

  return {
    applyTemplateMutation,
    saveMutation,
    syncBrandingMutation,
  };
}
