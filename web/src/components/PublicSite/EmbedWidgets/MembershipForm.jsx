import React from "react";
import { Users } from "lucide-react";

const CLUBSOFT_BASE_URL = "https://app.clubsoft.co";
const MEMBERSHIP_FORM_SLUG = "membership-application";

export function MembershipForm({ clubSlug }) {
  const safeClubSlug = typeof clubSlug === "string" ? clubSlug.trim() : "";

  if (!safeClubSlug) {
    return (
      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
        <div className="text-center">
          <Users className="w-12 h-12 text-[#0066FF] mx-auto mb-4" />
          <h3 className="text-2xl font-bold">Apply for Membership</h3>
          <p className="text-gray-500 mt-2">This form needs a club selected.</p>
        </div>
      </div>
    );
  }

  const src = `${CLUBSOFT_BASE_URL}/contact-form/${MEMBERSHIP_FORM_SLUG}?club=${encodeURIComponent(safeClubSlug)}`;

  return (
    <div className="bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100">
      <div className="text-center mb-6">
        <Users className="w-12 h-12 text-[#0066FF] mx-auto mb-4" />
        <h3 className="text-2xl font-bold">Apply for Membership</h3>
        <p className="text-gray-500">Powered by ClubSoft</p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
        <iframe
          src={src}
          title="ClubSoft Membership Application"
          width="100%"
          height="1100"
          scrolling="yes"
          frameBorder="0"
          loading="lazy"
          style={{ border: "none", background: "transparent" }}
        />
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        If this doesn’t load, open it in a new tab:{" "}
        <a className="underline" href={src} target="_blank" rel="noreferrer">
          Membership application
        </a>
      </div>
    </div>
  );
}
