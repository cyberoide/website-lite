import { AlertTriangle } from "lucide-react";

export function ErrorState({ message }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-black text-[#111418]">
              This site isn't available yet
            </div>
            <div className="text-gray-600 mt-2">{message}</div>
            <div className="text-sm text-gray-500 mt-4">
              If you're an admin, open the preview link from the Website Lite
              dashboard.
            </div>
            <a
              href="/admin/dashboard"
              className="inline-flex mt-6 px-5 py-2 rounded-full bg-[#111418] text-white font-semibold"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
