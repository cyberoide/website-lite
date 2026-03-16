import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function normalizeBlocks(content) {
  let c = content;

  // Some pg drivers can return json/jsonb as a string.
  if (typeof c === "string") {
    try {
      c = JSON.parse(c);
    } catch (e) {
      c = [];
    }
  }

  if (!Array.isArray(c)) {
    return [];
  }

  return c;
}

export function usePageEditor(id) {
  const queryClient = useQueryClient();
  const [blocks, setBlocks] = useState([]);

  const pageId = Number.parseInt(String(id), 10);

  const {
    data: page,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["page", pageId],
    enabled: Number.isFinite(pageId),
    queryFn: async () => {
      const res = await fetch(`/api/pages?id=${pageId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error ||
            `When fetching /api/pages, the response was [${res.status}] ${res.statusText}`,
        );
      }
      const resData = await res.json();
      return resData?.[0] || null;
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const initializedForPageId = useRef(null);
  useEffect(() => {
    if (!page || !Number.isFinite(page?.id)) {
      return;
    }

    // IMPORTANT: initialize blocks from DB exactly once per page load.
    // React Query v5 does not reliably run onSuccess callbacks in useQuery.
    if (initializedForPageId.current !== page.id) {
      setBlocks(normalizeBlocks(page?.content));
      initializedForPageId.current = page.id;
    }
  }, [page]);

  const saveMutation = useMutation({
    mutationFn: async (updatedContent) => {
      if (!Number.isFinite(pageId)) {
        throw new Error("Invalid page id");
      }

      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pageId, content: updatedContent }),
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
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page saved successfully");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not save page");
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async (fields) => {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pageId, ...fields }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/pages, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page settings saved");
      return updated;
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not save page settings");
    },
  });

  const updateBlockData = useCallback((blockId, newData) => {
    setBlocks((prev) =>
      (Array.isArray(prev) ? prev : []).map((b) =>
        b.id === blockId
          ? { ...b, data: { ...(b.data || {}), ...newData } }
          : b,
      ),
    );
  }, []);

  const updateNested = useCallback(
    (blockId, path, value) => {
      setBlocks((prev) =>
        (Array.isArray(prev) ? prev : []).map((b) => {
          if (b.id !== blockId) {
            return b;
          }

          const dataCopy = { ...(b.data || {}) };

          let cursor = dataCopy;
          for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            const nextKey = path[i + 1];

            if (typeof key === "number") {
              continue;
            }

            if (!(key in cursor)) {
              cursor[key] = typeof nextKey === "number" ? [] : {};
            }

            cursor = cursor[key];

            if (typeof nextKey === "number" && !Array.isArray(cursor)) {
              cursor = [];
            }
          }

          const last = path[path.length - 1];
          if (typeof last === "number") {
            return { ...b, data: dataCopy };
          }

          cursor[last] = value;
          return { ...b, data: dataCopy };
        }),
      );
    },
    [setBlocks],
  );

  const removeBlock = useCallback((blockId) => {
    setBlocks((prev) =>
      (Array.isArray(prev) ? prev : []).filter((b) => b.id !== blockId),
    );
  }, []);

  const moveBlock = useCallback((index, direction) => {
    setBlocks((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const next = [...current];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= next.length) return current;
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  }, []);

  return {
    page,
    isLoading,
    error,
    blocks,
    setBlocks,
    saveMutation,
    updatePageMutation,
    updateBlockData,
    updateNested,
    removeBlock,
    moveBlock,
  };
}
