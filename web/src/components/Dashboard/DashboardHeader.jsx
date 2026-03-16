import { Eye, ToggleLeft, ToggleRight } from "lucide-react";

export function DashboardHeader({
  title,
  subtitle,
  website,
  publishMutation,
  sitePreviewHref,
  canEdit = true,
}) {
  const resolvedTitle =
    typeof title === "string" && title.trim()
      ? title
      : `${website?.club_name} Website Builder`;

  const resolvedSubtitle =
    typeof subtitle === "string" && subtitle.trim()
      ? subtitle
      : "Manage pages, navigation, and your public website.";

  const canPublish = canEdit && !!website?.id && !!publishMutation;
  const canPreview =
    !!website?.club_slug &&
    typeof sitePreviewHref === "string" &&
    sitePreviewHref.includes(`/s/${website.club_slug}`);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[#111418] mb-2">
          {resolvedTitle}
        </h1>
        <p className="text-gray-500">{resolvedSubtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (!canPublish) return;
            publishMutation.mutate(!website?.is_published);
          }}
          disabled={!canPublish}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            website?.is_published
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title={canEdit ? "" : "Read-only access"}
        >
          {website?.is_published ? (
            <ToggleRight className="w-5 h-5" />
          ) : (
            <ToggleLeft className="w-5 h-5" />
          )}
          {website?.is_published ? "Published" : "Draft"}
        </button>

        {canPreview ? (
          <a
            href={sitePreviewHref}
            target="_blank"
            className="flex items-center gap-2 px-6 py-2 bg-[#0066FF] text-white rounded-full font-semibold hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-200"
          >
            <Eye className="w-5 h-5" />
            Preview Site
          </a>
        ) : (
          <div
            className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-500 rounded-full font-semibold cursor-not-allowed"
            title="Select a club to generate a preview link"
          >
            <Eye className="w-5 h-5" />
            Preview Site
          </div>
        )}
      </div>
    </div>
  );
}
