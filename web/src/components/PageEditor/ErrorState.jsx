export function ErrorState({ message }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Page editor
        </div>
        <div className="mt-2 text-2xl font-extrabold text-[#111418]">
          Could not load this page
        </div>
        <div className="mt-2 text-sm text-gray-600">{message}</div>
        <a
          href="/admin/pages"
          className="inline-flex mt-6 items-center justify-center px-5 py-2 rounded-2xl bg-[#111418] text-white font-semibold hover:bg-black"
        >
          Back to Pages
        </a>
      </div>
    </div>
  );
}
