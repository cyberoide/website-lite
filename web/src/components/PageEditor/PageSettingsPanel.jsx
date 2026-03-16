import { Settings2, Loader2, Save } from "lucide-react";

export function PageSettingsPanel({
  pageTitle,
  setPageTitle,
  pageSlug,
  setPageSlug,
  pageEnabled,
  setPageEnabled,
  onSavePageSettings,
  updatePageMutation,
  canEdit,
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="font-extrabold text-[#111418] flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-400" />
          Page settings
        </div>
      </div>

      <div className="p-5">
        <label className="block text-xs font-bold text-gray-400 uppercase">
          Title
        </label>
        <input
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-2xl border border-gray-100"
          placeholder="Home"
          disabled={!canEdit}
        />

        <label className="block mt-4 text-xs font-bold text-gray-400 uppercase">
          Slug
        </label>
        <input
          value={pageSlug}
          onChange={(e) => setPageSlug(e.target.value)}
          className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-sm"
          placeholder="home"
          disabled={!canEdit}
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">
              Visible
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {pageEnabled ? "Enabled" : "Disabled"}
            </div>
          </div>
          <button
            onClick={() => setPageEnabled((v) => !v)}
            className={`px-4 py-2 rounded-2xl font-semibold transition-all ${
              pageEnabled
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            disabled={!canEdit}
          >
            {pageEnabled ? "On" : "Off"}
          </button>
        </div>

        <button
          onClick={onSavePageSettings}
          disabled={updatePageMutation.isPending || !canEdit}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-[#111418] text-white font-semibold hover:bg-black disabled:opacity-60"
        >
          {updatePageMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save settings
        </button>
      </div>
    </div>
  );
}
