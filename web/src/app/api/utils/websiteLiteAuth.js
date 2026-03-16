import sql from "@/app/api/utils/sql";

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) continue;
    const key = rawKey.trim();
    const value = rest.join("=");
    out[key] = decodeURIComponent(value || "");
  }
  return out;
}

export function normalizeRole(role) {
  if (!role) return "";
  // Normalize things like "ClubSoft Owner" / "clubsoft-owner" -> "clubsoft_owner"
  const raw = String(role).trim().toLowerCase();
  return raw
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

// explicit read-only roles (investor/viewer)
export function roleIsReadOnly(role) {
  const r = normalizeRole(role);
  return (
    r === "clubsoft_investor" ||
    r === "clubsoft_viewer" ||
    r === "investor" ||
    r === "view_only" ||
    r === "readonly" ||
    r === "read_only"
  );
}

// roles that can view *any* club (but may be read-only)
export function roleAllowsAllClubsRead(role) {
  const r = normalizeRole(role);
  if (!r) return false;
  if (r === "super_admin") return true;
  return r.startsWith("clubsoft_");
}

// roles that can edit across clubs (platform admin powers)
export function roleAllowsAllClubsWrite(role) {
  const r = normalizeRole(role);
  if (!r) return false;
  if (roleIsReadOnly(r)) return false;
  if (r === "super_admin") return true;
  // ClubSoft-wide roles should be able to edit any club (but exclude investors/viewers)
  return r.startsWith("clubsoft_");
}

// split read vs write permissions
export function roleAllowsClubRead(role) {
  // IMPORTANT: Some ClubSoft SSO payloads may omit a role claim.
  // If the session passed the scope check, allow reading the selected club.
  if (!role) return true;

  const r = normalizeRole(role);
  if (r === "super_admin") return true;

  // ClubSoft-wide roles can read any club (including investor/viewer)
  if (r.startsWith("clubsoft_")) return true;

  return r === "club_admin" || r === "club_owner" || r === "admin";
}

export function roleAllowsClubEditing(role) {
  // Backwards-compatible name, but now means WRITE (edit) access.
  // IMPORTANT: Some ClubSoft SSO payloads may omit a role claim.
  // As long as the session already passed the "website_builder" scope check,
  // we still want the user to be able to edit *their own* club.
  // Cross-club access still requires explicit ClubSoft-wide roles.
  if (!role) return true;

  const r = normalizeRole(role);

  // Read-only roles (investor/viewer) must never be able to write.
  if (roleIsReadOnly(r)) return false;

  // ClubSoft-wide roles should be able to edit any club
  if (r === "super_admin") return true;
  if (r.startsWith("clubsoft_")) return true; // clubsoft_admin, clubsoft_owner, clubsoft_full_admin, etc.

  return r === "club_admin" || r === "club_owner" || r === "admin";
}

export function roleAllowsTemplateEditing(role) {
  // Template editing == platform admin powers
  const r = normalizeRole(role);
  if (!r) return false;
  if (roleIsReadOnly(r)) return false;
  if (r === "super_admin") return true;
  // These users should have access to all clubs + platform admin tools.
  return r.startsWith("clubsoft_");
}

// read-only access to platform-level data (like listing clubs)
export function roleAllowsTemplateRead(role) {
  const r = normalizeRole(role);
  if (!r) return false;
  if (r === "super_admin") return true;
  return r.startsWith("clubsoft_");
}

export function scopeAllowsWebsiteBuilder(scope) {
  if (!scope) return false;
  if (Array.isArray(scope)) {
    return scope.map(String).includes("website_builder");
  }

  // Accept either space or comma separated scopes
  const normalized = String(scope).replace(/,/g, " ");
  return normalized.split(/\s+/).filter(Boolean).includes("website_builder");
}

export async function requireWebsiteLiteSession(request) {
  const session = await getWebsiteLiteSession(request);
  if (!session) {
    return {
      session: null,
      errorResponse: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, errorResponse: null };
}

export async function getWebsiteLiteSession(request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies.wl_session;

    if (!sessionId) {
      return null;
    }

    const rows = await sql(
      "SELECT id, user_id, club_id, role, scope, expires_at, user_email, user_name FROM website_lite_sessions WHERE id = $1 LIMIT 1",
      [sessionId],
    );

    const session = rows?.[0] || null;
    if (!session) {
      return null;
    }

    const expiresAt = session.expires_at ? new Date(session.expires_at) : null;
    if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
      return null;
    }

    if (expiresAt.getTime() <= Date.now()) {
      // Best effort cleanup
      try {
        await sql("DELETE FROM website_lite_sessions WHERE id = $1", [
          sessionId,
        ]);
      } catch (e) {
        console.error("Session cleanup failed", e);
      }
      return null;
    }

    return {
      id: session.id,
      user_id: session.user_id,
      user_email: session.user_email || null,
      user_name: session.user_name || null,
      club_id: session.club_id,
      role: session.role,
      scope: session.scope,
      expires_at: session.expires_at,
    };
  } catch (e) {
    console.error("getWebsiteLiteSession error", e);
    return null;
  }
}
