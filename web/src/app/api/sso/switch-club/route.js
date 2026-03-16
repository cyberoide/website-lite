import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";
import { ensureWebsiteAndPagesProvisioned } from "@/app/api/utils/provisionWebsiteLite";

export async function POST(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // ClubSoft-wide roles (including investors/viewers) can switch clubs.
    if (!roleAllowsTemplateRead(session.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const clubId = body?.clubId;

    if (!clubId) {
      return Response.json({ error: "clubId is required" }, { status: 400 });
    }

    const [club] =
      await sql`SELECT id, name, slug FROM clubs WHERE id = ${clubId}`;
    if (!club) {
      return Response.json({ error: "Club not found" }, { status: 404 });
    }

    // Make sure a site exists for this club before switching into it.
    try {
      await ensureWebsiteAndPagesProvisioned({
        clubId: Number(clubId),
        templateKey: "coastal",
      });
    } catch (e) {
      console.error("Auto-provision (switch club) failed", e);
    }

    const [updated] = await sql`
      UPDATE website_lite_sessions
      SET club_id = ${clubId}
      WHERE id = ${session.id}
      RETURNING id, user_id, club_id, role, scope, expires_at
    `;

    return Response.json({ success: true, session: updated });
  } catch (e) {
    console.error("POST /api/sso/switch-club error", e);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
