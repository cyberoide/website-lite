import crypto from "crypto";
import sql from "@/app/api/utils/sql";

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

export async function POST(request) {
  try {
    const env = String(process.env.ENV || "").toLowerCase();
    const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
    const isProd = env === "production" || nodeEnv === "production";

    // SSO is now live — do not allow dev-login on production.
    if (isProd) {
      return Response.json(
        { error: "Dev login is disabled on production" },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const clubId = body?.clubId ?? 1;

    const sessionId = crypto.randomUUID();
    const sessionSeconds = 60 * 60 * 8;
    const expiresAt = new Date(Date.now() + sessionSeconds * 1000);

    await sql(
      "INSERT INTO website_lite_sessions (id, user_id, club_id, role, scope, expires_at, user_email, user_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        sessionId,
        "dev-user",
        clubId,
        "clubsoft_admin",
        "website_builder",
        expiresAt.toISOString(),
        "dev@local",
        "Dev User",
      ],
    );

    // IMPORTANT: only set Secure cookies when the current request is https.
    const secureCookie = request.url.startsWith("https://");

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: sessionId,
          user_id: "dev-user",
          user_email: "dev@local",
          user_name: "Dev User",
          club_id: clubId,
          role: "clubsoft_admin",
          scope: "website_builder",
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
  } catch (e) {
    console.error("POST /api/sso/dev-login error", e);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
