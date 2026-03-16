import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const clubIdRaw = body?.clubId;
    const clubId = Number.parseInt(String(clubIdRaw), 10);

    const pageSlug =
      typeof body?.pageSlug === "string" ? body.pageSlug.trim() : "";
    const path = typeof body?.path === "string" ? body.path.trim() : "";
    const isPreview = body?.isPreview === true;

    if (!Number.isFinite(clubId) || !path) {
      return Response.json(
        { error: "Invalid analytics payload" },
        { status: 400 },
      );
    }

    const referrer = request.headers.get("referer") || null;
    const userAgent = request.headers.get("user-agent") || null;

    await sql(
      "INSERT INTO website_analytics_pageviews (club_id, page_slug, path, referrer, user_agent, is_preview) VALUES ($1, $2, $3, $4, $5, $6)",
      [clubId, pageSlug || null, path, referrer, userAgent, isPreview],
    );

    return Response.json({ success: true });
  } catch (error) {
    // Analytics should never break the site.
    console.error(error);
    return Response.json({ success: false });
  }
}
