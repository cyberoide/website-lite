"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";
import useUpload from "@/utils/useUpload";

import { createBlock } from "@/utils/blockDefaults";
import { EditorTopBar } from "@/components/PageEditor/EditorTopBar";
import { BlockControls } from "@/components/PageEditor/BlockControls";
import { BlockRenderer } from "@/components/PageEditor/BlockRenderer";
import { EmptyState } from "@/components/PageEditor/EmptyState";
import { AddBlockToolbar } from "@/components/PageEditor/AddBlockToolbar";

function safeString(value) {
  if (typeof value === "string") return value;
  return "";
}

export default function TemplateEditorPage({ params }) {
  const { isClubSoftAdmin } = useWebsiteLiteSession();
  const queryClient = useQueryClient();
  const { key } = params;

  const isBuiltInKey = useMemo(() => {
    return ["coastal", "classic", "rivr", "journey"].includes(String(key));
  }, [key]);

  const [upload, { loading: uploading }] = useUpload();

  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0066FF");
  const [secondaryColor, setSecondaryColor] = useState("#111418");

  const [pages, setPages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [blocks, setBlocks] = useState([]);

  const didHydrateRef = useRef(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["templatePreview", key],
    queryFn: async () => {
      const res = await fetch(`/api/templates/preview?templateKey=${key}`);
      if (!res.ok) {
        throw new Error(
          `When fetching /api/templates/preview, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    onSuccess: (resData) => {
      const tpl = resData?.template;
      if (!tpl || didHydrateRef.current) return;

      didHydrateRef.current = true;

      setTemplateName(safeString(tpl.name) || key);
      setTemplateDescription(safeString(tpl.description));
      setPrimaryColor(safeString(tpl?.theme?.primary_color) || "#0066FF");
      setSecondaryColor(safeString(tpl?.theme?.secondary_color) || "#111418");

      const initialPages = Array.isArray(tpl.pages) ? tpl.pages : [];
      setPages(initialPages);

      const first = initialPages[0];
      const initialBlocks = Array.isArray(first?.content) ? first.content : [];
      setSelectedIndex(0);
      setBlocks(initialBlocks);
    },
  });

  const currentPage = useMemo(() => {
    if (!Array.isArray(pages) || pages.length === 0) return null;
    return pages[selectedIndex] || pages[0] || null;
  }, [pages, selectedIndex]);

  const commitCurrentBlocks = useCallback(() => {
    if (!Array.isArray(pages) || pages.length === 0) return;

    setPages((prev) => {
      const next = [...prev];
      const existing = next[selectedIndex];
      if (!existing) return prev;
      next[selectedIndex] = { ...existing, content: blocks };
      return next;
    });
  }, [blocks, pages, selectedIndex]);

  const onSelectPage = useCallback(
    (idx) => {
      if (!Array.isArray(pages) || pages.length === 0) return;

      commitCurrentBlocks();
      const nextIndex = Number.parseInt(String(idx), 10);
      const resolved = Number.isFinite(nextIndex) ? nextIndex : 0;
      setSelectedIndex(resolved);

      const nextPage = pages[resolved];
      const nextBlocks = Array.isArray(nextPage?.content)
        ? nextPage.content
        : [];
      setBlocks(nextBlocks);
    },
    [commitCurrentBlocks, pages],
  );

  const updateBlockData = useCallback(
    (blockId, newData) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId ? { ...b, data: { ...b.data, ...newData } } : b,
        ),
      );
    },
    [setBlocks],
  );

  const removeBlock = useCallback(
    (blockId) => {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    },
    [setBlocks],
  );

  const moveBlock = useCallback(
    (index, direction) => {
      setBlocks((prev) => {
        const next = [...prev];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= next.length) return prev;
        [next[index], next[newIndex]] = [next[newIndex], next[index]];
        return next;
      });
    },
    [setBlocks],
  );

  const uploadAndSet = useCallback(
    async (file, blockId, field) => {
      const result = await upload({
        file,
        folder: "website-assets",
        // Try ClubSoft S3 first, but allow fallback uploads so template editing
        // isn't blocked if ClubSoft S3 presign isn't ready.
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
        updateBlockData(blockId, { images: nextImages });
        toast.success("Image uploaded");
        return;
      }

      updateBlockData(blockId, { [field]: result.url });
      toast.success("Image uploaded");
    },
    [upload, blocks, updateBlockData],
  );

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Could not save template");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templatePreview", key] });
      toast.success("Template saved");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not save template");
    },
  });

  const onSave = useCallback(() => {
    commitCurrentBlocks();

    const cleanedPages = (pages || []).map((p, idx) => {
      const content = idx === selectedIndex ? blocks : p?.content;
      const normalized = Array.isArray(content) ? content : [];
      return {
        title: safeString(p?.title) || `Page ${idx + 1}`,
        slug: safeString(p?.slug) || `page-${idx + 1}`,
        type: safeString(p?.type) || "custom",
        is_enabled: typeof p?.is_enabled === "boolean" ? p.is_enabled : true,
        content: normalized,
      };
    });

    const payload = {
      template_key: key,
      name: templateName || key,
      description: templateDescription || "",
      is_enabled: true,
      definition: {
        theme: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
        },
        pages: cleanedPages,
      },
    };

    saveMutation.mutate(payload);
  }, [
    key,
    templateName,
    templateDescription,
    primaryColor,
    secondaryColor,
    pages,
    selectedIndex,
    blocks,
    commitCurrentBlocks,
    saveMutation,
  ]);

  const addBlock = useCallback(
    (type) => {
      const newBlock = createBlock(type);
      setBlocks((prev) => [...prev, newBlock]);
    },
    [setBlocks],
  );

  if (!isClubSoftAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-xl font-extrabold text-[#111418] mb-2">
            Template editor
          </div>
          <div className="text-gray-500">
            Only ClubSoft admins can edit templates.
          </div>
        </div>
      </div>
    );
  }

  if (isBuiltInKey) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <a
          href="/admin/templates"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-xl font-extrabold text-[#111418] mb-2">
            Built-in Website Styles are locked
          </div>
          <div className="text-gray-500">
            The built-in styles (coastal, classic, rivr, journey) are maintained
            by ClubSoft and can’t be edited here. If you want a custom version,
            duplicate one of them to create a new custom template key.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Could not load";
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <a
          href="/admin/templates"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
        <div className="mt-6 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-800">
          {message}
        </div>
      </div>
    );
  }

  const topBarPage = {
    title: templateName || key,
    slug: `template:${key}`,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <EditorTopBar
        page={topBarPage}
        onSave={onSave}
        isSaving={saveMutation.isPending}
      />

      <div className="max-w-6xl mx-auto px-6 pt-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <a
            href="/admin/templates"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to templates
          </a>

          <button
            onClick={onSave}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#111418] text-white font-semibold hover:bg-black transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            Save template
          </button>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
            <div className="font-extrabold text-[#111418]">
              Template settings
            </div>

            <label className="block mt-4 text-xs font-bold text-gray-400 uppercase">
              Name
            </label>
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100"
            />

            <label className="block mt-4 text-xs font-bold text-gray-400 uppercase">
              Description
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 min-h-[90px]"
            />

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Primary
                </label>
                <input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Secondary
                </label>
                <input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold text-gray-400 uppercase">
                Page
              </label>
              <select
                value={selectedIndex}
                onChange={(e) => onSelectPage(e.target.value)}
                className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100"
              >
                {(pages || []).map((p, idx) => {
                  const label = safeString(p?.title) || `Page ${idx + 1}`;
                  const slug = safeString(p?.slug);
                  const optionLabel = slug ? `${label} (/${slug})` : label;
                  return (
                    <option key={idx} value={idx}>
                      {optionLabel}
                    </option>
                  );
                })}
              </select>
              <div className="text-xs text-gray-500 mt-2">
                Tip: you can adjust anchors + nav labels from “Section Header”
                blocks.
              </div>
            </div>

            <div
              className="mt-6 rounded-2xl p-4 text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              <div className="text-sm font-bold">Theme preview</div>
              <div className="text-xs text-white/80 mt-1">
                Primary + Secondary
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <div className="text-sm font-bold text-[#111418]">
                Editing: {currentPage?.title || "Page"}
              </div>
              <div className="text-xs text-gray-500">
                Key: <span className="font-mono">{key}</span>
              </div>
            </div>

            <div className="max-w-3xl">
              <div className="space-y-6 mb-12">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="relative group bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all p-6"
                  >
                    <BlockControls
                      onMoveUp={() => moveBlock(index, "up")}
                      onMoveDown={() => moveBlock(index, "down")}
                      onRemove={() => removeBlock(block.id)}
                    />

                    <BlockRenderer
                      block={block}
                      onUpdate={(newData) => updateBlockData(block.id, newData)}
                      onUpload={(file, field) =>
                        uploadAndSet(file, block.id, field)
                      }
                      upload={upload}
                      uploading={uploading}
                    />
                  </div>
                ))}

                {blocks.length === 0 && <EmptyState />}
              </div>

              <AddBlockToolbar onAddBlock={addBlock} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
