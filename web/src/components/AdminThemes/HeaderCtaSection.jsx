import { BadgeCheck } from "lucide-react";

export function HeaderCtaSection({
  localHeaderCtaEnabled,
  setLocalHeaderCtaEnabled,
  localHeaderCtaAction,
  setLocalHeaderCtaAction,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#111418] mb-1 flex items-center gap-2">
        <BadgeCheck className="w-5 h-5" />
        Header button
      </h3>
      <div className="text-xs text-gray-400 mb-4">
        Optional call-to-action button(s) in the top navigation.
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-[#111418]">Enable</div>
          <div className="text-xs text-gray-500">
            Great for “Join Us” and/or “Member Login”.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setLocalHeaderCtaEnabled((v) => !v)}
          className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${
            localHeaderCtaEnabled ? "bg-[#0B3A67]" : "bg-gray-200"
          }`}
          aria-label="Toggle header CTA"
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-sm transition-all ${
              localHeaderCtaEnabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {localHeaderCtaEnabled && (
        <div className="mt-5">
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Button options
          </label>
          <select
            value={localHeaderCtaAction}
            onChange={(e) => setLocalHeaderCtaAction(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold"
          >
            <option value="join">Join Us</option>
            <option value="login">Member Login</option>
            <option value="both">Both</option>
          </select>

          <div className="mt-3 text-xs text-gray-500">
            Buttons will try to go to matching pages (like “Membership” or
            “Member Login”), or fall back to section anchors on one-page sites.
          </div>
        </div>
      )}
    </div>
  );
}
