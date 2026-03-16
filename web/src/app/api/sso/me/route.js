import sql from "@/app/api/utils/sql";
import { getWebsiteLiteSession } from "@/app/api/utils/websiteLiteAuth";

export async function GET(request) {
  try {
    const session = await getWebsiteLiteSession(request);

    if (!session) {
      return Response.json({ session: null, activeClub: null });
    }

    let activeClub = null;
    if (session.club_id) {
      try {
        const rows = await sql(
          "SELECT id, name, slug FROM clubs WHERE id = $1 LIMIT 1",
          [session.club_id],
        );
        const c = rows?.[0] || null;
        if (c) {
          activeClub = { id: c.id, name: c.name, slug: c.slug };
        }
      } catch (e) {
        // non-fatal
      }
    }

    return Response.json({ session, activeClub });
  } catch (e) {
    console.error("GET /api/sso/me error", e);
    return Response.json({ session: null, activeClub: null }, { status: 200 });
  }
}
