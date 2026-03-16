"use client";

import { useEffect } from "react";

const CLUBSOFT_ICON_URL =
  "https://ucarecdn.com/5ad3e895-53f3-4ee3-a38a-7db9275851c5/-/format/auto/";

function upsertLink({ rel, href, type, sizes }) {
  if (typeof document === "undefined") return;

  const head = document.head;
  if (!head) return;

  let link = head.querySelector(`link[rel='${rel}']`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    head.appendChild(link);
  }

  link.setAttribute("href", href);
  if (type) link.setAttribute("type", type);
  if (sizes) link.setAttribute("sizes", sizes);
}

async function resolveSlugFromHost(hostname) {
  if (typeof hostname !== "string" || !hostname.trim()) return null;

  try {
    const res = await fetch(
      `/api/public/resolve-host?host=${encodeURIComponent(hostname)}`,
    );
    if (!res.ok) {
      return null;
    }
    const data = await res.json().catch(() => ({}));
    const slug = data?.slug;
    if (typeof slug === "string" && slug.trim()) {
      return slug;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function resolveIconUrlFromRoute() {
  if (typeof window === "undefined") return CLUBSOFT_ICON_URL;

  const path = window.location.pathname || "";
  const host = window.location.hostname || "";

  // Public site (path-based): /s/{slug}
  let slug = null;
  if (path.startsWith("/s/")) {
    slug = path.split("/")[2] || null;
  } else {
    // Public site (host-based): {slug}.clubsoft.site or custom domains
    slug = await resolveSlugFromHost(host);
  }

  if (slug) {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("preview") === "1" ? "1" : "0";

    try {
      const res = await fetch(`/api/public/${slug}?preview=${preview}`);
      if (res.ok) {
        const data = await res.json();
        const iconUrl =
          data?.website?.icon_url ||
          data?.website?.logo_url ||
          data?.club?.logo_url ||
          null;
        if (typeof iconUrl === "string" && iconUrl.trim()) {
          return iconUrl;
        }
      }
    } catch (e) {
      console.error("Could not resolve favicon", e);
    }
  }

  return CLUBSOFT_ICON_URL;
}

export default function Favicon() {
  useEffect(() => {
    let alive = true;

    const apply = async () => {
      const url = await resolveIconUrlFromRoute();
      if (!alive) return;

      // Set favicon + iOS touch icon.
      upsertLink({
        rel: "icon",
        href: url,
        type: "image/png",
      });

      upsertLink({
        rel: "apple-touch-icon",
        href: url,
      });
    };

    apply();

    // If the user navigates using history without a full reload, re-apply.
    const onPop = () => apply();
    window.addEventListener("popstate", onPop);

    return () => {
      alive = false;
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return null;
}
