import { Layout } from "lucide-react";

export function PageOptionsPanel({
  presetPages,
  existingSlugs,
  onAddPresetPage,
  addPageMutation,
  readOnly = false,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#111418] mb-1 flex items-center gap-2">
        <Layout className="w-5 h-5" />
        Page Options
      </h3>
      <div className="text-xs text-gray-400 mb-4">
        Quick-add common pages and ClubSoft features.
      </div>

      {readOnly ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 font-semibold">
          Read-only: you can’t add pages.
        </div>
      ) : null}

      <div className="space-y-2">
        {presetPages.map((p) => {
          const added = existingSlugs.has(p.slug);
          const label = added ? "Added" : "Add";

          const disabled = readOnly || added || addPageMutation.isPending;

          const buttonClass =
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all " +
            (added || readOnly
              ? "bg-gray-100 text-gray-500"
              : "bg-blue-50 text-[#0066FF] hover:bg-blue-100");

          return (
            <div
              key={p.key}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-gray-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <p.Icon className="w-5 h-5 text-[#0066FF]" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#111418] truncate">
                    {p.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {p.description}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onAddPresetPage(p)}
                disabled={disabled}
                className={buttonClass}
                title={readOnly ? "Read-only access" : ""}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-400 mt-4">
        Tip: you can rename/reorder pages anytime.
      </div>
    </div>
  );
}
