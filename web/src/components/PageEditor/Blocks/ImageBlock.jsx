import { Image as ImageIcon, Plus, Loader2, Images } from "lucide-react";

export function ImageBlock({
  data,
  onUpdate,
  onUpload,
  uploading,
  onChooseMedia,
}) {
  const onPickFromLibrary = () => {
    if (!onChooseMedia) return;

    onChooseMedia({
      title: "Select image",
      imagesOnly: true,
      defaultFolder: "website-assets",
      uploadFolder: "website-assets",
      onSelect: (url) => {
        onUpdate({ url });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
        {data.url ? (
          <img
            src={data.url}
            alt="Block"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 text-sm font-semibold">
            <ImageIcon className="w-8 h-8" />
            Add an image
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Image URL"
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
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
                  onUpload(file, "url");
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
        type="text"
        placeholder="Caption (optional)"
        className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
        value={data.caption}
        onChange={(e) => onUpdate({ caption: e.target.value })}
      />
    </div>
  );
}
