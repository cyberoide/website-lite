import { Copy } from "lucide-react";
import { toast } from "sonner";

function cellWrapClass(value) {
  const v = typeof value === "string" ? value : String(value || "");
  // For short hostnames like "clubsoft.site" keep it on one line.
  // For long TXT values / tokens, allow breaking.
  if (v.length <= 32 && !v.includes(" ")) {
    return "whitespace-nowrap break-normal";
  }
  return "break-all";
}

export function DnsRow({ type, name, value, note }) {
  const nameClass = cellWrapClass(name);
  const valueClass = cellWrapClass(value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[90px_120px_1fr_auto] gap-2 md:gap-3 items-start md:items-center py-2">
      <div className="text-xs font-bold text-gray-500 uppercase">{type}</div>
      <div className={`font-mono text-sm text-gray-800 ${nameClass}`}>
        {name}
      </div>
      <div className={`font-mono text-sm text-gray-800 ${valueClass}`}>
        {value}
      </div>
      <button
        type="button"
        onClick={() => {
          const text = `${type} ${name} ${value}`;
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard
              .writeText(text)
              .then(() => toast.success("Copied"))
              .catch(() => toast.error("Could not copy"));
          }
        }}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50"
      >
        <Copy className="w-4 h-4" />
        Copy
      </button>

      {note ? (
        <div className="md:col-span-4 text-xs text-gray-600 mt-1">{note}</div>
      ) : null}
    </div>
  );
}
