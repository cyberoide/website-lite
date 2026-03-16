import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsTemplateEditing,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";
import { buildTemplates } from "@/app/api/templates/templates";

export async function POST(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!roleAllowsTemplateEditing(session.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const clubId = body?.clubId;
    const templateKey = body?.template_key;
    const name = body?.name;
    const description = body?.description || "";

    // ADD: prevent overriding built-in Website Styles
    const builtInKeys = new Set(Object.keys(buildTemplates()));
    if (typeof templateKey === "string" && builtInKeys.has(templateKey)) {
      return Response.json(
        {
          error:
            "This template key is reserved for a built-in Website Style and can’t be saved from a club website.",
        },
        { status: 400 },
      );
    }

    if (!clubId) {
      return Response.json({ error: "clubId is required" }, { status: 400 });
    }

    if (!templateKey || typeof templateKey !== "string") {
      return Response.json(
        { error: "template_key is required" },
        { status: 400 },
      );
    }

    if (!name || typeof name !== "string") {
      return Response.json({ error: "name is required" }, { status: 400 });
    }

    const websiteRows = await sql(
      "SELECT id, primary_color, secondary_color FROM websites WHERE club_id = $1 LIMIT 1",
      [clubId],
    );
    const website = websiteRows?.[0] || null;

    if (!website) {
      return Response.json({ error: "Website not found" }, { status: 404 });
    }

    const pages = await sql(
      "SELECT title, slug, type, content, order_index, is_enabled FROM pages WHERE website_id = $1 ORDER BY order_index ASC",
      [website.id],
    );

    const definition = {
      theme: {
        primary_color: website.primary_color,
        secondary_color: website.secondary_color,
      },
      pages: (pages || []).map((p) => ({
        title: p.title,
        slug: p.slug,
        type: p.type,
        is_enabled: p.is_enabled,
        content: Array.isArray(p.content) ? p.content : p.content || [],
      })),
    };

    await sql(
      `INSERT INTO website_lite_templates (template_key, name, description, definition, is_enabled, created_by_user_id, created_by_role)
       VALUES ($1, $2, $3, $4::jsonb, true, $5, $6)
       ON CONFLICT (template_key)
       DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         definition = EXCLUDED.definition,
         updated_at = CURRENT_TIMESTAMP`,
      [
        templateKey,
        name,
        description,
        JSON.stringify(definition),
        session.user_id,
        session.role,
      ],
    );

    return Response.json({ success: true, template_key: templateKey });
  } catch (e) {
    console.error("POST /api/templates/save-from-website error", e);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
