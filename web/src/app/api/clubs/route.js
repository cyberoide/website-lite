import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsTemplateEditing,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";
import { buildTemplates } from "@/app/api/templates/templates";

export async function GET(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // ClubSoft-wide roles (including investors/viewers) can list all clubs.
    if (!roleAllowsTemplateRead(session.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const clubs = await sql`
      SELECT id, name, slug
      FROM clubs
      ORDER BY name ASC
    `;

    return Response.json({ clubs });
  } catch (e) {
    console.error("GET /api/clubs error", e);
    return Response.json({ error: "Failed to list clubs" }, { status: 500 });
  }
}

// ADD: create a new club + website (Platform Admin only)
export async function POST(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only ClubSoft admins can provision new clubs in Website Lite.
    if (!roleAllowsTemplateEditing(session.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const templateKey =
      typeof body?.templateKey === "string" && body.templateKey.trim()
        ? body.templateKey.trim()
        : "coastal";

    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }
    if (!slug) {
      return Response.json({ error: "slug is required" }, { status: 400 });
    }

    const templates = buildTemplates();
    const tpl = templates[templateKey] || null;
    if (!tpl) {
      return Response.json({ error: "Unknown templateKey" }, { status: 400 });
    }

    const existing = await sql("SELECT id FROM clubs WHERE slug = $1", [slug]);
    if ((existing || []).length > 0) {
      return Response.json(
        { error: "A club with that slug already exists" },
        { status: 409 },
      );
    }

    // IMPORTANT: sql.transaction expects a callback returning an array of queries.
    const results = await sql.transaction((txn) => {
      const queries = [];

      // Create club
      queries.push(txn`
        INSERT INTO clubs (name, slug)
        VALUES (${name}, ${slug})
      `);

      // Create website
      queries.push(txn`
        INSERT INTO websites (club_id, branding_source, selected_template_key)
        VALUES (
          (SELECT id FROM clubs WHERE slug = ${slug}),
          'custom',
          ${templateKey}
        )
      `);

      // Create starter pages
      for (let i = 0; i < tpl.pages.length; i++) {
        const p = tpl.pages[i];
        queries.push(txn`
          INSERT INTO pages (website_id, title, slug, type, content, order_index, is_enabled)
          VALUES (
            (
              SELECT w.id
              FROM websites w
              JOIN clubs c ON w.club_id = c.id
              WHERE c.slug = ${slug}
              LIMIT 1
            ),
            ${p.title},
            ${p.slug},
            ${p.type},
            ${JSON.stringify(p.content)}::jsonb,
            ${i},
            ${p.is_enabled}
          )
        `);
      }

      // Return created rows
      queries.push(txn`SELECT * FROM clubs WHERE slug = ${slug}`);
      queries.push(
        txn`
          SELECT * FROM websites
          WHERE club_id = (SELECT id FROM clubs WHERE slug = ${slug})
          LIMIT 1
        `,
      );

      return queries;
    });

    const clubRows = results[results.length - 2] || [];
    const websiteRows = results[results.length - 1] || [];
    const club = clubRows[0] || null;
    const website = websiteRows[0] || null;

    return Response.json({ success: true, club, website });
  } catch (e) {
    console.error("POST /api/clubs error", e);
    return Response.json({ error: "Failed to create club" }, { status: 500 });
  }
}
