import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { createBlock } from "@/utils/blockDefaults";

export function useBlockOperations(
  canEdit,
  blocks,
  setBlocks,
  updateBlockData,
  removeBlock,
  moveBlock,
  upload,
) {
  const containerRefs = useRef({});
  const [collapsed, setCollapsed] = useState({});

  const safeUpdateBlockData = useCallback(
    (blockId, newData) => {
      if (!canEdit) return;
      updateBlockData(blockId, newData);
    },
    [canEdit, updateBlockData],
  );

  const safeRemoveBlock = useCallback(
    (blockId) => {
      if (!canEdit) return;
      removeBlock(blockId);
    },
    [canEdit, removeBlock],
  );

  const safeMoveBlock = useCallback(
    (idx, dir) => {
      if (!canEdit) return;
      moveBlock(idx, dir);
    },
    [canEdit, moveBlock],
  );

  const addBlock = useCallback(
    (type) => {
      if (!canEdit) {
        toast.error("Read-only access");
        return;
      }
      const newBlock = createBlock(type);
      setBlocks((prev) => [...(Array.isArray(prev) ? prev : []), newBlock]);

      // expand newly added block
      setCollapsed((prev) => ({ ...prev, [newBlock.id]: false }));

      // scroll after paint
      setTimeout(() => {
        const el = containerRefs.current?.[newBlock.id];
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    },
    [canEdit, setBlocks],
  );

  const uploadAndSet = useCallback(
    async (file, blockId, field) => {
      if (!canEdit) {
        toast.error("Read-only access");
        return;
      }
      const result = await upload({
        file,
        folder: "website-assets",
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Special case: gallery image upload uses a synthetic field like "__gallery__0"
      if (typeof field === "string" && field.startsWith("__gallery__")) {
        const idxRaw = field.replace("__gallery__", "");
        const idx = Number.parseInt(idxRaw, 10);
        const block = blocks.find((b) => b.id === blockId);
        const currentImages = Array.isArray(block?.data?.images)
          ? block.data.images
          : [];

        if (!Number.isFinite(idx) || idx < 0 || idx >= currentImages.length) {
          console.error("Invalid gallery index", { field, idx });
          toast.error("Could not place image into gallery");
          return;
        }

        const nextImages = currentImages.map((img, i) =>
          i === idx ? { ...img, url: result.url } : img,
        );
        safeUpdateBlockData(blockId, { images: nextImages });
        toast.success("Image uploaded");
        return;
      }

      safeUpdateBlockData(blockId, { [field]: result.url });
      toast.success("Image uploaded");
    },
    [canEdit, upload, blocks, safeUpdateBlockData],
  );

  const onToggleCollapse = useCallback((blockId) => {
    setCollapsed((prev) => ({ ...prev, [blockId]: !prev?.[blockId] }));
  }, []);

  return {
    containerRefs,
    collapsed,
    safeUpdateBlockData,
    safeRemoveBlock,
    safeMoveBlock,
    addBlock,
    uploadAndSet,
    onToggleCollapse,
  };
}
