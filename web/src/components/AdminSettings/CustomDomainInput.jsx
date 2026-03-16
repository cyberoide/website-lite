import { Save, ShieldCheck, RefreshCw } from "lucide-react";

export function CustomDomainInput({
  customDomainInput,
  onInputChange,
  onSave,
  onActivate,
  onRefresh,
  isSaving,
  isActivating,
  isRefreshing,
  normalizedDomain,
  hasCustomDomain,
}) {
  return (
    <div className="mt-4">
      <label className="block text-xs font-bold text-gray-400 uppercase">
        Custom domain
      </label>
      <input
        value={customDomainInput}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="exampleyachtclub.com"
        className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-mono text-sm"
      />
      <div className="mt-2 text-xs text-gray-500">
        Paste the domain only (no path). If you paste a full URL, we'll clean
        it.
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#111418] text-white font-semibold hover:bg-black disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving…" : "Save domain"}
        </button>

        <button
          type="button"
          onClick={onActivate}
          disabled={!normalizedDomain || isActivating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] disabled:opacity-60"
        >
          <ShieldCheck className="w-4 h-4" />
          {isActivating ? "Activating…" : "Activate domain"}
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={!hasCustomDomain || isRefreshing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className="w-4 h-4" />
          {isRefreshing ? "Refreshing…" : "Refresh status"}
        </button>
      </div>
    </div>
  );
}
