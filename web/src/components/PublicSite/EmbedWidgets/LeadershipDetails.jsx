import React from "react";

const CLUBSOFT_BASE_URL = "https://app.clubsoft.co";

export function LeadershipDetails({ clubSlug, view = "executive-trustees" }) {
  const safeClubSlug = typeof clubSlug === "string" ? clubSlug.trim() : "";
  const safeView =
    typeof view === "string" && view.trim()
      ? view.trim()
      : "executive-trustees";

  if (!safeClubSlug) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-gray-100 text-gray-500">
        Leadership embed needs a club selected.
      </div>
    );
  }

  const src = `${CLUBSOFT_BASE_URL}/leadership/${encodeURIComponent(safeClubSlug)}?view=${encodeURIComponent(safeView)}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
      <iframe
        src={src}
        title="ClubSoft Leadership"
        width="100%"
        height="780"
        scrolling="no"
        frameBorder="0"
        loading="lazy"
        style={{ border: "none", background: "transparent" }}
      />
    </div>
  );
}
