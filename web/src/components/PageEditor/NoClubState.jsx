export function NoClubState({ isClubSoftAdmin }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Page editor
        </div>
        <div className="mt-2 text-2xl font-extrabold text-[#111418]">
          Select a club
        </div>
        <div className="mt-2 text-sm text-gray-600">
          You're signed in, but there's no active club selected yet.
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {isClubSoftAdmin
            ? "Use the club dropdown in the left menu to pick which site you're editing, then come back."
            : "Go back to the ClubSoft app and open Website Builder from the club you want to edit."}
        </div>
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
