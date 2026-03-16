import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsClubEditing,
  roleAllowsClubRead,
  roleAllowsTemplateEditing,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";

function canReadClub(session, clubId) {
  const isAllClubs = roleAllowsTemplateRead(session.role);
  if (isAllClubs) return true;

  const canRead = roleAllowsClubRead(session.role);
  const sameClub =
    session.club_id && Number(session.club_id) === Number(clubId);
  return !!canRead && !!sameClub;
}

function canWriteClub(session, clubId) {
  const isTemplateAdmin = roleAllowsTemplateEditing(session.role);
  if (isTemplateAdmin) return true;

  const isClubEditor = roleAllowsClubEditing(session.role);
  const sameClub =
    session.club_id && Number(session.club_id) === Number(clubId);
  return !!isClubEditor && !!sameClub;
}

function toInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request) {
  const { session, errorResponse } = await requireWebsiteLiteSession(request);
  if (errorResponse) return errorResponse;

  if (!scopeAllowsWebsiteBuilder(session.scope)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const clubIdRaw = searchParams.get("clubId") || session.club_id;
  const folder = searchParams.get("folder");
  const q = searchParams.get("q");

  const clubId = Number.parseInt(String(clubIdRaw || ""), 10);
  if (!Number.isFinite(clubId)) {
    return Response.json({ error: "Club ID is required" }, { status: 400 });
  }

  // Read-only users should still be able to view the library.
  if (!canReadClub(session, clubId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = Math.min(
    200,
    Math.max(1, toInt(searchParams.get("limit"), 60)),
  );
  const offset = Math.max(0, toInt(searchParams.get("offset"), 0));

  try {
    let query =
      "SELECT id, url, object_key, folder, mime_type, original_filename, size_bytes, source, created_at " +
      "FROM website_lite_media WHERE club_id = $1";
    const values = [clubId];
    let i = 2;

    if (typeof folder === "string" && folder.trim()) {
      query += ` AND folder = $${i}`;
      values.push(folder.trim());
      i += 1;
    }

    if (typeof q === "string" && q.trim()) {
      query += ` AND (url ILIKE $${i} OR original_filename ILIKE $${i})`;
      values.push(`%${q.trim()}%`);
      i += 1;
    }

    query += ` ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`;
    values.push(limit);
    values.push(offset);

    const items = await sql(query, values);

    return Response.json({ items: Array.isArray(items) ? items : [] });
  } catch (e) {
    console.error("GET /api/media error", e);
    return Response.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, errorResponse } = await requireWebsiteLiteSession(request);
  if (errorResponse) return errorResponse;

  if (!scopeAllowsWebsiteBuilder(session.scope)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const clubId = session.club_id;
  if (!clubId) {
    return Response.json({ error: "No club selected" }, { status: 400 });
  }

  // Write access required
  if (!canWriteClub(session, clubId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    // Support both single + bulk upsert
    const urls = Array.isArray(body?.urls) ? body.urls : null;

    const normalizeUrl = (u) => (typeof u === "string" ? u.trim() : "");

    const safeFolder =
      typeof body?.folder === "string" ? body.folder.trim() : null;
    const safeSource =
      typeof body?.source === "string" ? body.source.trim() : null;
    const safeKey =
      typeof body?.object_key === "string" ? body.object_key.trim() : null;
    const safeMimeType =
      typeof body?.mime_type === "string" ? body.mime_type.trim() : null;
    const safeFilename =
      typeof body?.original_filename === "string"
        ? body.original_filename.trim()
        : null;

    const safeSize =
      typeof body?.size_bytes === "number" && Number.isFinite(body.size_bytes)
        ? Math.max(0, Math.floor(body.size_bytes))
        : null;

    const [website] = await sql(
      "SELECT id FROM websites WHERE club_id = $1 LIMIT 1",
      [clubId],
    );
    const websiteId = website?.id || null;

    if (urls) {
      const cleaned = urls.map(normalizeUrl).filter(Boolean).slice(0, 500);

      if (cleaned.length === 0) {
        return Response.json({ success: true, inserted: 0 });
      }

      // Bulk insert with ON CONFLICT DO NOTHING for speed.
      const insertQuery = `
        INSERT INTO website_lite_media
          (club_id, website_id, url, folder, source, created_by_user_id)
        SELECT $1, $2, u.url, $3, $4, $5
        FROM unnest($6::text[]) AS u(url)
        ON CONFLICT (club_id, url) DO NOTHING
      `;

      await sql(insertQuery, [
        clubId,
        websiteId,
        safeFolder,
        safeSource,
        String(session.user_id),
        cleaned,
      ]);

      return Response.json({ success: true, inserted: cleaned.length });
    }

    const url = normalizeUrl(body?.url);
    if (!url) {
      return Response.json({ error: "url is required" }, { status: 400 });
    }

    const upsertQuery = `
      INSERT INTO website_lite_media
        (club_id, website_id, url, object_key, folder, mime_type, original_filename, size_bytes, source, created_by_user_id)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (club_id, url)
      DO UPDATE SET
        object_key = COALESCE(EXCLUDED.object_key, website_lite_media.object_key),
        folder = COALESCE(EXCLUDED.folder, website_lite_media.folder),
        mime_type = COALESCE(EXCLUDED.mime_type, website_lite_media.mime_type),
        original_filename = COALESCE(EXCLUDED.original_filename, website_lite_media.original_filename),
        size_bytes = COALESCE(EXCLUDED.size_bytes, website_lite_media.size_bytes),
        source = COALESCE(EXCLUDED.source, website_lite_media.source)
      RETURNING id, url, object_key, folder, mime_type, original_filename, size_bytes, source, created_at
    `;

    const rows = await sql(upsertQuery, [
      clubId,
      websiteId,
      url,
      safeKey,
      safeFolder,
      safeMimeType,
      safeFilename,
      safeSize,
      safeSource,
      String(session.user_id),
    ]);

    return Response.json({ item: rows?.[0] || null });
  } catch (e) {
    console.error("POST /api/media error", e);
    return Response.json({ error: "Failed to save media" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { session, errorResponse } = await requireWebsiteLiteSession(request);
  if (errorResponse) return errorResponse;

  if (!scopeAllowsWebsiteBuilder(session.scope)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const clubId = session.club_id;
  if (!clubId) {
    return Response.json({ error: "No club selected" }, { status: 400 });
  }

  // Write access required
  if (!canWriteClub(session, clubId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const mediaId = Number.parseInt(String(id || ""), 10);
  if (!Number.isFinite(mediaId)) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const rows = await sql(
      "DELETE FROM website_lite_media WHERE id = $1 AND club_id = $2 RETURNING id",
      [mediaId, clubId],
    );

    if (!rows?.[0]?.id) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/media error", e);
    return Response.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
