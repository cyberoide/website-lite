import crypto from "crypto";
import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  scopeAllowsWebsiteBuilder,
  roleAllowsClubEditing,
} from "@/app/api/utils/websiteLiteAuth";

const CLUBSOFT_APP_BASE_URL = "https://app.clubsoft.co";

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signHs256Jwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${signingInput}.${sig}`;
}

const ALLOWED_FOLDERS = new Set([
  "club-configuration",
  "club-documents",
  "misc",
  // ClubSoft Website Lite / builder assets (if enabled on the ClubSoft side)
  "website-assets",
]);

export async function POST(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json(
        { error: "Missing scope website_builder" },
        { status: 403 },
      );
    }

    if (!roleAllowsClubEditing(session.role)) {
      return Response.json(
        { error: "You do not have permission to upload assets for this club" },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));

    const filename = typeof body?.filename === "string" ? body.filename : "";
    const contentType =
      typeof body?.contentType === "string" ? body.contentType : "";
    const folder = typeof body?.folder === "string" ? body.folder : "";
    const expiresSecondsRaw = body?.expiresSeconds;

    if (!filename.trim()) {
      return Response.json({ error: "filename is required" }, { status: 400 });
    }

    const safeFolder = folder.trim() ? folder.trim() : "club-configuration";
    if (!ALLOWED_FOLDERS.has(safeFolder)) {
      return Response.json(
        {
          error: `folder must be one of: ${Array.from(ALLOWED_FOLDERS).join(
            ", ",
          )}`,
        },
        { status: 400 },
      );
    }

    const expiresSeconds =
      typeof expiresSecondsRaw === "number" &&
      Number.isFinite(expiresSecondsRaw)
        ? Math.min(900, Math.max(60, Math.floor(expiresSecondsRaw)))
        : 900;

    const clubId = session.club_id;
    if (!clubId) {
      return Response.json(
        { error: "No club selected for this session" },
        { status: 400 },
      );
    }

    // Optional club context (helps ClubSoft build keys + audit logs)
    let clubSlug = null;
    let clubName = null;
    try {
      const rows = await sql(
        "SELECT slug, name FROM clubs WHERE id = $1 LIMIT 1",
        [clubId],
      );
      clubSlug = rows?.[0]?.slug || null;
      clubName = rows?.[0]?.name || null;
    } catch (e) {
      // non-fatal
    }

    const secret =
      process.env.CLUBSOFT_SSO_JWT_SECRET || process.env.AUTH_SECRET;
    if (!secret) {
      return Response.json(
        {
          error:
            "Server SSO secret not configured (set CLUBSOFT_SSO_JWT_SECRET)",
        },
        { status: 500 },
      );
    }

    const now = Math.floor(Date.now() / 1000);

    // IMPORTANT: do NOT assume ClubSoft uses numeric user IDs.
    // We keep the raw session user_id for sub/user_id and ALSO provide
    // a numeric variant when it looks like "user_123".
    const rawUserId = String(session.user_id);
    const strippedUserId = rawUserId.startsWith("user_")
      ? rawUserId.slice("user_".length)
      : rawUserId;
    const userIdNumber = Number.parseInt(strippedUserId, 10);
    const hasUserIdNumber = Number.isFinite(userIdNumber);

    const clubIdNumber = Number.parseInt(String(clubId), 10);
    const clubIdForClaims = Number.isFinite(clubIdNumber)
      ? clubIdNumber
      : clubId;

    const scopeString = String(session.scope || "");
    const scopesArray = scopeString
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    // Short-lived JWT for server-to-server auth with ClubSoft
    const jwtPayload = {
      iss: process.env.APP_URL || "https://clubsoft.site",
      aud: CLUBSOFT_APP_BASE_URL,

      // keep raw ID here (ClubSoft commonly uses strings like "user_16")
      sub: rawUserId,

      user_id: rawUserId,
      userId: rawUserId,
      user_email: session.user_email || undefined,
      userEmail: session.user_email || undefined,
      user_name: session.user_name || undefined,
      userName: session.user_name || undefined,

      // optional numeric ID variant (helps if ClubSoft expects integers)
      user_id_number: hasUserIdNumber ? userIdNumber : undefined,

      club_id: clubIdForClaims,
      clubId: clubIdForClaims,
      club_slug: clubSlug || undefined,
      clubSlug: clubSlug || undefined,
      club_name: clubName || undefined,
      clubName: clubName || undefined,

      role: session.role,
      scope: scopeString,
      scopes: scopesArray,

      iat: now,
      exp: now + 60 * 5,
    };

    const bearer = signHs256Jwt(jwtPayload, secret);

    const presignBody = {
      clubId: clubIdForClaims,
      clubSlug: clubSlug || undefined,
      clubName: clubName || undefined,
      folder: safeFolder,
      filename,
      contentType: contentType || undefined,
      expiresSeconds,
    };

    const res = await fetch(`${CLUBSOFT_APP_BASE_URL}/api/s3/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(presignBody),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const upstreamError =
        data?.error ||
        `ClubSoft presign failed: [${res.status}] ${res.statusText}`;
      return Response.json(
        {
          error: upstreamError,
          hint: "If this is a 401/403, ClubSoft likely needs to accept JWT Bearer auth for /api/s3/presign (HS256 or RS256).",
        },
        { status: 502 },
      );
    }

    return Response.json(data);
  } catch (e) {
    console.error("POST /api/clubsoft/s3/presign error", e);
    return Response.json(
      { error: "Failed to presign upload" },
      { status: 500 },
    );
  }
}
