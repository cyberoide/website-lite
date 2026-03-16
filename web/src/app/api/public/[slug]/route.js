import sql from "@/app/api/utils/sql";
import crypto from "crypto";

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
      // We want public sites to feel instant after an admin saves changes.
      // Keep CDN caching short and use ETag based on page content so we don't
      // get stuck serving stale content.
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
      // content is the important part that changes when admins edit pages
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

export async function GET(request, { params }) {
  const { slug } = params;

  const { searchParams } = new URL(request.url);
  const preview = searchParams.get("preview") === "1";

  try {
    // Join club + website (1 query) instead of separate lookups.
    const rows = preview
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
          [slug],
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
          [slug],
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
