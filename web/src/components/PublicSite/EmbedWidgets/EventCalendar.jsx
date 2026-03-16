import React from "react";
import { Calendar } from "lucide-react";

const CLUBSOFT_BASE_URL = "https://app.clubsoft.co";

export function EventCalendar({ clubSlug }) {
  const safeClubSlug = typeof clubSlug === "string" ? clubSlug.trim() : "";

  if (!safeClubSlug) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2 font-bold text-[#111418]">
          <Calendar className="w-5 h-5 text-[#0066FF]" />
          Upcoming Events
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Events calendar needs a club selected.
        </div>
      </div>
    );
  }

  const src = `${CLUBSOFT_BASE_URL}/events/embed/${encodeURIComponent(safeClubSlug)}`;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Calendar className="w-6 h-6 text-[#0066FF]" />
        Upcoming Events
      </h3>

      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <iframe
          src={src}
          title="ClubSoft Events Calendar"
          width="100%"
          height="900"
          scrolling="no"
          frameBorder="0"
          loading="lazy"
          style={{ border: "none", background: "transparent" }}
        />
      </div>

      <div className="text-xs text-gray-500">
        If this doesn’t load, open it in a new tab:{" "}
        <a className="underline" href={src} target="_blank" rel="noreferrer">
          View events
        </a>
      </div>
    </div>
  );
}
