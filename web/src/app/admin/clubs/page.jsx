"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const STYLE_OPTIONS = [
  { key: "coastal", label: "Coastal Modern" },
  { key: "classic", label: "Classic Yacht" },
  { key: "rivr", label: "Rivr Landing" },
  { key: "journey", label: "Journey One-Page" },
];

export default function AdminClubsPage() {
  const queryClient = useQueryClient();
  const { isClubSoftAdmin } = useWebsiteLiteSession();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [templateKey, setTemplateKey] = useState("coastal");

  const { data, isLoading, error } = useQuery({
    queryKey: ["clubs"],
    enabled: isClubSoftAdmin,
    queryFn: async () => {
      const res = await fetch("/api/clubs");
      if (!res.ok) {
        throw new Error(
          `When fetching /api/clubs, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
  });

  const clubs = useMemo(() => {
    const list = Array.isArray(data?.clubs) ? data.clubs : [];
    return list;
  }, [data?.clubs]);

  const createClubMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/clubs, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      toast.success("Club created");
      setName("");
      setSlug("");
      setTemplateKey("coastal");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Could not create club");
    },
  });

  const onGenerateSlug = useCallback(() => {
    const next = slugify(name);
    setSlug(next);
  }, [name]);

  const onCreate = useCallback(() => {
    const n = name.trim();
    const s = slugify(slug);

    if (!n) {
      toast.error("Club name is required");
      return;
    }
    if (!s) {
      toast.error("Club slug is required");
      return;
    }

    createClubMutation.mutate({ name: n, slug: s, templateKey });
  }, [createClubMutation, name, slug, templateKey]);

  if (!isClubSoftAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-xl font-extrabold text-[#111418] mb-2">
            Platform Admin
          </div>
          <div className="text-gray-500">
            Only ClubSoft admins can create/provision clubs.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111418] flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Clubs
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Internal provisioning tool for ClubSoft admins. Long-term, the main
            ClubSoft app should remain the source of truth — this is great for
            testing and early rollout.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="font-bold text-[#111418]">Create a club website</div>
        <div className="text-sm text-gray-500 mt-1">
          Creates the club, a website record, and starter pages from the chosen
          website style.
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
              Club name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm"
              placeholder="Harbor Boating Club"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
              Website style
            </label>
            <select
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold"
            >
              {STYLE_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
              Club slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-mono"
              placeholder="harbor-boating-club"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={onGenerateSlug}
              className="w-full px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            type="button"
            onClick={onCreate}
            disabled={createClubMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#111418] hover:bg-black text-white font-semibold disabled:opacity-60"
          >
            {createClubMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create club
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="font-bold text-[#111418]">All clubs</div>
        {isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <div className="mt-4 text-sm text-red-600">
            {error instanceof Error ? error.message : "Could not load clubs"}
          </div>
        ) : (
          <div className="mt-4 divide-y">
            {clubs.map((c) => (
              <div
                key={c.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-[#111418]">{c.name}</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {c.slug}
                  </div>
                </div>
                <a
                  href={`/s/${c.slug}?preview=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#0066FF] hover:underline"
                >
                  Preview
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
