import sql from "@/app/api/utils/sql";
import crypto from "crypto";

function normalizeHost(host) {
  if (typeof host !== "string") return "";
  let h = host.trim().toLowerCase();
  if (!h) return "";
  if (h.includes(":")) {
    h = h.split(":")[0];
  }
  if (h.startsWith("www.")) {
    h = h.slice(4);
  }
  return h;
}

function computeEtag({ website, pagesSignature }) {
  const websiteId = website?.id;
  const updatedAt = website?.updated_at;

  let safeUpdated = "";
  if (typeof updatedAt === "string") {
    safeUpdated = updatedAt;
  } else if (updatedAt instanceof Date) {
    safeUpdated = updatedAt.toISOString();
  }

  const safeWebsiteId = Number.isFinite(Number(websiteId))
    ? Number(websiteId)
    : 0;
  const safeSig =
    typeof pagesSignature === "string" && pagesSignature.trim()
      ? pagesSignature.trim()
      : "nosig";
  return `W/\"site-${safeWebsiteId}-${safeSig}-${safeUpdated}\"`;
}

function cacheHeaders({ preview, etag }) {
  if (preview) {
    return {
      "Cache-Control": "no-store",
    };
  }

  return {
    "Cache-Control":
      "public, max-age=0, s-maxage=15, stale-while-revalidate=60",
    ETag: etag,
  };
}

function computePagesSignature(pages) {
  try {
    const minimal = (Array.isArray(pages) ? pages : []).map((p) => ({
      id: p?.id,
      slug: p?.slug,
      order_index: p?.order_index,
      is_enabled: p?.is_enabled,
      in_navigation: p?.in_navigation,
      content: p?.content,
    }));

    return crypto
      .createHash("sha1")
      .update(JSON.stringify(minimal))
      .digest("hex")
      .slice(0, 12);
  } catch (e) {
    return "nosig";
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hostRaw = searchParams.get("host") || "";
  const preview = searchParams.get("preview") === "1";

  const host = normalizeHost(hostRaw);
  if (!host) {
    return Response.json(
      { error: "host is required" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    // Host mode: resolve (subdomain or custom domain) and join to website
    const ROOT = "clubsoft.site";

    let resolvedSlug = "";
    if (host.endsWith(`.${ROOT}`)) {
      const maybeSlug = host.slice(0, -`.${ROOT}`.length);
      if (maybeSlug && maybeSlug !== "www") {
        resolvedSlug = maybeSlug;
      }
    }

    const rows = resolvedSlug
      ? preview
        ? await sql(
            `
            SELECT
              c.id as club_id,
              c.name as club_name,
              c.slug as club_slug,
              c.logo_url as club_logo_url,
              c.created_at as club_created_at,
              w.*
            FROM clubs c
            JOIN websites w ON w.club_id = c.id
            WHERE c.slug = $1
            LIMIT 1
          `,
            [resolvedSlug],
          )
        : await sql(
            `
            SELECT
              c.id as club_id,
              c.name as club_name,
              c.slug as club_slug,
              c.logo_url as club_logo_url,
              c.created_at as club_created_at,
              w.*
            FROM clubs c
            JOIN websites w ON w.club_id = c.id
            WHERE c.slug = $1 AND w.is_published = true
            LIMIT 1
          `,
            [resolvedSlug],
          )
      : preview
        ? await sql(
            `
            SELECT
              c.id as club_id,
              c.name as club_name,
              c.slug as club_slug,
              c.logo_url as club_logo_url,
              c.created_at as club_created_at,
              w.*
            FROM websites w
            JOIN clubs c ON c.id = w.club_id
            WHERE LOWER(w.custom_domain) = $1
            LIMIT 1
          `,
            [host],
          )
        : await sql(
            `
            SELECT
              c.id as club_id,
              c.name as club_name,
              c.slug as club_slug,
              c.logo_url as club_logo_url,
              c.created_at as club_created_at,
              w.*
            FROM websites w
            JOIN clubs c ON c.id = w.club_id
            WHERE LOWER(w.custom_domain) = $1 AND w.is_published = true
            LIMIT 1
          `,
            [host],
          );

    const row = rows?.[0];
    if (!row) {
      return Response.json(
        {
          error: preview
            ? "Website not found"
            : "Website not published or not found",
        },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    const club = {
      id: row.club_id,
      name: row.club_name,
      slug: row.club_slug,
      logo_url: row.club_logo_url,
      created_at: row.club_created_at,
    };

    const {
      club_id: _club_id,
      club_name: _club_name,
      club_slug: _club_slug,
      club_logo_url: _club_logo_url,
      club_created_at: _club_created_at,
      ...website
    } = row;

    const pages = preview
      ? await sql(
          `
          SELECT * FROM pages
          WHERE website_id = $1
          ORDER BY order_index ASC
        `,
          [website.id],
        )
      : await sql(
          `
          SELECT * FROM pages
          WHERE website_id = $1 AND is_enabled = true
          ORDER BY order_index ASC
        `,
          [website.id],
        );

    const pagesSignature = computePagesSignature(pages);
    const etag = computeEtag({ website, pagesSignature });

    if (!preview) {
      const ifNoneMatch = request.headers.get("if-none-match");
      if (ifNoneMatch && ifNoneMatch === etag) {
        return new Response(null, {
          status: 304,
          headers: cacheHeaders({ preview, etag }),
        });
      }
    }

    return Response.json(
      {
        club,
        website,
        pages,
        preview,
      },
      {
        headers: cacheHeaders({ preview, etag }),
      },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch public site data" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
