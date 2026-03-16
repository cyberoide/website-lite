import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsClubRead,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";

export async function GET(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const canReadAllClubs = roleAllowsTemplateRead(session.role);
    const canReadClub = roleAllowsClubRead(session.role);

    const { searchParams } = new URL(request.url);
    const clubIdParam = searchParams.get("clubId");

    // NEW: allow selecting an analytics range
    const range = (searchParams.get("range") || "7d").trim().toLowerCase();
    const rangeDays = range === "30d" ? 30 : range === "365d" ? 365 : 7;

    const requestedClubId = clubIdParam
      ? Number.parseInt(String(clubIdParam), 10)
      : Number.parseInt(String(session.club_id || ""), 10);

    if (!Number.isFinite(requestedClubId)) {
      return Response.json({ error: "clubId is required" }, { status: 400 });
    }

    const sameClub =
      session.club_id && Number(session.club_id) === Number(requestedClubId);

    if (!canReadAllClubs) {
      if (!canReadClub || !sameClub) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const [viewsRow] = await sql(
      "SELECT COUNT(*)::int AS views FROM website_analytics_pageviews WHERE club_id = $1 AND is_preview = false AND created_at >= (NOW() - ($2 * INTERVAL '1 day'))",
      [requestedClubId, rangeDays],
    );

    const [previewViewsRow] = await sql(
      "SELECT COUNT(*)::int AS preview_views FROM website_analytics_pageviews WHERE club_id = $1 AND is_preview = true AND created_at >= (NOW() - ($2 * INTERVAL '1 day'))",
      [requestedClubId, rangeDays],
    );

    const topPages = await sql(
      "SELECT COALESCE(NULLIF(page_slug, ''), path) AS key, COUNT(*)::int AS views FROM website_analytics_pageviews WHERE club_id = $1 AND is_preview = false AND created_at >= (NOW() - ($2 * INTERVAL '1 day')) GROUP BY key ORDER BY views DESC LIMIT 5",
      [requestedClubId, rangeDays],
    );

    return Response.json({
      rangeDays,
      views: viewsRow?.views || 0,
      previewViews: previewViewsRow?.preview_views || 0,
      topPages: Array.isArray(topPages) ? topPages : [],
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch analytics summary" },
      { status: 500 },
    );
  }
}
