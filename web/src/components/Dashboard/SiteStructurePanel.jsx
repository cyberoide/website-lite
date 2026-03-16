import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

export default function SiteStructurePanel({ website, clubId }) {
  const queryClient = useQueryClient();

  const initialMode = useMemo(() => {
    return website?.navigation_mode === "single" ? "single" : "multi";
  }, [website?.navigation_mode]);

  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const saveMutation = useMutation({
    mutationFn: async (nextMode) => {
      const res = await fetch("/api/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: clubId,
          navigation_mode: nextMode,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/website, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website", clubId] });
      toast.success("Site navigation updated");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not update site navigation");
    },
  });

  const onSave = useCallback(() => {
    const next = mode === "single" ? "single" : "multi";
    saveMutation.mutate(next);
  }, [mode, saveMutation]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#111418] mb-1 flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5" />
        Site navigation
      </h3>
      <div className="text-xs text-gray-400 mb-4">
        Choose how your top menu is built.
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="navMode"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
            className="mt-1"
          />
          <div>
            <div className="font-semibold text-[#111418]">Multiple pages</div>
            <div className="text-xs text-gray-500">
              Menu shows your enabled pages (Home, Membership, Leadership,
              etc.).
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="navMode"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
            className="mt-1"
          />
          <div>
            <div className="font-semibold text-[#111418]">
              One-page sections
            </div>
            <div className="text-xs text-gray-500">
              Menu includes section links from your Home page (anchors), plus
              any other enabled pages you keep.
            </div>
          </div>
        </label>

        <button
          type="button"
          onClick={onSave}
          disabled={saveMutation.isPending || !clubId}
          className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#111418] text-white font-semibold hover:bg-black disabled:opacity-60"
        >
          {saveMutation.isPending ? "Saving…" : "Save navigation"}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Tip: To add a section to the one-page menu, edit the Home page and add
        both a “Nav label” and an “Anchor” on a section block. To hide/show
        pages in the menu, use the “Visible” toggle in the Page editor.
      </div>
    </div>
  );
}
