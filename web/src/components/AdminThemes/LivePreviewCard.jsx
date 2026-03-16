export function LivePreviewCard({
  localPrimary,
  localSecondary,
  clubName,
  isClubSoftSource,
}) {
  return (
    <div
      className="rounded-2xl p-6 text-white shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${localPrimary}, ${localSecondary})`,
      }}
    >
      <div className="font-bold">Live Preview</div>
      <div className="text-sm text-white/80 mt-1">
        {clubName} • {isClubSoftSource ? "ClubSoft" : "Custom"}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="px-4 py-2 rounded-full bg-white/15 text-sm font-semibold">
          Primary: {localPrimary}
        </div>
        <div className="px-4 py-2 rounded-full bg-white/15 text-sm font-semibold">
          Secondary: {localSecondary}
        </div>
      </div>
    </div>
  );
}
