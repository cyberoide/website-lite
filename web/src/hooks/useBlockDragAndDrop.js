import { useState, useCallback } from "react";

export function useBlockDragAndDrop(blocks, setBlocks) {
  const [draggingBlockId, setDraggingBlockId] = useState(null);
  const [dragOverBlockId, setDragOverBlockId] = useState(null);

  const reorderBlocksById = useCallback((list, fromId, toId) => {
    if (!Array.isArray(list) || !fromId || !toId) return list;
    if (String(fromId) === String(toId)) return list;

    const fromIndex = list.findIndex((b) => String(b.id) === String(fromId));
    const toIndex = list.findIndex((b) => String(b.id) === String(toId));
    if (fromIndex < 0 || toIndex < 0) return list;

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  }, []);

  const onBlockDragStart = useCallback((e, blockId) => {
    setDraggingBlockId(blockId);
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(blockId));
    } catch (err) {
      // ignore
    }
  }, []);

  const onBlockDragOver = useCallback((e, blockId) => {
    e.preventDefault();
    setDragOverBlockId(blockId);
  }, []);

  const onBlockDrop = useCallback(
    (e, blockId) => {
      e.preventDefault();
      const dragged = draggingBlockId || e.dataTransfer.getData("text/plain");
      if (!dragged || !blockId || String(dragged) === String(blockId)) {
        setDraggingBlockId(null);
        setDragOverBlockId(null);
        return;
      }

      const next = reorderBlocksById(blocks || [], dragged, blockId);
      setBlocks(next);
      setDraggingBlockId(null);
      setDragOverBlockId(null);
    },
    [blocks, draggingBlockId, reorderBlocksById, setBlocks],
  );

  const onBlockDragEnd = useCallback(() => {
    setDraggingBlockId(null);
    setDragOverBlockId(null);
  }, []);

  return {
    draggingBlockId,
    dragOverBlockId,
    onBlockDragStart,
    onBlockDragOver,
    onBlockDrop,
    onBlockDragEnd,
  };
}
