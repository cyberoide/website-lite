import { ArrowLeft, Save, Loader2 } from "lucide-react";

export function ThemeHeader({ onSave, isSaving, canEdit = true }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <a
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
        <h1 className="text-3xl font-extrabold text-[#111418] mt-3">
          Branding
        </h1>
        <p className="text-gray-500 mt-2">
          Pick a website style, then set your colors, logo, and contact info.
        </p>
        {!canEdit ? (
          <div className="mt-3 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
            Read-only
          </div>
        ) : null}
      </div>

      <button
        onClick={onSave}
        disabled={isSaving || !canEdit}
        className="flex items-center gap-2 px-6 py-2 bg-[#111418] text-white rounded-full font-semibold hover:bg-black transition-all shadow-lg disabled:opacity-60"
        title={!canEdit ? "Read-only access" : ""}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save
      </button>
    </div>
  );
}
