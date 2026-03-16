import { ArrowLeft } from "lucide-react";

export function ErrorState({ error }) {
  const showError = (() => {
    if (!error) return null;
    if (error instanceof Error) return error.message;
    return "Failed to load theme";
  })();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <a
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </a>
      <div className="mt-6 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-800">
        {showError}
      </div>
    </div>
  );
}
