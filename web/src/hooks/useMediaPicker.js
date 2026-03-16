import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export function useMediaPicker(canEdit) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTitle, setMediaPickerTitle] = useState("Media library");
  const [mediaPickerImagesOnly, setMediaPickerImagesOnly] = useState(true);
  const [mediaPickerDefaultFolder, setMediaPickerDefaultFolder] =
    useState("website-assets");
  const [mediaPickerUploadFolder, setMediaPickerUploadFolder] =
    useState("website-assets");
  const onMediaSelectedRef = useRef(null);

  const closeMediaPicker = useCallback(() => {
    setMediaPickerOpen(false);
    onMediaSelectedRef.current = null;
  }, []);

  const openMediaPicker = useCallback(
    (options) => {
      if (!canEdit) {
        toast.error("Read-only access");
        return;
      }
      const safeTitle =
        typeof options?.title === "string" && options.title.trim()
          ? options.title.trim()
          : "Media library";
      const safeImagesOnly =
        typeof options?.imagesOnly === "boolean" ? options.imagesOnly : true;
      const safeDefaultFolder =
        typeof options?.defaultFolder === "string" &&
        options.defaultFolder.trim()
          ? options.defaultFolder.trim()
          : "website-assets";
      const safeUploadFolder =
        typeof options?.uploadFolder === "string" && options.uploadFolder.trim()
          ? options.uploadFolder.trim()
          : safeDefaultFolder;

      const onSelect =
        typeof options?.onSelect === "function" ? options.onSelect : null;

      setMediaPickerTitle(safeTitle);
      setMediaPickerImagesOnly(safeImagesOnly);
      setMediaPickerDefaultFolder(safeDefaultFolder);
      setMediaPickerUploadFolder(safeUploadFolder);
      onMediaSelectedRef.current = onSelect;
      setMediaPickerOpen(true);
    },
    [canEdit],
  );

  const handleMediaSelected = useCallback(
    (url) => {
      const onSelect = onMediaSelectedRef.current;
      if (typeof onSelect === "function") {
        try {
          onSelect(url);
        } catch (e) {
          console.error(e);
          toast.error("Could not use selected media");
        }
      }
      closeMediaPicker();
    },
    [closeMediaPicker],
  );

  return {
    mediaPickerOpen,
    mediaPickerTitle,
    mediaPickerImagesOnly,
    mediaPickerDefaultFolder,
    mediaPickerUploadFolder,
    closeMediaPicker,
    openMediaPicker,
    handleMediaSelected,
  };
}
