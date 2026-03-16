import sql from "@/app/api/utils/sql";

function normalizeHost(host) {
  if (typeof host !== "string") return "";
  let h = host.trim().toLowerCase();
  if (!h) return "";

  // Strip port if present
  if (h.includes(":")) {
    h = h.split(":")[0];
  }

  // Normalize www
  if (h.startsWith("www.")) {
    h = h.slice(4);
  }

  return h;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hostRaw = searchParams.get("host") || "";

  const host = normalizeHost(hostRaw);
  if (!host) {
    return Response.json({ error: "Host is required" }, { status: 400 });
  }

  try {
    // 1) Map *.clubsoft.site subdomains directly to clubs.slug
    const ROOT = "clubsoft.site";
    if (host.endsWith(`.${ROOT}`)) {
      const slug = host.slice(0, -`.${ROOT}`.length);
      if (slug && slug !== "www") {
        const [club] = await sql`SELECT slug FROM clubs WHERE slug = ${slug}`;
        if (club?.slug) {
          return Response.json({ slug: club.slug, source: "subdomain" });
        }
      }
    }

    // 2) Map custom domains (stored on websites.custom_domain)
    const [row] = await sql`
      SELECT c.slug
      FROM websites w
      JOIN clubs c ON c.id = w.club_id
      WHERE LOWER(w.custom_domain) = ${host}
      LIMIT 1
    `;

    if (!row?.slug) {
      return Response.json(
        { error: "No club found for host" },
        { status: 404 },
      );
    }

    return Response.json({ slug: row.slug, source: "custom_domain" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to resolve host" }, { status: 500 });
  }
}
