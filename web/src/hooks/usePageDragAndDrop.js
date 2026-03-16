import { useState, useCallback } from "react";

export function usePageDragAndDrop(
  pages,
  queryClient,
  reorderPagesMutation,
  websiteId,
) {
  const [draggingPageId, setDraggingPageId] = useState(null);
  const [dragOverPageId, setDragOverPageId] = useState(null);

  const reorderByIds = useCallback((list, fromId, toId) => {
    if (!Array.isArray(list) || !fromId || !toId) return list;
    if (fromId === toId) return list;

    const fromIndex = list.findIndex((p) => String(p.id) === String(fromId));
    const toIndex = list.findIndex((p) => String(p.id) === String(toId));
    if (fromIndex < 0 || toIndex < 0) return list;

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  }, []);

  const onDragStart = useCallback((e, pageId) => {
    setDraggingPageId(pageId);
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(pageId));
    } catch (err) {
      // ignore
    }
  }, []);

  const onDragOverRow = useCallback((e, pageId) => {
    e.preventDefault();
    setDragOverPageId(pageId);
  }, []);

  const onDropRow = useCallback(
    (e, pageId) => {
      e.preventDefault();
      const dragged = draggingPageId || e.dataTransfer.getData("text/plain");
      if (!dragged || !pageId || String(dragged) === String(pageId)) {
        setDraggingPageId(null);
        setDragOverPageId(null);
        return;
      }

      const nextPages = reorderByIds(pages || [], dragged, pageId);
      queryClient.setQueryData(["pages", websiteId], nextPages);
      reorderPagesMutation.mutate(nextPages);

      setDraggingPageId(null);
      setDragOverPageId(null);
    },
    [
      draggingPageId,
      pages,
      queryClient,
      reorderByIds,
      reorderPagesMutation,
      websiteId,
    ],
  );

  const onDragEnd = useCallback(() => {
    setDraggingPageId(null);
    setDragOverPageId(null);
  }, []);

  return {
    draggingPageId,
    dragOverPageId,
    onDragStart,
    onDragOverRow,
    onDropRow,
    onDragEnd,
  };
}
