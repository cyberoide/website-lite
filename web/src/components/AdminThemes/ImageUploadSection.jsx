import { ImageIcon, Loader2 } from "lucide-react";

export function ImageUploadSection({
  title,
  description,
  currentUrl,
  onUpload,
  onRemove,
  uploading,
  inputRef,
  onFileChange,
  altText,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-bold text-[#111418]">{title}</div>
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        </div>
        <button
          onClick={onUpload}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <div className="mt-4">
        {currentUrl ? (
          <div className="flex items-center gap-4">
            <img
              src={currentUrl}
              alt={altText}
              className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#111418]">
                Current {altText.toLowerCase()}
              </div>
              <div className="text-xs text-gray-500 truncate">{currentUrl}</div>
              <button
                onClick={onRemove}
                className="text-xs font-semibold text-red-600 hover:underline mt-2"
              >
                Remove override
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            No {altText.toLowerCase()}{" "}
            {title.includes("Icon") ? "set" : "override set"}.
          </div>
        )}
      </div>
    </div>
  );
}
