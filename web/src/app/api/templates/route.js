import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsTemplateEditing,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";
import { buildTemplates } from "@/app/api/templates/templates";

function normalizeTemplateRow(row) {
  const def = row?.definition || {};
  const key = row.template_key;

  return {
    key,
    name: row.name,
    description: row.description,
    theme: def.theme || {},
    pages: def.pages || [],
    source: "custom",
    is_enabled: row.is_enabled,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(request) {
  try {
    const templates = buildTemplates();
    const builtInKeys = new Set(Object.keys(templates));

    const builtInList = Object.values(templates).map((t) => ({
      ...t,
      source: "built-in",
      is_enabled: true,
    }));

    const rows = await sql(
      "SELECT template_key, name, description, definition, is_enabled, created_at, updated_at FROM website_lite_templates ORDER BY updated_at DESC",
      [],
    );

    // IMPORTANT: built-in keys are reserved and cannot be overridden by DB templates.
    // This keeps the 4 official Website Styles stable.
    const custom = (rows || [])
      .filter((r) => !builtInKeys.has(r.template_key))
      .map((r) => normalizeTemplateRow(r));

    return Response.json({ templates: [...custom, ...builtInList] });
  } catch (e) {
    console.error("GET /api/templates error", e);
    return Response.json(
      { error: "Failed to load templates" },
      { status: 500 },
    );
  }
}

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

    const templateKey = body?.template_key;
    const name = body?.name;
    const description = body?.description || "";
    const definition = body?.definition;
    const isEnabled =
      typeof body?.is_enabled === "boolean" ? body.is_enabled : true;

    // ADD: prevent overriding reserved built-in templates
    const builtInKeys = new Set(Object.keys(buildTemplates()));
    if (typeof templateKey === "string" && builtInKeys.has(templateKey)) {
      return Response.json(
        {
          error:
            "This template key is reserved for a built-in Website Style and can’t be edited.",
        },
        { status: 400 },
      );
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

    if (!definition || typeof definition !== "object") {
      return Response.json(
        { error: "definition is required" },
        { status: 400 },
      );
    }

    await sql(
      `INSERT INTO website_lite_templates (template_key, name, description, definition, is_enabled, created_by_user_id, created_by_role)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
       ON CONFLICT (template_key)
       DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         definition = EXCLUDED.definition,
         is_enabled = EXCLUDED.is_enabled,
         updated_at = CURRENT_TIMESTAMP`,
      [
        templateKey,
        name,
        description,
        JSON.stringify(definition),
        isEnabled,
        session.user_id,
        session.role,
      ],
    );

    return Response.json({ success: true, template_key: templateKey });
  } catch (e) {
    console.error("POST /api/templates error", e);
    return Response.json({ error: "Failed to save template" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!roleAllowsTemplateEditing(session.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const templateKey = url.searchParams.get("templateKey");

    if (!templateKey) {
      return Response.json(
        { error: "templateKey is required" },
        { status: 400 },
      );
    }

    await sql("DELETE FROM website_lite_templates WHERE template_key = $1", [
      templateKey,
    ]);

    return Response.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/templates error", e);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
