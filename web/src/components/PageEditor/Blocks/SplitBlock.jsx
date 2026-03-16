import {
  Columns2,
  Plus,
  Loader2,
  Hash,
  Paintbrush,
  Images,
} from "lucide-react";

export function SplitBlock({
  data,
  onUpdate,
  onUpload,
  uploading,
  onChooseMedia,
}) {
  const imageSide = data.imageSide || "left";
  const background = data.background || "none";

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

  const previewStyle =
    background === "custom" && backgroundColor
      ? { backgroundColor }
      : undefined;

  const previewContainerClassName =
    background === "light"
      ? "bg-gray-50"
      : background === "custom"
        ? ""
        : "bg-white";

  const anchorValue = typeof data.anchor === "string" ? data.anchor.trim() : "";
  const navLabelValue =
    typeof data.navLabel === "string" ? data.navLabel.trim() : "";
  const showsNavBadge = !!anchorValue && !!navLabelValue;

  const onPickFromLibrary = () => {
    if (!onChooseMedia) return;
    onChooseMedia({
      title: "Select section image",
      imagesOnly: true,
      defaultFolder: "website-assets",
      uploadFolder: "website-assets",
      onSelect: (url) => {
        onUpdate({ imageUrl: url });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Columns2 className="w-4 h-4" />
        Split Section (image + text)
      </div>

      <div
        className={`rounded-2xl border border-gray-100 overflow-hidden ${previewContainerClassName}`}
        style={previewStyle}
      >
        <div className="grid md:grid-cols-2">
          <div
            className={`relative min-h-[220px] bg-gray-100 ${
              imageSide === "right" ? "md:order-2" : ""
            }`}
          >
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt={data.heading || "Section image"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-semibold">
                Add an image
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {data.eyebrow && (
              <div
                className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400"
                style={
                  overrideBodyTextColor
                    ? { color: overrideBodyTextColor }
                    : undefined
                }
              >
                {data.eyebrow}
              </div>
            )}
            <div
              className="text-2xl md:text-3xl font-black text-[#111418] mt-2"
              style={
                overrideHeadingColor
                  ? { color: overrideHeadingColor }
                  : undefined
              }
            >
              {data.heading || "Section heading"}
            </div>
            {data.text && (
              <div
                className="mt-3 text-gray-600 leading-relaxed whitespace-pre-wrap"
                style={
                  overrideBodyTextColor
                    ? { color: overrideBodyTextColor }
                    : undefined
                }
              >
                {data.text}
              </div>
            )}
            {data.ctaText && (
              <div className="mt-6">
                <span className="inline-flex px-4 py-2 rounded-full bg-[#111418] text-white font-semibold text-sm">
                  {data.ctaText}
                </span>
              </div>
            )}
          </div>
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
        className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm min-h-[110px]"
        value={data.text || ""}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Body text"
      />

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.imageUrl || ""}
          onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          placeholder="Image URL"
        />

        <div className="flex items-center gap-2">
          <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all cursor-pointer">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUpload(file, "imageUrl");
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

      <div className="grid md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Anchor ID
          </div>
          <input
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-mono"
            value={data.anchor || ""}
            onChange={(e) => onUpdate({ anchor: e.target.value })}
            placeholder="e.g. amenities"
          />
        </div>

        <div>
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">
            Nav Label
          </div>
          <input
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
            value={data.navLabel || ""}
            onChange={(e) => onUpdate({ navLabel: e.target.value })}
            placeholder="Optional"
          />

          {showsNavBadge && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-bold">
              This block will appear in the menu
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">
            Layout
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold"
              value={imageSide}
              onChange={(e) => onUpdate({ imageSide: e.target.value })}
            >
              <option value="left">Image left</option>
              <option value="right">Image right</option>
            </select>
            <select
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold"
              value={background}
              onChange={(e) => onUpdate({ background: e.target.value })}
            >
              <option value="none">None</option>
              <option value="light">Light</option>
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

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.ctaText || ""}
          onChange={(e) => onUpdate({ ctaText: e.target.value })}
          placeholder="Button text (optional)"
        />
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.ctaLink || ""}
          onChange={(e) => onUpdate({ ctaLink: e.target.value })}
          placeholder="Button link"
        />
      </div>
    </div>
  );
}
