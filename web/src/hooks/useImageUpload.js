import { useCallback, useRef } from "react";
import { toast } from "sonner";
import useUpload from "@/utils/useUpload";

export function useImageUpload() {
  const [upload, { loading: uploading }] = useUpload();
  const logoInputRef = useRef(null);
  const iconInputRef = useRef(null);

  const onPickLogo = useCallback(() => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  }, []);

  const onPickIcon = useCallback(() => {
    if (iconInputRef.current) {
      iconInputRef.current.click();
    }
  }, []);

  const createUploadHandler = useCallback(
    (onSuccess, successMessage) => async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const result = await upload({
        file,
        folder: "club-configuration",
        // Try ClubSoft S3 first, but allow fallback uploads so branding
        // updates still work if ClubSoft S3 presign is unavailable.
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      onSuccess(result.url);
      toast.success(successMessage);
    },
    [upload],
  );

  return {
    uploading,
    logoInputRef,
    iconInputRef,
    onPickLogo,
    onPickIcon,
    createUploadHandler,
  };
}
