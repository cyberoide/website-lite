export function ReadOnlyBanner() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-3">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-extrabold">Read-only access</div>
        <div className="mt-1 text-amber-800">
          You can preview content, but saving and edits are disabled.
        </div>
      </div>
    </div>
  );
}
