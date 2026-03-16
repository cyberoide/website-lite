import { PanelTop, Plus, Loader2, Images } from "lucide-react";

function hexToRgb(hex) {
  if (typeof hex !== "string") return null;
  const h = hex.trim().replace("#", "");
  if (h.length !== 6) return null;
  const num = Number.parseInt(h, 16);
  if (!Number.isFinite(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function HeroBlock({
  data,
  onUpdate,
  onUpload,
  uploading,
  onChooseMedia,
}) {
  const overlayOpacity =
    typeof data.overlayOpacity === "number" ? data.overlayOpacity : 0.55;
  const overlayColor =
    typeof data.overlayColor === "string" && data.overlayColor.trim()
      ? data.overlayColor
      : "#000000";
  const overlayRgb = hexToRgb(overlayColor);
  const overlayBackground = overlayRgb
    ? `rgba(${overlayRgb.r},${overlayRgb.g},${overlayRgb.b},${overlayOpacity})`
    : `rgba(0,0,0,${overlayOpacity})`;

  const headingColor =
    typeof data.headingColor === "string" && data.headingColor.trim()
      ? data.headingColor
      : "#FFFFFF";
  const subheadingColor =
    typeof data.subheadingColor === "string" && data.subheadingColor.trim()
      ? data.subheadingColor
      : "#FFFFFF";
  const fallbackBackgroundColor =
    typeof data.fallbackBackgroundColor === "string" &&
    data.fallbackBackgroundColor.trim()
      ? data.fallbackBackgroundColor
      : "#0b1220";

  const onPickFromLibrary = () => {
    if (!onChooseMedia) return;
    onChooseMedia({
      title: "Select hero background",
      imagesOnly: true,
      defaultFolder: "website-assets",
      uploadFolder: "website-assets",
      onSelect: (url) => {
        onUpdate({ backgroundUrl: url });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <PanelTop className="w-4 h-4" />
        Hero (image + text overlay)
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <div
          className="relative min-h-[220px] flex items-end"
          style={{ backgroundColor: fallbackBackgroundColor }}
        >
          {data.backgroundUrl && (
            <img
              src={data.backgroundUrl}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: overlayBackground }}
          />
          <div
            className={`relative z-10 p-6 md:p-10 w-full ${
              data.align === "center" ? "text-center" : "text-left"
            }`}
          >
            <div
              className="text-2xl md:text-4xl font-black leading-tight"
              style={{ color: headingColor }}
            >
              {data.heading || "Headline"}
            </div>
            <div
              className="mt-2 max-w-2xl mx-auto"
              style={{ color: subheadingColor, opacity: 0.92 }}
            >
              {data.subheading || ""}
            </div>
            {data.ctaText && (
              <div className="mt-5">
                <span
                  className="inline-flex px-4 py-2 rounded-full font-semibold text-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.16)",
                    color: headingColor,
                  }}
                >
                  {data.ctaText}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Content --- */}
      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.heading}
          onChange={(e) => onUpdate({ heading: e.target.value })}
          placeholder="Heading"
        />
        <select
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold"
          value={data.align || "left"}
          onChange={(e) => onUpdate({ align: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
        </select>
      </div>

      <textarea
        className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm min-h-[90px]"
        value={data.subheading}
        onChange={(e) => onUpdate({ subheading: e.target.value })}
        placeholder="Subheading"
      />

      <div className="flex flex-col md:flex-row gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.backgroundUrl}
          onChange={(e) => onUpdate({ backgroundUrl: e.target.value })}
          placeholder="Background image URL"
        />

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all cursor-pointer">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUpload(file, "backgroundUrl");
                }
              }}
            />
          </label>

          <button
            type="button"
            onClick={onPickFromLibrary}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
            title="Choose from media library"
          >
            <Images className="w-4 h-4" />
            Library
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.ctaText}
          onChange={(e) => onUpdate({ ctaText: e.target.value })}
          placeholder="Button text"
        />
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.ctaLink}
          onChange={(e) => onUpdate({ ctaLink: e.target.value })}
          placeholder="Button link"
        />
      </div>

      {/* --- Styling --- */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">
            Overlay
          </div>
          <div className="grid grid-cols-[44px_1fr] gap-3 items-center">
            <input
              type="color"
              value={overlayColor}
              onChange={(e) => onUpdate({ overlayColor: e.target.value })}
              className="w-11 h-9 rounded-lg border border-gray-200 bg-white"
              aria-label="Overlay color"
            />
            <input
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono"
              value={overlayColor}
              onChange={(e) => onUpdate({ overlayColor: e.target.value })}
              placeholder="#000000"
            />
          </div>

          <div className="mt-3">
            <div className="text-xs font-bold text-gray-400 uppercase mb-2">
              Overlay Opacity
            </div>
            <input
              type="range"
              min={0}
              max={0.85}
              step={0.05}
              value={overlayOpacity}
              onChange={(e) =>
                onUpdate({ overlayOpacity: parseFloat(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">
            Text & fallback background
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                Heading
              </div>
              <input
                type="color"
                value={headingColor}
                onChange={(e) => onUpdate({ headingColor: e.target.value })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white"
                aria-label="Heading color"
              />
            </div>

            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                Subheading
              </div>
              <input
                type="color"
                value={subheadingColor}
                onChange={(e) => onUpdate({ subheadingColor: e.target.value })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white"
                aria-label="Subheading color"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
              Background (when no image)
            </div>
            <input
              type="color"
              value={fallbackBackgroundColor}
              onChange={(e) =>
                onUpdate({ fallbackBackgroundColor: e.target.value })
              }
              className="w-full h-9 rounded-lg border border-gray-200 bg-white"
              aria-label="Fallback background color"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
