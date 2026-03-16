import sql from "@/app/api/utils/sql";

function cookieString({ name, value, secure }) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

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

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies.wl_session;

    if (sessionId) {
      try {
        await sql("DELETE FROM website_lite_sessions WHERE id = $1", [
          sessionId,
        ]);
      } catch (e) {
        console.error("Failed deleting session", e);
      }
    }

    const secureCookie =
      request.url.startsWith("https") ||
      process.env.AUTH_URL?.startsWith("https");

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieString({
          name: "wl_session",
          value: "",
          secure: !!secureCookie,
        }),
      },
    });
  } catch (e) {
    console.error("POST /api/sso/logout error", e);
    return Response.json({ error: "Failed to logout" }, { status: 500 });
  }
}
