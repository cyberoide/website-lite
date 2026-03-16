import crypto from "crypto";
import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsClubRead,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
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

function pickBrandingValue(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function normalizeBranding(upstream, club) {
  const primaryColor =
    pickBrandingValue(upstream, ["primary_color", "primaryColor"]) || null;
  const secondaryColor =
    pickBrandingValue(upstream, ["secondary_color", "secondaryColor"]) || null;
  const logoUrl = pickBrandingValue(upstream, ["logo_url", "logoUrl"]) || null;

  return {
    club_id: club.id,
    club_slug: club.slug,
    club_name: club.name,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    logo_url: logoUrl,

    // keep the whole payload for debugging / future fields
    source: "clubsoft",
    raw: upstream,
  };
}

async function fetchUpstreamBranding({ bearer, clubSlug, clubId, clubName }) {
  const candidates = [
    {
      method: "POST",
      url: `${CLUBSOFT_APP_BASE_URL}/api/website-lite/branding`,
      body: { clubId, clubSlug, clubName },
    },
    {
      method: "GET",
      url: `${CLUBSOFT_APP_BASE_URL}/api/website-lite/branding?club=${encodeURIComponent(
        String(clubSlug || ""),
      )}`,
    },
    {
      method: "GET",
      url: `${CLUBSOFT_APP_BASE_URL}/api/website-tools/branding?club=${encodeURIComponent(
        String(clubSlug || ""),
      )}`,
    },
  ];

  let lastError = null;

  for (const c of candidates) {
    try {
      const res = await fetch(c.url, {
        method: c.method,
        headers: {
          ...(c.body ? { "Content-Type": "application/json" } : {}),
          Authorization: `Bearer ${bearer}`,
        },
        body: c.body ? JSON.stringify(c.body) : undefined,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { ok: true, data };
      }

      lastError =
        data?.error || `Upstream responded [${res.status}] ${res.statusText}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Upstream request failed";
    }
  }

  return { ok: false, error: lastError || "Failed to fetch branding" };
}

export async function GET(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clubIdRaw = searchParams.get("clubId") || session.club_id;

    if (!clubIdRaw) {
      return Response.json({ error: "Club ID is required" }, { status: 400 });
    }

    const clubId = Number.parseInt(String(clubIdRaw), 10);
    if (!Number.isFinite(clubId)) {
      return Response.json({ error: "Invalid club ID" }, { status: 400 });
    }

    // Club admins can only read their own club.
    // ClubSoft-wide roles (including investors/viewers) can read any club.
    const canReadAllClubs = roleAllowsTemplateRead(session.role);
    const canReadClub = roleAllowsClubRead(session.role);
    const sameClub = session.club_id && Number(session.club_id) === clubId;

    if (!canReadAllClubs) {
      if (!canReadClub || !sameClub) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const [club] = await sql(
      "SELECT id, name, slug, logo_url FROM clubs WHERE id = $1 LIMIT 1",
      [clubId],
    );
    if (!club) {
      return Response.json({ error: "Club not found" }, { status: 404 });
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
    const rawUserId = String(session.user_id);

    const scopeString = String(session.scope || "");
    const scopesArray = scopeString
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const jwtPayload = {
      iss: process.env.APP_URL || "https://clubsoft.site",
      aud: CLUBSOFT_APP_BASE_URL,
      sub: rawUserId,

      user_id: rawUserId,
      userId: rawUserId,
      user_email: session.user_email || undefined,
      userEmail: session.user_email || undefined,
      user_name: session.user_name || undefined,
      userName: session.user_name || undefined,

      club_id: club.id,
      clubId: club.id,
      club_slug: club.slug,
      clubSlug: club.slug,
      club_name: club.name,
      clubName: club.name,

      role: session.role,
      scope: scopeString,
      scopes: scopesArray,

      iat: now,
      exp: now + 60 * 5,
    };

    const bearer = signHs256Jwt(jwtPayload, secret);

    const upstream = await fetchUpstreamBranding({
      bearer,
      clubSlug: club.slug,
      clubId: club.id,
      clubName: club.name,
    });

    if (!upstream.ok) {
      return Response.json(
        {
          error: upstream.error || "Failed to fetch ClubSoft branding",
          hint: "Ensure ClubSoft exposes /api/website-lite/branding (or /api/website-tools/branding) and accepts Bearer JWT signed with CLUBSOFT_SSO_JWT_SECRET.",
        },
        { status: 502 },
      );
    }

    const branding = normalizeBranding(upstream.data, club);

    return Response.json(branding);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch ClubSoft branding" },
      { status: 500 },
    );
  }
}
