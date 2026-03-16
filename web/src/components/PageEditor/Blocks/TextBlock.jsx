import { Paintbrush } from "lucide-react";

export function TextBlock({ data, onUpdate }) {
  const textColor = typeof data.textColor === "string" ? data.textColor : "";
  const backgroundColor =
    typeof data.backgroundColor === "string" ? data.backgroundColor : "";

  const previewStyle = {
    ...(textColor ? { color: textColor } : {}),
  };

  const previewWrapperStyle = {
    ...(backgroundColor ? { backgroundColor } : {}),
  };

  const wrapperClassName = backgroundColor
    ? "rounded-2xl border border-gray-100 p-4"
    : "";

  return (
    <div className="space-y-3">
      <div className={wrapperClassName} style={previewWrapperStyle}>
        <textarea
          className={
            "w-full text-lg bg-transparent border-none focus:ring-0 resize-none min-h-[120px] " +
            (textColor ? "" : "text-gray-700")
          }
          style={previewStyle}
          value={data.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Enter text content..."
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-3">
        <div className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
          <Paintbrush className="w-4 h-4" />
          Colors (optional)
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
              Text
            </div>
            <input
              type="color"
              value={textColor || "#111418"}
              onChange={(e) => onUpdate({ textColor: e.target.value })}
              className="w-full h-9 rounded-lg border border-gray-200 bg-white"
              aria-label="Text color"
            />
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-gray-600 hover:text-black"
              onClick={() => onUpdate({ textColor: "" })}
            >
              Reset text color
            </button>
          </div>

          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
              Background
            </div>
            <input
              type="color"
              value={backgroundColor || "#ffffff"}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-full h-9 rounded-lg border border-gray-200 bg-white"
              aria-label="Background color"
            />
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-gray-600 hover:text-black"
              onClick={() => onUpdate({ backgroundColor: "" })}
            >
              Reset background
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
