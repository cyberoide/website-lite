import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";

const GHL_API_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

function splitName(fullName) {
  const raw = typeof fullName === "string" ? fullName.trim() : "";
  if (!raw) {
    return { firstName: null, lastName: null, name: null };
  }
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null, name: parts[0] };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName, name: `${firstName} ${lastName}`.trim() };
}

function toTag(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  return raw.length > 128 ? raw.slice(0, 128) : raw;
}

export async function POST(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use the same env var names as the ClubSoft app for consistency.
    const token = process.env.GOHIGHLEVEL_PRIVATE_TOKEN;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID;

    if (!token) {
      return Response.json(
        {
          error:
            "GoHighLevel token not configured (set GOHIGHLEVEL_PRIVATE_TOKEN)",
        },
        { status: 500 },
      );
    }

    if (!locationId) {
      return Response.json(
        {
          error:
            "GoHighLevel location not configured (set GOHIGHLEVEL_LOCATION_ID)",
        },
        { status: 500 },
      );
    }

    const email =
      typeof session.user_email === "string" ? session.user_email.trim() : "";

    // Without an email (or phone) there is nothing stable to upsert against.
    if (!email) {
      return Response.json(
        { ok: false, reason: "missing_email" },
        { status: 200 },
      );
    }

    let club = null;
    if (session.club_id) {
      const rows = await sql(
        "SELECT id, name, slug FROM clubs WHERE id = $1 LIMIT 1",
        [session.club_id],
      );
      club = rows?.[0] || null;
    }

    const { firstName, lastName, name } = splitName(session.user_name);

    const tags = [
      toTag("ClubSoft"),
      toTag("WebsiteLite"),
      club?.slug ? toTag(`Club:${club.slug}`) : null,
      club?.name ? toTag(`ClubName:${club.name}`) : null,
      session.role ? toTag(`Role:${session.role}`) : null,
      session.user_id ? toTag(`UserId:${session.user_id}`) : null,
    ].filter(Boolean);

    const payload = {
      locationId,
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      name: name || undefined,
      // This shows up nicely in GHL and helps support staff immediately.
      companyName: club?.name || undefined,
      source: "clubsoft.website_lite",
      tags,
    };

    const res = await fetch(`${GHL_API_BASE_URL}/contacts/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        Version: GHL_API_VERSION,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        data?.message ||
        data?.error ||
        `GHL responded [${res.status}] ${res.statusText}`;

      return Response.json(
        {
          ok: false,
          error: errorMessage,
        },
        { status: 502 },
      );
    }

    const contactId = data?.contact?.id || null;

    return Response.json({
      ok: true,
      contactId,
      new: !!data?.new,
    });
  } catch (e) {
    console.error("POST /api/ghl/sync-contact error", e);
    return Response.json(
      { ok: false, error: "Failed to sync contact to GoHighLevel" },
      { status: 500 },
    );
  }
}

// convenience for debugging in browser
export async function GET(request) {
  return POST(request);
}
