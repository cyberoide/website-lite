import React from "react";
import { Eye, LayoutTemplate, X } from "lucide-react";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
      {children}
    </span>
  );
}

export function ThemeTemplatesSection({
  templateCards,
  activeTemplateKey,
  previewTemplateKey,
  templatePreviewSrc,
  templatePreviewHelp,
  isNewSite,
  pagesCount,
  pagesError,
  onApplyTemplate,
  isApplying,
  onTemplateHover,
  onTemplateLeave,
  onPreviewTemplate,
  onClearPreview,
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingKey, setPendingKey] = React.useState(null);
  const [includePages, setIncludePages] = React.useState(false);

  const safePagesCount = Number.isFinite(Number(pagesCount))
    ? Number(pagesCount)
    : 0;

  const openConfirm = React.useCallback(
    (key) => {
      setPendingKey(key);

      // For brand new sites (no pages yet), default to including starter pages.
      // For existing sites, default to safe mode: keep pages.
      setIncludePages(isNewSite);

      setConfirmOpen(true);
    },
    [isNewSite],
  );

  const closeConfirm = React.useCallback(() => {
    setConfirmOpen(false);
    setPendingKey(null);
  }, []);

  const pendingTemplate =
    templateCards.find((t) => t.key === pendingKey) || null;

  const applyLabel = includePages
    ? "Apply style + starter pages"
    : "Apply style";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-[#111418] mb-1 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5" />
          Website Styles
        </h3>

        {previewTemplateKey && (
          <button
            type="button"
            onClick={onClearPreview}
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#111418]"
          >
            <X className="w-4 h-4" />
            Clear preview
          </button>
        )}
      </div>

      <div className="text-xs text-gray-400 mb-4">
        Pick a look for your header + footer.
        <span className="block mt-1">
          Branding stays the same (colors, logo, fonts, contact info, and social
          links).
        </span>
      </div>

      {pagesError && (
        <div className="mb-4 text-xs text-red-600">
          Could not check your current pages. Applying a style will still be
          safe by default.
        </div>
      )}

      <div className="space-y-3">
        {templateCards.map((t) => {
          const isActive = t.key === activeTemplateKey;
          const isPreviewing = t.key === previewTemplateKey;

          const outerClassName = isPreviewing
            ? "border-blue-200 bg-blue-50/40"
            : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30";

          return (
            <div
              key={t.key}
              className={`w-full p-4 rounded-2xl border transition-all ${outerClassName}`}
              onMouseEnter={() => onTemplateHover(t.key)}
              onMouseLeave={onTemplateLeave}
              onFocus={() => onTemplateHover(t.key)}
              onBlur={onTemplateLeave}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onPreviewTemplate(t.key)}
                  className="text-left flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-[#111418] truncate">
                      {t.title}
                    </div>
                    {isActive && <Badge>Active</Badge>}
                    {isPreviewing && !isActive && <Badge>Previewing</Badge>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t.description}
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewTemplate(t.key)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                    title="Preview this style"
                    aria-label="Preview this style"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openConfirm(t.key)}
                    disabled={isApplying}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-extrabold text-sm bg-[#111418] text-white hover:bg-black disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {templateCards.length === 0 && (
          <div className="text-sm text-gray-500">No styles found.</div>
        )}
      </div>

      {/* Inline preview for mobile/touch (desktop still gets the floating preview) */}
      {templatePreviewSrc && (
        <div className="mt-5 lg:hidden">
          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Preview
                </div>
                {templatePreviewHelp && (
                  <div className="text-xs text-gray-500 mt-1">
                    {templatePreviewHelp}
                  </div>
                )}
              </div>
              {previewTemplateKey && (
                <button
                  type="button"
                  onClick={onClearPreview}
                  className="text-xs font-bold text-gray-500 hover:text-[#111418]"
                >
                  Clear
                </button>
              )}
            </div>
            <div
              className="w-full overflow-hidden bg-white"
              style={{ height: 280 }}
            >
              <iframe
                title="Theme preview"
                src={templatePreviewSrc}
                className="border-0"
                style={{
                  width: 1200,
                  height: 900,
                  transform: "scale(0.32)",
                  transformOrigin: "top left",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmOpen && pendingTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeConfirm}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Confirm style change
                  </div>
                  <h4 className="mt-1 text-lg font-black text-[#111418]">
                    Apply “{pendingTemplate.title}”?
                  </h4>
                  <div className="mt-2 text-sm text-gray-600">
                    This will replace style and layout only.
                    <span className="font-semibold">
                      {" "}
                      Branding and pages stay
                    </span>
                    .
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeConfirm}
                  className="p-2 rounded-xl hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isNewSite && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-bold text-amber-900">
                    Optional: Replace pages with starter pages
                  </div>
                  <div className="text-xs text-amber-800 mt-1">
                    Only turn this on if you want this style’s starter pages. If
                    you’ve already added real content, keep it off.
                  </div>

                  <label className="mt-3 flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePages}
                      onChange={(e) => setIncludePages(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-amber-900">
                      Replace my pages ({safePagesCount}) with this style’s
                      starter pages
                    </span>
                  </label>
                </div>
              )}

              {isNewSite && (
                <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="text-sm font-bold text-blue-900">
                    New site detected
                  </div>
                  <div className="text-xs text-blue-800 mt-1">
                    You don’t have any pages yet, so we’ll include starter pages
                    to get you launched.
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApplying}
                onClick={() => {
                  onApplyTemplate({
                    templateKey: pendingTemplate.key,
                    includePages: includePages || isNewSite,
                  });
                  closeConfirm();
                }}
                className="px-4 py-2 rounded-xl font-extrabold text-sm bg-[#111418] text-white hover:bg-black disabled:opacity-50"
              >
                {applyLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
