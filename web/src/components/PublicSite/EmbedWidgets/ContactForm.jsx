import React from "react";
import { Mail } from "lucide-react";

const CLUBSOFT_BASE_URL = "https://app.clubsoft.co";
const CONTACT_FORM_SLUG = "contact";

export function ContactForm({ clubSlug }) {
  const safeClubSlug = typeof clubSlug === "string" ? clubSlug.trim() : "";

  if (!safeClubSlug) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-50 border border-blue-50">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Mail className="w-7 h-7 text-[#0066FF]" />
          Get in Touch
        </h3>
        <div className="text-sm text-gray-500">
          This form needs a club selected.
        </div>
      </div>
    );
  }

  const src = `${CLUBSOFT_BASE_URL}/contact-form/${CONTACT_FORM_SLUG}?club=${encodeURIComponent(safeClubSlug)}`;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-50 border border-blue-50">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Mail className="w-7 h-7 text-[#0066FF]" />
        Get in Touch
      </h3>

      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <iframe
          src={src}
          title="ClubSoft Contact Form"
          width="100%"
          height="900"
          scrolling="no"
          frameBorder="0"
          loading="lazy"
          style={{ border: "none", background: "transparent" }}
        />
      </div>

      <div className="mt-3 text-xs text-gray-500">
        If this doesn’t load, open it in a new tab:{" "}
        <a className="underline" href={src} target="_blank" rel="noreferrer">
          Contact form
        </a>
      </div>
    </div>
  );
}
