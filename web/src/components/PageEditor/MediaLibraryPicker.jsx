"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
  X,
  Folder,
} from "lucide-react";
import { toast } from "sonner";

import useUpload from "@/utils/useUpload";

function looksLikeImageUrl(url) {
  if (typeof url !== "string") return false;
  const u = url.toLowerCase();
  return (
    u.includes(".png") ||
    u.includes(".jpg") ||
    u.includes(".jpeg") ||
    u.includes(".webp") ||
    u.includes(".gif") ||
    u.includes("image")
  );
}

function isImageItem(item) {
  const mime = typeof item?.mime_type === "string" ? item.mime_type : "";
  const url = typeof item?.url === "string" ? item.url : "";
  return mime.startsWith("image/") || looksLikeImageUrl(url);
}

export default function MediaLibraryPicker({
  open,
  onClose,
  onSelect,
  title,
  clubId,
  imagesOnly = true,
  defaultFolder = "website-assets",
  allowUpload = true,
  uploadFolder = "website-assets",
}) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState(defaultFolder || "");

  const [upload, { loading: uploading }] = useUpload();
  const uploadInputRef = useRef(null);

  // Reset search each time the picker opens.
  useEffect(() => {
    if (!open) return;
    setQ("");
    setFolder(defaultFolder || "");
  }, [open, defaultFolder]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["media", clubId, folder, q, imagesOnly],
    enabled: open,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clubId) params.set("clubId", String(clubId));
      if (folder) params.set("folder", folder);
      if (q.trim()) params.set("q", q.trim());
      params.set("limit", "200");

      const res = await fetch(`/api/media?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          json?.error ||
            `When fetching /api/media, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return json;
    },
    staleTime: 1000 * 10,
  });

  const items = useMemo(() => {
    const raw = Array.isArray(data?.items) ? data.items : [];
    if (!imagesOnly) return raw;
    return raw.filter(isImageItem);
  }, [data?.items, imagesOnly]);

  const folderOptions = useMemo(() => {
    const base = [
      { value: "", label: "All folders" },
      { value: "website-assets", label: "Website images" },
      { value: "club-configuration", label: "Logos / branding" },
      { value: "club-documents", label: "Documents" },
      { value: "imported", label: "Imported" },
      { value: "misc", label: "Misc" },
    ];

    if (imagesOnly) {
      // Keep documents, but it's fine if user wants to browse everything.
      return base;
    }

    return base;
  }, [imagesOnly]);

  const onPickUpload = useCallback(() => {
    if (!allowUpload) return;
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  }, [allowUpload]);

  const onFileSelected = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const result = await upload({
        file,
        folder: uploadFolder,
        // Try ClubSoft S3 first, but allow fallback uploads so the editor
        // isn't blocked if ClubSoft S3 presign isn't ready.
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Uploaded");

      if (typeof result?.url === "string" && result.url) {
        onSelect?.(result.url);
      }

      // reset input so uploading the same file twice works
      e.target.value = "";
    },
    [upload, uploadFolder, queryClient, onSelect],
  );

  const onBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose?.();
      }
    },
    [onClose],
  );

  if (!open) return null;

  const headerTitle =
    typeof title === "string" && title.trim() ? title.trim() : "Media library";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={onBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Choose media
            </div>
            <div className="text-xl font-extrabold text-[#111418]">
              {headerTitle}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Pick an existing upload, or upload something new.
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="p-2 rounded-2xl hover:bg-gray-50 text-gray-600"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="grid md:grid-cols-[1fr_220px_auto] gap-3 items-center">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-100 bg-white">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by filename or URL…"
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-400" />
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-white text-sm font-semibold"
              >
                {folderOptions.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {allowUpload ? (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={onPickUpload}
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#111418] text-white font-semibold hover:bg-black disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload
                </button>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept={imagesOnly ? "image/*" : "image/*,.pdf"}
                  className="hidden"
                  onChange={onFileSelected}
                />
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-800">
              {error instanceof Error ? error.message : "Could not load media"}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center">
              <div className="font-extrabold text-[#111418]">No media yet</div>
              <div className="mt-2 text-sm text-gray-600">
                Upload an image, or import items from pages in the Media
                library.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((it) => {
                const url = typeof it?.url === "string" ? it.url : "";
                const label =
                  typeof it?.original_filename === "string" &&
                  it.original_filename
                    ? it.original_filename
                    : typeof it?.folder === "string" && it.folder
                      ? it.folder
                      : "Media";

                const isImage = isImageItem(it);

                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => {
                      if (!url) return;
                      onSelect?.(url);
                    }}
                    className="text-left rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all"
                    title={label}
                  >
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      {isImage && url ? (
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-bold text-[#111418] truncate">
                        {label}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 truncate">
                        {url}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Tip: you can also manage uploads in{" "}
            <a className="underline" href="/admin/media">
              Media
            </a>
            .
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-white border border-gray-200 font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
