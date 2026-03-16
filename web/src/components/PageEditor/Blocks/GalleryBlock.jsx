import React from "react";
import { Images, Plus, Trash2, Loader2 } from "lucide-react";

function safeList(value) {
  return Array.isArray(value) ? value : [];
}

export function GalleryBlock({
  data,
  onUpdate,
  onUpload,
  uploading,
  onChooseMedia,
}) {
  const images = safeList(data.images);

  const updateImage = (index, patch) => {
    const next = images.map((img, i) =>
      i === index ? { ...img, ...patch } : img,
    );
    onUpdate({ images: next });
  };

  const add = () => {
    onUpdate({ images: [...images, { url: "", caption: "" }] });
  };

  const remove = (index) => {
    const next = images.filter((_, i) => i !== index);
    onUpdate({ images: next });
  };

  const openLibraryForIndex = (idx) => {
    if (!onChooseMedia) return;
    onChooseMedia({
      title: `Select gallery image ${idx + 1}`,
      imagesOnly: true,
      defaultFolder: "website-assets",
      uploadFolder: "website-assets",
      onSelect: (url) => {
        updateImage(idx, { url });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Images className="w-4 h-4" />
        Gallery
      </div>

      <div className="rounded-2xl border border-gray-100 p-6 bg-white">
        <div className="font-black text-xl text-[#111418]">
          {data.heading || "Photo Gallery"}
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.slice(0, 6).map((img, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]"
            >
              {img?.url ? (
                <img
                  src={img.url}
                  alt={img.caption || ""}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-2 md:col-span-3 text-sm text-gray-500">
              Add photos to build a grid like demo sites.
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.heading || ""}
          onChange={(e) => onUpdate({ heading: e.target.value })}
          placeholder="Gallery heading"
        />
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.navLabel || ""}
          onChange={(e) => onUpdate({ navLabel: e.target.value })}
          placeholder="Nav label (optional)"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-mono"
          value={data.anchor || ""}
          onChange={(e) => onUpdate({ anchor: e.target.value })}
          placeholder="Anchor ID (optional)"
        />
        <div className="text-xs text-gray-500 flex items-center">
          Tip: use anchor IDs to create one-page sections.
        </div>
      </div>

      <div className="space-y-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="border border-gray-100 rounded-2xl p-4 bg-white"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="font-bold text-[#111418]">Image {idx + 1}</div>
              <button
                onClick={() => remove(idx)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                aria-label="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-[1fr_120px_120px] gap-3">
              <input
                className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
                value={img.url || ""}
                onChange={(e) => updateImage(idx, { url: e.target.value })}
                placeholder="Image URL"
              />
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
                      onUpload(file, "__gallery__" + idx);
                    }
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => openLibraryForIndex(idx)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
                title="Choose from media library"
              >
                <Images className="w-4 h-4" />
                Library
              </button>
            </div>

            <input
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm mt-3"
              value={img.caption || ""}
              onChange={(e) => updateImage(idx, { caption: e.target.value })}
              placeholder="Caption (optional)"
            />

            {img.url && (
              <div className="mt-3 rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
                <img
                  src={img.url}
                  alt={img.caption || ""}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}

        <button
          onClick={add}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      <div className="text-xs text-gray-500">
        Note: uploads inside galleries are saved per-image.
      </div>
    </div>
  );
}
