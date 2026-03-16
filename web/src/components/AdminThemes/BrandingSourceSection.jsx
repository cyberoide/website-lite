import { CloudDownload, Loader2 } from "lucide-react";

export function BrandingSourceSection({
  localBrandingSource,
  setLocalBrandingSource,
  onSyncBranding,
  isClubSoftSource,
  disabledStyle,
  localPrimary,
  setLocalPrimary,
  localSecondary,
  setLocalSecondary,
  isSyncing,
  lastSyncedAt,
}) {
  const syncedLabel =
    typeof lastSyncedAt === "string" && lastSyncedAt.trim()
      ? new Date(lastSyncedAt).toLocaleString()
      : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-bold text-[#111418]">Branding Source</div>
          <div className="text-sm text-gray-500 mt-1">
            If you pick ClubSoft, this site will mirror the branding from the
            main app.
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1">
          <button
            onClick={() => setLocalBrandingSource("clubsoft")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isClubSoftSource
                ? "bg-[#111418] text-white"
                : "text-gray-600 hover:text-black"
            }`}
          >
            ClubSoft
          </button>
          <button
            onClick={() => setLocalBrandingSource("custom")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              !isClubSoftSource
                ? "bg-[#111418] text-white"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center">
        <button
          onClick={onSyncBranding}
          disabled={!!isSyncing}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-[#0066FF] rounded-2xl font-semibold hover:bg-blue-100 transition-all disabled:opacity-60"
        >
          {isSyncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CloudDownload className="w-4 h-4" />
          )}
          {isSyncing ? "Pulling…" : "Pull from ClubSoft now"}
        </button>

        <div className="text-sm text-gray-500">
          {syncedLabel ? `Last synced: ${syncedLabel}` : ""}
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <div className={disabledStyle}>
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">
            Primary Color
          </div>
          <input
            type="color"
            value={localPrimary}
            onChange={(e) => setLocalPrimary(e.target.value)}
            className="w-full h-[44px] bg-transparent"
            aria-label="Primary color"
          />
          <input
            className="mt-3 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm"
            value={localPrimary}
            onChange={(e) => setLocalPrimary(e.target.value)}
          />
        </div>

        <div className={disabledStyle}>
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">
            Secondary Color
          </div>
          <input
            type="color"
            value={localSecondary}
            onChange={(e) => setLocalSecondary(e.target.value)}
            className="w-full h-[44px] bg-transparent"
            aria-label="Secondary color"
          />
          <input
            className="mt-3 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm"
            value={localSecondary}
            onChange={(e) => setLocalSecondary(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
