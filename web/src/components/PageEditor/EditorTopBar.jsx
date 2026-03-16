import { ArrowLeft, Save, Loader2 } from "lucide-react";

export function EditorTopBar({ page, onSave, isSaving }) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/admin/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </a>
          <div>
            <h1 className="font-bold text-[#111418] leading-none">
              {page?.title}
            </h1>
            <span className="text-xs text-gray-400 font-medium">
              Editing Page Content
            </span>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-[#111418] text-white rounded-full font-semibold hover:bg-black transition-all shadow-lg disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}
