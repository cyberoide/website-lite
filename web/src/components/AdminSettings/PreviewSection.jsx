import { ExternalLink } from "lucide-react";

export function PreviewSection({ previewHref }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-bold text-[#111418] flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Preview
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Share this link with your team while you build.
          </div>
        </div>
      </div>

      <div className="mt-4">
        {previewHref ? (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <div className="text-xs font-bold text-gray-400 uppercase">
              Preview URL
            </div>
            <div className="mt-2 font-mono text-sm break-all text-gray-800">
              {previewHref}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={previewHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC]"
              >
                Open preview <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Preview link not ready.</div>
        )}
      </div>
    </div>
  );
}
