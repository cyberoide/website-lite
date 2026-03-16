import crypto from "crypto";
import sql from "@/app/api/utils/sql";
import { ensureClubWebsiteProvisioned } from "@/app/api/utils/provisionWebsiteLite";

function base64UrlToBuffer(input) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const paddedFinal = padded + "=".repeat(padLength);
  return Buffer.from(paddedFinal, "base64");
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

function verifyHs256(jwt, secret) {
  const parts = jwt.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "Invalid token format" };
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const headerJson = base64UrlToBuffer(headerB64).toString("utf8");
  const payloadJson = base64UrlToBuffer(payloadB64).toString("utf8");

  const header = safeJsonParse(headerJson);
  const payload = safeJsonParse(payloadJson);

  if (!header || !payload) {
    return { ok: false, error: "Invalid token JSON" };
  }

  if (header.alg !== "HS256") {
    return { ok: false, error: `Unsupported alg: ${header.alg}` };
  }

  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const providedSig = sigB64;
  if (expectedSig.length !== providedSig.length) {
    return { ok: false, error: "Bad signature" };
  }
  const ok = crypto.timingSafeEqual(
    Buffer.from(expectedSig),
    Buffer.from(providedSig),
  );

  if (!ok) {
    return { ok: false, error: "Bad signature" };
  }

  return { ok: true, payload };
}

function scopeHasWebsiteBuilder(scope) {
  if (!scope) return false;
  if (Array.isArray(scope)) {
    return scope.map(String).includes("website_builder");
  }

  // Accept either space or comma separated scopes
  const normalized = String(scope).replace(/,/g, " ");
  return normalized.split(/\s+/).filter(Boolean).includes("website_builder");
}

