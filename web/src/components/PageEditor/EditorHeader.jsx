import { ArrowLeft, Eye, Loader2, Save } from "lucide-react";

export function EditorHeader({
  pageTitle,
  previewHref,
  canEdit,
  saveMutation,
  onSave,
}) {
  return (
    <div className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/admin/pages"
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-600"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Page Editor
            </div>
            <div className="font-extrabold text-[#111418] truncate">
              {pageTitle || "Untitled page"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {previewHref && (
            <a
              href={previewHref}
              target="_blank"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200"
            >
              <Eye className="w-4 h-4" />
              Preview
            </a>
          )}

          <button
            onClick={onSave}
            disabled={saveMutation.isPending || !canEdit}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#111418] text-white font-semibold hover:bg-black transition-all disabled:opacity-60"
            title={canEdit ? "" : "Read-only access"}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
