import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDashboardMutations(website, pages, clubId) {
  const queryClient = useQueryClient();

  const addPageMutation = useMutation({
    mutationFn: async ({ title, slug, content, in_navigation }) => {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website_id: website.id,
          title,
          slug,
          type: "custom",
          content: Array.isArray(content) ? content : [],
          order_index: pages?.length || 0,
          is_enabled: true,
          in_navigation: in_navigation !== undefined ? in_navigation : true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error ||
            `When posting /api/pages, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", website?.id] });
      toast.success("Page created");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not create page");
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Could not update page");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", website?.id] });
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not update page");
    },
  });

  const reorderPagesMutation = useMutation({
    mutationFn: async (nextPages) => {
      const updates = (nextPages || []).map((p, idx) => ({
        id: p.id,
        order_index: idx,
      }));

      await Promise.all(
        updates.map(async (u) => {
          const res = await fetch("/api/pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(u),
          });
          if (!res.ok) {
            throw new Error(
              `When posting /api/pages, the response was [${res.status}] ${res.statusText}`,
            );
          }
          return res.json();
        }),
      );

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", website?.id] });
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not reorder pages");
      queryClient.invalidateQueries({ queryKey: ["pages", website?.id] });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (pageId) => {
      const res = await fetch(`/api/pages?id=${pageId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(
          `When deleting /api/pages, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", website?.id] });
      toast.success("Page deleted");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not delete page");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (is_published) => {
      const res = await fetch("/api/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_id: clubId, is_published }),
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
      toast.success("Website status updated");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not update website status");
    },
  });

  return {
    addPageMutation,
    updatePageMutation,
    reorderPagesMutation,
    deletePageMutation,
    publishMutation,
  };
}