function cookieString({ name, value, maxAgeSeconds, secure }) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (typeof maxAgeSeconds === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`);
  }
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function normalizeRole(role) {
  if (!role) return null;
  const raw = String(role).trim().toLowerCase();
  const norm = raw
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  return norm || null;
}

function asStringArray(value) {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (!Array.isArray(value)) return [];

  const out = [];
  for (const v of value) {
    if (typeof v === "string") out.push(v);
    else if (v && typeof v === "object") {
      // Common shapes: { name }, { role }, { key }
      if (typeof v.name === "string") out.push(v.name);
      else if (typeof v.role === "string") out.push(v.role);
      else if (typeof v.key === "string") out.push(v.key);
    }
  }
  return out;
}

function pickRole(payload) {
  // Accept either role: "ClubSoft Owner" or roles/permissions arrays.
  const candidates = [];

  if (typeof payload?.role === "string") candidates.push(payload.role);
  if (typeof payload?.clubsoft_role === "string")
    candidates.push(payload.clubsoft_role);
  if (typeof payload?.clubsoftRole === "string")
    candidates.push(payload.clubsoftRole);

  candidates.push(...asStringArray(payload?.roles));
  candidates.push(...asStringArray(payload?.permissions));
  candidates.push(...asStringArray(payload?.permission));
  candidates.push(...asStringArray(payload?.perms));

  // nested common patterns
  if (payload?.user && typeof payload.user === "object") {
    if (typeof payload.user.role === "string")
      candidates.push(payload.user.role);
    if (typeof payload.user.clubsoft_role === "string")
      candidates.push(payload.user.clubsoft_role);
    if (typeof payload.user.clubsoftRole === "string")
      candidates.push(payload.user.clubsoftRole);

    candidates.push(...asStringArray(payload.user.roles));
    candidates.push(...asStringArray(payload.user.permissions));
  }

  const cleaned = candidates
    .map((r) => (typeof r === "string" ? r.trim() : ""))
    .filter(Boolean);

  if (cleaned.length === 0) return null;

  // Prefer ClubSoft-wide roles when present
  const clubsoft = cleaned.find((r) => {
    const norm = normalizeRole(r);
    return norm === "super_admin" || (norm && norm.startsWith("clubsoft_"));
  });
  return clubsoft || cleaned[0];
}

function pickClubId(payload) {
  const direct =
    payload?.club_id ??
    payload?.clubId ??
    payload?.active_club_id ??
    payload?.activeClubId ??
    payload?.current_club_id ??
    payload?.currentClubId;

  if (typeof direct === "number" || typeof direct === "string") {
    const n = Number.parseInt(String(direct), 10);
    return Number.isFinite(n) ? n : null;
  }

  // nested shapes
  const nested = payload?.club;
  if (nested && typeof nested === "object") {
    const n = Number.parseInt(String(nested.id ?? nested.club_id ?? ""), 10);
    if (Number.isFinite(n)) return n;
  }

  // clubs: [{ id }]
  const clubs = Array.isArray(payload?.clubs) ? payload.clubs : null;
  if (clubs && clubs.length) {
    const first = clubs[0];
    if (first && typeof first === "object") {
      const n = Number.parseInt(String(first.id ?? first.club_id ?? ""), 10);
      if (Number.isFinite(n)) return n;
    }
  }

  return null;
}

function pickClubSlug(payload) {
  const slug =
    payload?.club_slug ??
    payload?.clubSlug ??
    payload?.club_slug_current ??
    payload?.active_club_slug ??
    payload?.activeClubSlug ??
    payload?.current_club_slug ??
    payload?.currentClubSlug ??
    payload?.club?.slug ??
    payload?.club?.club_slug ??
    payload?.currentClub?.slug ??
    payload?.activeClub?.slug;

  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  return trimmed ? trimmed : null;
}

function pickEmail(payload) {
  const email =
    payload?.email ??
    payload?.user_email ??
    payload?.userEmail ??
    payload?.email_address ??
    payload?.emailAddress ??
    payload?.preferred_username ??
    payload?.username ??
    payload?.upn ??
    payload?.user?.email ??
    payload?.user?.user_email ??
    payload?.user?.userEmail ??
    payload?.user?.email_address ??
    payload?.user?.emailAddress;
  return typeof email === "string" && email.trim() ? email.trim() : null;
}

function pickName(payload) {
  const name =
    payload?.name ??
    payload?.user_name ??
    payload?.userName ??
    payload?.display_name ??
    payload?.displayName ??
    payload?.full_name ??
    payload?.fullName ??
    payload?.user?.name ??
    payload?.user?.display_name ??
    payload?.user?.displayName ??
    payload?.user?.full_name ??
    payload?.user?.fullName;
  if (typeof name === "string" && name.trim()) return name.trim();

  const first =
    (typeof payload?.given_name === "string" && payload.given_name.trim()) ||
    (typeof payload?.first_name === "string" && payload.first_name.trim()) ||
    (typeof payload?.firstName === "string" && payload.firstName.trim()) ||
    (typeof payload?.user?.given_name === "string" &&
      payload.user.given_name.trim()) ||
    (typeof payload?.user?.first_name === "string" &&
      payload.user.first_name.trim()) ||
    (typeof payload?.user?.firstName === "string" &&
      payload.user.firstName.trim()) ||
    "";

  const last =
    (typeof payload?.family_name === "string" && payload.family_name.trim()) ||
    (typeof payload?.last_name === "string" && payload.last_name.trim()) ||
    (typeof payload?.lastName === "string" && payload.lastName.trim()) ||
    (typeof payload?.user?.family_name === "string" &&
      payload.user.family_name.trim()) ||
    (typeof payload?.user?.last_name === "string" &&
      payload.user.last_name.trim()) ||
    (typeof payload?.user?.lastName === "string" &&
      payload.user.lastName.trim()) ||
    "";

  const combined = `${first} ${last}`.trim();
  return combined ? combined : null;
}

function pickScope(payload) {
  // ClubSoft may send either scope: "a b" or scopes: ["a", "b"]
  const raw =
    payload?.scope ??
    payload?.scopes ??
    payload?.scp ??
    payload?.permissions_scope ??
    payload?.user?.scope ??
    payload?.user?.scopes;

  if (!raw) return null;
  if (Array.isArray(raw)) {
    return raw.map(String).join(" ");
  }
  if (typeof raw === "string") {
    return raw;
  }
  return null;
}

function pickClubName(payload) {
  const name =
    payload?.club_name ??
    payload?.clubName ??
    payload?.active_club_name ??
    payload?.activeClubName ??
    payload?.current_club_name ??
    payload?.currentClubName ??
    payload?.club?.name ??
    payload?.club?.club_name ??
    payload?.currentClub?.name ??
    payload?.activeClub?.name;

  if (typeof name === "string" && name.trim()) return name.trim();
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return Response.json({ error: "token is required" }, { status: 400 });
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

    const verified = verifyHs256(token, secret);
    if (!verified.ok) {
      return Response.json({ error: verified.error }, { status: 401 });
    }

    const payload = verified.payload;

    // Required claims
    const userId = payload.user_id ?? payload.userId ?? payload.sub;

    // ClubSoft may send either club_id (number) or club_slug (string).
    let clubId = pickClubId(payload);
    const clubSlugClaim = pickClubSlug(payload);
    const clubNameClaim = pickClubName(payload);

    if (clubId && clubSlugClaim) {
      // If we got a numeric club id but it doesn't exist in this DB, try to map via slug.
      try {
        const exists = await sql("SELECT id FROM clubs WHERE id = $1 LIMIT 1", [
          clubId,
        ]);
        const has = !!exists?.[0]?.id;
        if (!has) {
          const rows = await sql(
            "SELECT id FROM clubs WHERE slug = $1 LIMIT 1",
            [clubSlugClaim],
          );
          const mapped = rows?.[0]?.id ?? null;
          if (mapped) {
            clubId = mapped;
          }
        }
      } catch (e) {
        // non-fatal
      }
    }

    if (!clubId && clubSlugClaim) {
      try {
        const rows = await sql("SELECT id FROM clubs WHERE slug = $1 LIMIT 1", [
          clubSlugClaim,
        ]);
        clubId = rows?.[0]?.id ?? null;
      } catch (e) {
        // non-fatal
      }
    }

    const roleRaw = pickRole(payload);
    const role = normalizeRole(roleRaw);

    const scopePicked = pickScope(payload);
    const scopeNormalized =
      typeof scopePicked === "string"
        ? scopePicked.replace(/,/g, " ").replace(/\s+/g, " ").trim()
        : scopePicked;

    const userEmail = pickEmail(payload);
    const userName = pickName(payload);

    // Helpful non-PII debug: if ClubSoft changes claim shapes, we can see it in logs.
    if (!userEmail || !userName || !clubId || !role) {
      try {
        console.warn("SSO claims missing expected fields", {
          hasUserEmail: !!userEmail,
          hasUserName: !!userName,
          hasClubId: !!clubId,
          hasRole: !!role,
          payloadKeys:
            payload && typeof payload === "object" ? Object.keys(payload) : [],
        });
      } catch {
        // ignore
      }
    }

    if (!userId) {
      return Response.json({ error: "Missing user_id" }, { status: 401 });
    }

    if (!scopeHasWebsiteBuilder(scopeNormalized)) {
      return Response.json(
        { error: "Missing scope website_builder" },
        { status: 403 },
      );
    }

    // Auto-provision (idempotent): when a ClubSoft admin enables Website Builder
    // for a user+club, we create the club/website/pages on first SSO login.
    try {
      const ensured = await ensureClubWebsiteProvisioned({
        clubId,
        clubSlug: clubSlugClaim,
        clubName: clubNameClaim,
        templateKey: "coastal",
      });
      clubId = ensured?.clubId ?? clubId;
    } catch (e) {
      console.error("SSO auto-provision failed", e);
    }

    const exp = payload.exp;
    if (typeof exp === "number") {
      const expMs = exp * 1000;
      if (expMs <= Date.now()) {
        return Response.json({ error: "Token expired" }, { status: 401 });
      }
    }

    // Create our own Website Lite session (longer lived than handoff JWT)
    const sessionId = crypto.randomUUID();
    const sessionSeconds = 60 * 60 * 8; // 8 hours
    const expiresAt = new Date(Date.now() + sessionSeconds * 1000);

    await sql(
      "INSERT INTO website_lite_sessions (id, user_id, club_id, role, scope, expires_at, user_email, user_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        sessionId,
        String(userId),
        clubId ?? null,
        role ?? null,
        typeof scopeNormalized === "string"
          ? scopeNormalized
          : Array.isArray(scopeNormalized)
            ? scopeNormalized.join(" ")
            : String(scopeNormalized || ""),
        expiresAt.toISOString(),
        userEmail,
        userName,
      ],
    );

    // IMPORTANT: only set Secure cookies when the current request is https.
    // If we set Secure on http (common in dev), the browser will ignore the cookie.
    const secureCookie = request.url.startsWith("https://");

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: sessionId,
          user_id: String(userId),
          user_email: userEmail,
          user_name: userName,
          club_id: clubId ?? null,
          role: role ?? null,
          scope: scopeNormalized ?? null,
          expires_at: expiresAt.toISOString(),
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieString({
            name: "wl_session",
            value: sessionId,
            maxAgeSeconds: sessionSeconds,
            secure: !!secureCookie,
          }),
        },
      },
    );
  } catch (error) {
    console.error("POST /api/sso/verify error", error);
    return Response.json({ error: "Failed to verify" }, { status: 500 });
  }
}
