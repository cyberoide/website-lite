import { Heading1, Hash, Paintbrush } from "lucide-react";

export function SectionHeaderBlock({ data, onUpdate }) {
  const background = data.background || "none";
  const align = data.align || "center";

  const backgroundColor =
    typeof data.backgroundColor === "string" ? data.backgroundColor : "";

  const overrideHeadingColor =
    typeof data.overrideHeadingColor === "string"
      ? data.overrideHeadingColor
      : "";

  const overrideBodyTextColor =
    typeof data.overrideBodyTextColor === "string"
      ? data.overrideBodyTextColor
      : "";

  const previewClassName =
    background === "dark"
      ? "bg-[#111418] text-white"
      : background === "light"
        ? "bg-gray-50"
        : background === "custom"
          ? ""
          : "bg-white";

  const previewStyle =
    background === "custom" && backgroundColor
      ? { backgroundColor }
      : undefined;

  const previewHeadingStyle = overrideHeadingColor
    ? { color: overrideHeadingColor }
    : background === "dark"
      ? undefined
      : undefined;

  const previewBodyStyle = overrideBodyTextColor
    ? { color: overrideBodyTextColor }
    : background === "dark"
      ? undefined
      : undefined;

  const anchorValue = typeof data.anchor === "string" ? data.anchor.trim() : "";
  const navLabelValue =
    typeof data.navLabel === "string" ? data.navLabel.trim() : "";
  const showsNavBadge = !!anchorValue && !!navLabelValue;

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Heading1 className="w-4 h-4" />
        Section Header
      </div>

      <div
        className={`rounded-2xl border border-gray-100 p-6 md:p-8 ${previewClassName}`}
        style={previewStyle}
      >
        <div className={align === "center" ? "text-center" : "text-left"}>
          {data.eyebrow && (
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] opacity-70"
              style={previewBodyStyle}
            >
              {data.eyebrow}
            </div>
          )}
          <div
            className="text-2xl md:text-4xl font-black mt-2"
            style={previewHeadingStyle}
          >
            {data.heading || "Section heading"}
          </div>
          {data.subheading && (
            <div
              className="mt-3 opacity-80 max-w-3xl mx-auto"
              style={previewBodyStyle}
            >
              {data.subheading}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.eyebrow || ""}
          onChange={(e) => onUpdate({ eyebrow: e.target.value })}
          placeholder="Eyebrow (small label)"
        />
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.heading || ""}
          onChange={(e) => onUpdate({ heading: e.target.value })}
          placeholder="Heading"
        />
      </div>

      <textarea
        className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm min-h-[90px]"
        value={data.subheading || ""}
        onChange={(e) => onUpdate({ subheading: e.target.value })}
        placeholder="Subheading"
      />

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Anchor ID
          </div>
          <input
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-mono"
            value={data.anchor || ""}
            onChange={(e) => onUpdate({ anchor: e.target.value })}
            placeholder="e.g. about, membership"
          />
        </div>

        <div>
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">
            Nav Label (optional)
          </div>
          <input
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
            value={data.navLabel || ""}
            onChange={(e) => onUpdate({ navLabel: e.target.value })}
            placeholder="e.g. About"
          />

          {showsNavBadge && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-bold">
              This block will appear in the menu
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">
            Style
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold"
              value={align}
              onChange={(e) => onUpdate({ align: e.target.value })}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
            </select>
            <select
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold"
              value={background}
              onChange={(e) => onUpdate({ background: e.target.value })}
            >
              <option value="none">None</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {(background === "custom" ||
        overrideHeadingColor ||
        overrideBodyTextColor) && (
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            Custom colors
          </div>

          {background === "custom" && (
            <div className="mb-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                Background
              </div>
              <div className="grid grid-cols-[44px_1fr] gap-3 items-center">
                <input
                  type="color"
                  value={backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    onUpdate({ backgroundColor: e.target.value })
                  }
                  className="w-11 h-9 rounded-lg border border-gray-200 bg-white"
                  aria-label="Background color"
                />
                <input
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono"
                  value={backgroundColor}
                  onChange={(e) =>
                    onUpdate({ backgroundColor: e.target.value })
                  }
                  placeholder="#ffffff"
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                Heading (optional override)
              </div>
              <input
                type="color"
                value={overrideHeadingColor || "#111418"}
                onChange={(e) =>
                  onUpdate({ overrideHeadingColor: e.target.value })
                }
                className="w-full h-9 rounded-lg border border-gray-200 bg-white"
                aria-label="Heading color override"
              />
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-gray-600 hover:text-black"
                onClick={() => onUpdate({ overrideHeadingColor: "" })}
              >
                Reset heading color
              </button>
            </div>

            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                Body (optional override)
              </div>
              <input
                type="color"
                value={overrideBodyTextColor || "#6B7280"}
                onChange={(e) =>
                  onUpdate({ overrideBodyTextColor: e.target.value })
                }
                className="w-full h-9 rounded-lg border border-gray-200 bg-white"
                aria-label="Body color override"
              />
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-gray-600 hover:text-black"
                onClick={() => onUpdate({ overrideBodyTextColor: "" })}
              >
                Reset body color
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Tip: Add <span className="font-mono">anchor</span> +{" "}
        <span className="font-mono">navLabel</span> and your site can auto-build
        a one-page menu.
      </div>
    </div>
  );
}
