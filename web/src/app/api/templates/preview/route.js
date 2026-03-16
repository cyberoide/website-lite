import { buildTemplates } from "@/app/api/templates/templates";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const templateKey = url.searchParams.get("templateKey");

    if (!templateKey) {
      return Response.json(
        { error: "templateKey is required" },
        { status: 400 },
      );
    }

    const templates = buildTemplates();

    // IMPORTANT: the 4 built-in Website Styles are canonical and cannot be overridden.
    if (templates[templateKey]) {
      return Response.json({ template: templates[templateKey] });
    }

    // For non-built-in templates, prefer admin-managed templates from DB
    const rows = await sql(
      "SELECT template_key, name, description, definition, is_enabled FROM website_lite_templates WHERE template_key = $1 LIMIT 1",
      [templateKey],
    );
    const row = rows?.[0] || null;
    if (row && row.is_enabled) {
      const def = row.definition || {};
      const template = {
        key: row.template_key,
        name: row.name,
        description: row.description,
        theme: def.theme || {},
        pages: def.pages || [],
      };
      return Response.json({ template });
    }

    return Response.json({ error: "Unknown template" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to load template preview" },
      { status: 500 },
    );
  }
}
