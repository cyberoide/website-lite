"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Import,
  Loader2,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import useUpload from "@/utils/useUpload";
import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";

function looksLikeImageUrl(url) {
  const u = typeof url === "string" ? url.toLowerCase() : "";
  return (
    u.endsWith(".png") ||
    u.endsWith(".jpg") ||
    u.endsWith(".jpeg") ||
    u.endsWith(".webp") ||
    u.endsWith(".gif") ||
    u.endsWith(".svg")
  );
}

function collectUrlsDeep(value, out) {
  if (!value) return;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      out.add(trimmed);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const v of value) collectUrlsDeep(v, out);
    return;
  }

  if (typeof value === "object") {
    for (const k of Object.keys(value)) {
      collectUrlsDeep(value[k], out);
    }
  }
}

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const {
    session,
    isClubViewer,
    isClubEditor,
    isClubSoftAdmin,
    isLoading: sessionLoading,
    readOnly,
  } = useWebsiteLiteSession();
  const clubId = session?.club_id;

  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("");
  const [uploadFolder, setUploadFolder] = useState("website-assets");

  const [upload, { loading: uploading }] = useUpload();
  const uploadInputRef = useRef(null);

  const hasClubSelected = !!clubId;
  const showUnauthed = !sessionLoading && (!session || !isClubViewer);
  const showNeedClub = !showUnauthed && !hasClubSelected;

  const { data: website } = useQuery({
    queryKey: ["website", clubId],
    enabled: !!clubId && isClubViewer,
    queryFn: async () => {
      const res = await fetch(`/api/website?clubId=${clubId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When fetching /api/website, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
  });

  const {
    data: mediaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["media", clubId, folder, q],
    enabled: !!clubId && isClubViewer,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("clubId", String(clubId));
      if (folder) params.set("folder", folder);
      if (q.trim()) params.set("q", q.trim());
      params.set("limit", "120");

      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When fetching /api/media, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    staleTime: 1000 * 10,
  });

  const items = Array.isArray(mediaData?.items) ? mediaData.items : [];

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When deleting /api/media, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", clubId] });
      toast.success("Removed from media library");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not remove media");
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const websiteId = website?.id;
      if (!websiteId) {
        throw new Error("Website not loaded yet");
      }

      const pagesRes = await fetch(`/api/pages?websiteId=${websiteId}`);
      const pagesData = await pagesRes.json().catch(() => ({}));
      if (!pagesRes.ok) {
        throw new Error(
          pagesData?.error ||
            `When fetching /api/pages, the response was [${pagesRes.status}] ${pagesRes.statusText}`,
        );
      }

      const pages = Array.isArray(pagesData) ? pagesData : [];
      const urlSet = new Set();

      for (const p of pages) {
        let content = p?.content;
        if (typeof content === "string") {
          try {
            content = JSON.parse(content);
          } catch {
            content = null;
          }
        }
        collectUrlsDeep(content, urlSet);
      }

      const urls = Array.from(urlSet).filter((u) => {
        // Keep this permissive, but avoid importing random links.
        const isLikelyImage = looksLikeImageUrl(u);
        const isKnownCdn =
          u.includes("ucarecdn.com") ||
          u.includes("amazonaws.com") ||
          u.includes("cloudfront.net");

        return isLikelyImage || isKnownCdn;
      });

      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls,
          folder: "imported",
          source: "page_import",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/media, the response was [${res.status}] ${res.statusText}`,
        );
      }

      return { imported: urls.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["media", clubId] });
      toast.success(
        `Imported ${result?.imported || 0} items from pages into the library`,
      );
    },
    onError: (e) => {
      console.error(e);
      const message = e instanceof Error ? e.message : "Could not import";
      toast.error(message);
    },
  });

  const onPickUpload = useCallback(() => {
    if (readOnly) return;
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  }, [readOnly]);

  const onFileSelected = useCallback(
    async (e) => {
      if (readOnly) {
        toast.error("Read-only access");
        return;
      }

      const file = e.target.files?.[0];
      if (!file) return;

      const result = await upload({
        file,
        folder: uploadFolder,
        // NOTE: We try ClubSoft S3 first (best), but allow fallback uploads
        // so the editor isn't blocked if the ClubSoft presign endpoint is down.
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["media", clubId] });
      toast.success("Uploaded to media library");

      // reset input so uploading the same file twice works
      e.target.value = "";
    },
    [readOnly, upload, uploadFolder, queryClient, clubId],
  );

  const folderOptions = useMemo(() => {
    return [
      { value: "", label: "All folders" },
      { value: "website-assets", label: "Website images" },
      { value: "club-configuration", label: "Logos / branding" },
      { value: "club-documents", label: "Documents" },
      { value: "imported", label: "Imported from pages" },
      { value: "misc", label: "Misc" },
    ];
  }, []);

  const uploadFolderOptions = useMemo(() => {
    return [
      { value: "website-assets", label: "Website images" },
      { value: "club-configuration", label: "Logos / branding" },
      { value: "club-documents", label: "Documents" },
      { value: "misc", label: "Misc" },
    ];
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-[#0066FF]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#111418]">
                Media library
              </div>
              <div className="text-gray-500">
                Uploads try ClubSoft S3 first (so you can reuse them in
                ClubSoft), with a fallback so you can keep working.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPickUpload}
              disabled={uploading || showUnauthed || showNeedClub || readOnly}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-[#111418] text-white font-semibold hover:bg-black disabled:opacity-60"
              title={
                readOnly
                  ? "Read-only access"
                  : showNeedClub
                    ? "Select a club first"
                    : ""
              }
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload
            </button>

            <button
              type="button"
              onClick={() => importMutation.mutate()}
              disabled={
                !website?.id ||
                importMutation.isPending ||
                showNeedClub ||
                readOnly
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 bg-white font-semibold hover:bg-gray-50 disabled:opacity-60"
              title={
                showNeedClub
                  ? "Select a club first"
                  : "Scan your pages and add any image URLs to this library"
              }
            >
              {importMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Import className="w-4 h-4" />
              )}
              Import from pages
            </button>

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={onFileSelected}
            />
          </div>
        </div>

        {showUnauthed ? (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="font-bold text-[#111418]">Sign in required</div>
            <div className="text-sm text-gray-600 mt-1">
              You need to be signed in as a club editor to view the media
              library.
            </div>
            <a
              href="/admin/login"
              className="inline-flex mt-4 items-center justify-center px-4 py-2 rounded-2xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC]"
            >
              Go to login
            </a>
          </div>
        ) : null}

        {showNeedClub ? (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="font-bold text-[#111418]">Select a club</div>
            <div className="text-sm text-gray-600 mt-1">
              You’re signed in, but there’s no club selected yet. Pick one from
              the <span className="font-semibold">Editing club</span> dropdown
              in the left menu.
            </div>
            {isClubSoftAdmin ? (
              <a
                href="/admin/clubs"
                className="inline-flex mt-4 items-center justify-center px-4 py-2 rounded-2xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC]"
              >
                Go to Clubs
              </a>
            ) : null}
          </div>
        ) : null}

        {!showUnauthed && !showNeedClub ? (
          <div className="mt-6 grid md:grid-cols-[1fr_220px_220px] gap-3">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by filename or URL…"
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>

            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-semibold"
            >
              {folderOptions.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-semibold"
              title="Where new uploads should be stored"
            >
              {uploadFolderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Upload to: {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {!showUnauthed && !showNeedClub ? (
          <div className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-800">
                {error instanceof Error
                  ? error.message
                  : "Could not load media"}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center">
                <div className="font-extrabold text-[#111418]">
                  No media yet
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Upload an image, or import from pages to pull in existing
                  URLs.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((it) => {
                  const url = it?.url;
                  const mimeType =
                    typeof it?.mime_type === "string" ? it.mime_type : "";

                  const isImage =
                    mimeType.startsWith("image/") || looksLikeImageUrl(url);

                  const labelFromFilename =
                    typeof it?.original_filename === "string" &&
                    it.original_filename
                      ? it.original_filename
                      : "";

                  const labelFromFolder =
                    typeof it?.folder === "string" && it.folder
                      ? it.folder
                      : "";

                  const label = labelFromFilename || labelFromFolder || "Media";

                  const sourceText = it?.source ? String(it.source) : "";
                  const folderText = it?.folder ? String(it.folder) : "";
                  const metaLine =
                    sourceText && folderText
                      ? `${sourceText} • ${folderText}`
                      : sourceText
                        ? sourceText
                        : folderText
                          ? folderText
                          : "";

                  return (
                    <div
                      key={it.id}
                      className="rounded-2xl border border-gray-100 overflow-hidden bg-white"
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
                        {metaLine ? (
                          <div className="text-[11px] text-gray-500 mt-1 truncate">
                            {metaLine}
                          </div>
                        ) : null}

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!url) return;
                              try {
                                if (navigator?.clipboard?.writeText) {
                                  await navigator.clipboard.writeText(url);
                                  toast.success("Copied URL");
                                } else {
                                  toast.error("Clipboard not available");
                                }
                              } catch (e) {
                                toast.error("Could not copy");
                              }
                            }}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                            title="Open"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(it.id)}
                            disabled={deleteMutation.isPending || readOnly}
                            className="ml-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-60"
                            title={
                              readOnly
                                ? "Read-only access"
                                : "Remove from library (does not delete from S3)"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 text-xs text-gray-500">
              Note: removing an item here only removes it from the media
              library. It does not delete the underlying file from S3.
            </div>
          </div>
        ) : null}

        {readOnly && !showUnauthed && !showNeedClub ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-extrabold">Read-only access</div>
            <div className="mt-1 text-amber-800">
              You can browse and copy media links, but uploads and deletes are
              disabled.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
