import { Layers, Plus, Loader2, Images } from "lucide-react";

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

export function ImageOverlayBlock({
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
  const bodyTextColor =
    typeof data.bodyTextColor === "string" && data.bodyTextColor.trim()
      ? data.bodyTextColor
      : "#FFFFFF";

  const onPickFromLibrary = () => {
    if (!onChooseMedia) return;
    onChooseMedia({
      title: "Select background image",
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
        <Layers className="w-4 h-4" />
        Image Overlay Section
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <div className="relative min-h-[220px] flex items-end">
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="Overlay"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100" />
          )}
          <div
            className="absolute inset-0"
            style={{ background: overlayBackground }}
          />
          <div className="relative z-10 p-6 md:p-10">
            <div
              className="text-2xl md:text-3xl font-black"
              style={{ color: headingColor }}
            >
              {data.title || "Overlay Title"}
            </div>
            <div
              className="mt-2 max-w-xl"
              style={{ color: bodyTextColor, opacity: 0.9 }}
            >
              {data.text || ""}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.imageUrl}
          onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          placeholder="Image URL"
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

      <input
        className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
        value={data.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Title"
      />

      <textarea
        className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm min-h-[90px]"
        value={data.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Text"
      />

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
            Text
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
                Body
              </div>
              <input
                type="color"
                value={bodyTextColor}
                onChange={(e) => onUpdate({ bodyTextColor: e.target.value })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white"
                aria-label="Body text color"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
