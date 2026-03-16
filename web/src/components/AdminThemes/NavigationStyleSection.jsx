import React from "react";
import { Navigation2 } from "lucide-react";

function ColorField({ label, value, onChange, disabled }) {
  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
        {label}
      </label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[44px] bg-transparent"
        aria-label={label}
      />
      <input
        className="mt-3 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function NavigationStyleSection({
  localNavColorMode,
  setLocalNavColorMode,
  localNavLinkColor,
  setLocalNavLinkColor,
  localNavActiveColor,
  setLocalNavActiveColor,
  localHeadingTextColor,
  localPrimaryColor,
}) {
  const isCustom = localNavColorMode === "custom";

  const safeHeadingColor =
    typeof localHeadingTextColor === "string" && localHeadingTextColor.trim()
      ? localHeadingTextColor
      : "#111418";
  const safePrimary =
    typeof localPrimaryColor === "string" && localPrimaryColor.trim()
      ? localPrimaryColor
      : "#0066FF";

  const previewLinkColor = isCustom ? localNavLinkColor : safeHeadingColor;
  const previewActiveColor = isCustom ? localNavActiveColor : safePrimary;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#111418] mb-1 flex items-center gap-2">
        <Navigation2 className="w-5 h-5" />
        Header & menu
      </h3>
      <div className="text-xs text-gray-400 mb-4">
        Control the menu link colors. By default we match your heading text.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Menu link colors
          </label>
          <select
            value={localNavColorMode}
            onChange={(e) => setLocalNavColorMode(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold"
          >
            <option value="auto">Match heading text</option>
            <option value="custom">Custom</option>
          </select>

          <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Preview
            </div>
            <div className="mt-2 flex items-center gap-6 flex-wrap">
              <span
                className="text-sm font-extrabold uppercase tracking-widest"
                style={{ color: previewLinkColor }}
              >
                Home
              </span>
              <span
                className="text-sm font-extrabold uppercase tracking-widest"
                style={{ color: previewActiveColor }}
              >
                Events
              </span>
              <span
                className="text-sm font-extrabold uppercase tracking-widest opacity-70"
                style={{ color: previewLinkColor }}
              >
                Contact
              </span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Active link uses your primary color unless you customize it.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ColorField
            label="Menu link color"
            value={localNavLinkColor}
            onChange={setLocalNavLinkColor}
            disabled={!isCustom}
          />
          <ColorField
            label="Menu active color"
            value={localNavActiveColor}
            onChange={setLocalNavActiveColor}
            disabled={!isCustom}
          />
        </div>
      </div>
    </div>
  );
}
