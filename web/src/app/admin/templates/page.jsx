"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutTemplate,
  Plus,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminTemplatesPage() {
  const queryClient = useQueryClient();
  const { isClubSoftAdmin } = useWebsiteLiteSession();

  const [hoveredTemplateKey, setHoveredTemplateKey] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch("/api/templates");
      if (!res.ok) {
        throw new Error(
          `When fetching /api/templates, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
  });

  const templates = useMemo(() => {
    const items = Array.isArray(data?.templates) ? data.templates : [];
    return items.map((t) => ({
      key: t.key,
      name: t.name,
      description: t.description || "",
      source: t.source || "built-in",
      is_enabled: t.is_enabled !== false,
    }));
  }, [data?.templates]);

  const previewSrc = hoveredTemplateKey
    ? `/template-preview/${hoveredTemplateKey}`
    : null;

  const upsertTemplateMutation = useMutation({
    mutationFn: async ({
      template_key,
      name,
      description,
      definition,
      is_enabled,
    }) => {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_key,
          name,
          description,
          definition,
          is_enabled,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Could not save template");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template saved");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not save template");
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateKey) => {
      const res = await fetch(`/api/templates?templateKey=${templateKey}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Could not delete template");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not delete template");
    },
  });

  const fetchTemplateDefinition = useCallback(async (templateKey) => {
    const res = await fetch(
      `/api/templates/preview?templateKey=${templateKey}`,
    );
    if (!res.ok) {
      throw new Error(
        `When fetching /api/templates/preview, the response was [${res.status}] ${res.statusText}`,
      );
    }
    const data = await res.json();
    const tpl = data?.template;
    return {
      template: tpl,
      definition: {
        theme: tpl?.theme || {},
        pages: tpl?.pages || [],
      },
    };
  }, []);

  const onDuplicate = useCallback(
    async (templateKey) => {
      if (typeof window === "undefined") return;

      const rawKey = window.prompt("New template key", `custom-${Date.now()}`);
      if (!rawKey) return;
      const newKey = slugify(rawKey);
      if (!newKey) {
        toast.error("Invalid key");
        return;
      }

      const rawName = window.prompt("Template name", "Custom Template");
      if (!rawName) return;
      const newName = rawName.trim();
      if (!newName) return;

      const rawDesc = window.prompt("Short description (optional)", "") || "";

      try {
        const { definition } = await fetchTemplateDefinition(templateKey);

        upsertTemplateMutation.mutate({
          template_key: newKey,
          name: newName,
          description: rawDesc,
          definition,
          is_enabled: true,
        });
      } catch (e) {
        console.error(e);
        toast.error("Could not duplicate template");
      }
    },
    [upsertTemplateMutation, fetchTemplateDefinition],
  );

  const onToggleEnabled = useCallback(
    async (t) => {
      if (typeof window === "undefined") return;

      if (t.source === "built-in") {
        toast.message("Built-in templates can’t be disabled.");
        return;
      }

      try {
        const { definition } = await fetchTemplateDefinition(t.key);

        upsertTemplateMutation.mutate({
          template_key: t.key,
          name: t.name,
          description: t.description,
          definition,
          is_enabled: !t.is_enabled,
        });
      } catch (e) {
        console.error(e);
        toast.error("Could not update template");
      }
    },
    [upsertTemplateMutation, fetchTemplateDefinition],
  );

  const onDelete = useCallback(
    (t) => {
      if (typeof window === "undefined") return;
      if (t.source === "built-in") {
        toast.message("Built-in templates can’t be deleted");
        return;
      }
      const ok = window.confirm("Delete this template? This can’t be undone.");
      if (!ok) return;
      deleteTemplateMutation.mutate(t.key);
    },
    [deleteTemplateMutation],
  );

  if (!isClubSoftAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-xl font-extrabold text-[#111418] mb-2">
            Platform Admin
          </div>
          <div className="text-gray-500">
            Only ClubSoft admins can access platform-level template controls.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Could not load";
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-sm text-red-600">
        {message}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111418] flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6" />
            Platform Admin
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Internal tools for ClubSoft admins. For most clubs, you’ll just pick
            one of the 4 built-in website styles from the Branding page.
          </p>
        </div>
      </div>

      {/* Hover Preview (desktop only) */}
      {previewSrc && (
        <div className="hidden lg:block fixed z-50 right-[40px] top-[120px] w-[520px] h-[340px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-none">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Template preview
            </div>
          </div>
          <div className="w-full h-full overflow-hidden bg-white">
            <iframe
              title="Template preview"
              src={previewSrc}
              className="border-0"
              style={{
                width: 1400,
                height: 900,
                transform: "scale(0.36)",
                transformOrigin: "top left",
              }}
            />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((t) => {
          const badge =
            t.source === "built-in"
              ? { text: "Built-in", className: "bg-gray-100 text-gray-600" }
              : { text: "Custom", className: "bg-amber-50 text-amber-700" };

          return (
            <div
              key={t.key}
              onMouseEnter={() => setHoveredTemplateKey(t.key)}
              onMouseLeave={() => setHoveredTemplateKey(null)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-extrabold text-[#111418]">{t.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t.description}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${badge.className}`}
                    >
                      {badge.text}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                      {t.key}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {t.source !== "built-in" && (
                    <a
                      href={`/admin/templates/edit/${t.key}`}
                      className="p-2 rounded-xl hover:bg-gray-50 text-gray-700"
                      title="Edit template"
                    >
                      <Pencil className="w-5 h-5" />
                    </a>
                  )}

                  <button
                    onClick={() => onDuplicate(t.key)}
                    className="p-2 rounded-xl hover:bg-gray-50 text-gray-700"
                    title="Duplicate"
                  >
                    <Copy className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => onToggleEnabled(t)}
                    className="p-2 rounded-xl hover:bg-gray-50 text-gray-700"
                    title={t.is_enabled ? "Disable" : "Enable"}
                  >
                    {t.is_enabled ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => onDelete(t)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={`/template-preview/${t.key}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-800"
                >
                  Preview
                </a>
                <a
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-sm font-semibold text-[#0066FF]"
                >
                  <Plus className="w-4 h-4" />
                  Apply from dashboard
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-sm text-gray-500">
        Tip: you can preview templates here. The recommended workflow is still:
        pick a Website Style in Branding, then use the Page Editor to adjust the
        pages.
      </div>
    </div>
  );
}
