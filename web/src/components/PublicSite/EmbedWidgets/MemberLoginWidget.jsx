import React from "react";
import { Lock } from "lucide-react";

const CLUBSOFT_BASE_URL = "https://app.clubsoft.co";

export function MemberLoginWidget({ clubSlug }) {
  const safeClubSlug = typeof clubSlug === "string" ? clubSlug.trim() : "";

  const signinUrl = safeClubSlug
    ? `${CLUBSOFT_BASE_URL}/account/signin?club=${encodeURIComponent(safeClubSlug)}`
    : `${CLUBSOFT_BASE_URL}/account/signin`;

  const embedUrl = safeClubSlug
    ? `${CLUBSOFT_BASE_URL}/account/embed/signin?club=${encodeURIComponent(safeClubSlug)}`
    : `${CLUBSOFT_BASE_URL}/account/embed/signin`;

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
          <Lock className="w-6 h-6 text-[color:var(--primary)]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold text-xl text-[#111418] truncate">
            Member Login
          </h3>
          <div className="text-xs text-gray-500 font-semibold">
            Secure sign-in powered by ClubSoft
          </div>
        </div>
      </div>

      {!safeClubSlug && (
        <div className="mb-4 text-sm text-gray-500">
          Tip: this works best when the website has a club slug.
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
        <iframe
          src={embedUrl}
          title="ClubSoft Member Sign In"
          width="100%"
          height="650"
          scrolling="no"
          frameBorder="0"
          loading="lazy"
          style={{ border: "none", background: "transparent" }}
        />
      </div>

      <div className="mt-3 text-xs text-gray-500">
        If this doesn’t load, open sign in in a new tab:{" "}
        <a
          className="underline"
          href={signinUrl}
          target="_blank"
          rel="noreferrer"
        >
          ClubSoft sign in
        </a>
      </div>
    </div>
  );
}
