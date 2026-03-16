import { Globe, ExternalLink } from "lucide-react";

export function PreviewUrlPanel({ website, onCopyUrl }) {
  return (
    <div className="bg-[#111418] rounded-2xl p-6 text-white shadow-xl shadow-gray-200">
      <h3 className="font-bold mb-2 flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-400" />
        Preview URL
      </h3>
      <p className="text-sm text-gray-400 mb-4 truncate">
        {typeof window !== "undefined" ? window.location.origin : ""}
        /s/{website?.club_slug}?preview=1
      </p>
      <button
        onClick={onCopyUrl}
        className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-semibold"
      >
        <ExternalLink className="w-4 h-4" />
        Copy URL
      </button>
    </div>
  );
}
