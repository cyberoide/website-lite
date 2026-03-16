import sql from "@/app/api/utils/sql";
import { buildTemplates } from "@/app/api/templates/templates";
import {
  requireWebsiteLiteSession,
  roleAllowsClubEditing,
  roleAllowsTemplateEditing,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";

export async function POST(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { clubId, templateKey, replaceExisting } = body;

    if (!clubId || !templateKey) {
      return Response.json(
        { error: "clubId and templateKey are required" },
        { status: 400 },
      );
    }

    // Club admins can apply templates only for their own club.
    // ClubSoft admins can apply to any club.
    const isTemplateAdmin = roleAllowsTemplateEditing(session.role);
    const isClubEditor = roleAllowsClubEditing(session.role);
    const sameClub =
      session.club_id && Number(session.club_id) === Number(clubId);

    if (!isTemplateAdmin) {
      if (!isClubEditor || !sameClub) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const templates = buildTemplates();

    // IMPORTANT: built-in Website Styles are canonical.
    // Do NOT allow DB templates to override built-in keys.
    let template = null;
    if (templates[templateKey]) {
      template = templates[templateKey];
    } else {
      // Prefer admin-managed templates from DB for non-built-in keys
      const rows = await sql(
        "SELECT template_key, name, description, definition, is_enabled FROM website_lite_templates WHERE template_key = $1 LIMIT 1",
        [templateKey],
      );
      const row = rows?.[0] || null;
      if (row && row.is_enabled) {
        const def = row.definition || {};
        template = {
          key: row.template_key,
          name: row.name,
          description: row.description,
          theme: def.theme || {},
          pages: def.pages || [],
        };
      }
    }

    if (!template) {
      return Response.json({ error: "Unknown template" }, { status: 400 });
    }

    const [website] =
      await sql`SELECT * FROM websites WHERE club_id = ${clubId}`;
    if (!website) {
      return Response.json({ error: "Website not found" }, { status: 404 });
    }

    // NOTE: Applying a Website Style should NEVER override club branding.
    // Styles control presentation (header/footer variants) and OPTIONAL starter pages.

    const shouldReplacePages = replaceExisting === true;

    if (!shouldReplacePages) {
      // Safe mode: keep all existing pages and content.
      await sql`
        UPDATE websites
        SET
          selected_template_key = ${templateKey},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${website.id}
      `;

      return Response.json({
        success: true,
        applied: template.key,
        replaceExisting: false,
      });
    }

    // Starter-pages mode: replace pages for the website.
    await sql.transaction((txn) => {
      const queries = [];

      // IMPORTANT: keep existing branding (colors, logo, fonts, etc).
      // Only switch the selected template key.
      queries.push(txn`
        UPDATE websites
        SET
          selected_template_key = ${templateKey},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${website.id}
      `);

      queries.push(txn`DELETE FROM pages WHERE website_id = ${website.id}`);

      for (let i = 0; i < template.pages.length; i++) {
        const p = template.pages[i];
        queries.push(txn`
          INSERT INTO pages (website_id, title, slug, type, content, order_index, is_enabled)
          VALUES (
            ${website.id},
            ${p.title},
            ${p.slug},
            ${p.type},
            ${JSON.stringify(p.content)}::jsonb,
            ${i},
            ${p.is_enabled}
          )
        `);
      }

      return queries;
    });

    return Response.json({
      success: true,
      applied: template.key,
      replaceExisting: true,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to apply template" },
      { status: 500 },
    );
  }
}
