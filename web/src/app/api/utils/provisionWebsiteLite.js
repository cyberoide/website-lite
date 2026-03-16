import sql from "@/app/api/utils/sql";
import { buildTemplates } from "@/app/api/templates/templates";

function normalizeTemplateKey(key) {
  if (typeof key !== "string") return "coastal";
  const trimmed = key.trim();
  return trimmed || "coastal";
}

function pickTemplateKey({ requestedTemplateKey, existingTemplateKey }) {
  const templates = buildTemplates();

  const existing = normalizeTemplateKey(existingTemplateKey);
  if (templates[existing]) return existing;

  const requested = normalizeTemplateKey(requestedTemplateKey);
  if (templates[requested]) return requested;

  return "coastal";
}

export async function ensureClubExistsBySlug({ clubSlug, clubName }) {
  const slug = typeof clubSlug === "string" ? clubSlug.trim() : "";
  if (!slug) {
    return { clubId: null, created: false, updated: false };
  }

  const cleanClubName =
    typeof clubName === "string" && clubName.trim() ? clubName.trim() : "";

  const [existing] = await sql(
    "SELECT id, name, slug FROM clubs WHERE slug = $1 LIMIT 1",
    [slug],
  );
  if (existing?.id) {
    // If the club already exists but it was originally created with a placeholder name
    // (common when we only had the slug), upgrade it to the human-friendly name.
    let updated = false;
    const existingName =
      typeof existing.name === "string" ? existing.name.trim() : "";
    const existingSlug =
      typeof existing.slug === "string" ? existing.slug.trim() : "";

    const looksLikePlaceholder = !existingName || existingName === existingSlug;

    if (
      cleanClubName &&
      looksLikePlaceholder &&
      cleanClubName !== existingName
    ) {
      try {
        await sql("UPDATE clubs SET name = $1 WHERE id = $2", [
          cleanClubName,
          existing.id,
        ]);
        updated = true;
      } catch (e) {
        // non-fatal
      }
    }

    return { clubId: existing.id, created: false, updated };
  }

  const nameToUse = cleanClubName || slug;

  const [created] = await sql(
    "INSERT INTO clubs (name, slug) VALUES ($1, $2) RETURNING id",
    [nameToUse, slug],
  );

  return { clubId: created?.id ?? null, created: true, updated: false };
}

export async function ensureWebsiteAndPagesProvisioned({
  clubId,
  templateKey,
}) {
  if (!clubId) {
    return { website: null, provisioned: false };
  }

  const templates = buildTemplates();

  // 1) Ensure website exists
  let website = null;
  const existingWebsiteRows = await sql(
    "SELECT * FROM websites WHERE club_id = $1 LIMIT 1",
    [clubId],
  );
  website = existingWebsiteRows?.[0] ?? null;

  let provisioned = false;
  if (!website) {
    const keyToUse = pickTemplateKey({ requestedTemplateKey: templateKey });

    // Create website (one-per-club). If there is a race, the ON CONFLICT keeps it safe.
    await sql(
      "INSERT INTO websites (club_id, branding_source, selected_template_key) VALUES ($1, 'custom', $2) ON CONFLICT (club_id) DO NOTHING",
      [clubId, keyToUse],
    );

    const rowsAfter = await sql(
      "SELECT * FROM websites WHERE club_id = $1 LIMIT 1",
      [clubId],
    );
    website = rowsAfter?.[0] ?? null;
    provisioned = true;
  }

  if (!website?.id) {
    return { website: null, provisioned };
  }

  // 2) Seed starter pages if none exist
  const countRows = await sql(
    "SELECT COUNT(*)::int AS count FROM pages WHERE website_id = $1",
    [website.id],
  );
  const pageCount = countRows?.[0]?.count ?? 0;

  if (pageCount === 0) {
    const keyToUse = pickTemplateKey({
      requestedTemplateKey: templateKey,
      existingTemplateKey: website.selected_template_key,
    });
    const tpl = templates[keyToUse] || templates.coastal;

    // Make sure selected_template_key is set (if it was null)
    if (!website.selected_template_key) {
      const [updated] = await sql(
        "UPDATE websites SET selected_template_key = $1 WHERE id = $2 RETURNING *",
        [keyToUse, website.id],
      );
      website = updated ?? website;
    }

    const inserts = [];
    for (let i = 0; i < tpl.pages.length; i++) {
      const p = tpl.pages[i];
      inserts.push(
        sql(
          "INSERT INTO pages (website_id, title, slug, type, content, order_index, is_enabled) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)",
          [
            website.id,
            p.title,
            p.slug,
            p.type,
            JSON.stringify(p.content || []),
            i,
            p.is_enabled !== false,
          ],
        ),
      );
    }

    // Seed pages in a transaction to avoid partial inserts.
    await sql.transaction(inserts);
    provisioned = true;
  }

  return { website, provisioned };
}

export async function ensureClubWebsiteProvisioned({
  clubId,
  clubSlug,
  clubName,
  templateKey,
}) {
  // Prefer mapping by slug to keep Website Lite's DB stable even if ClubSoft uses different numeric ids.
  let finalClubId = clubId ?? null;

  if (clubSlug) {
    const ensured = await ensureClubExistsBySlug({ clubSlug, clubName });
    if (ensured?.clubId) {
      finalClubId = ensured.clubId;
    }
  }

  // If we still have an id, make sure it exists.
  if (finalClubId) {
    const clubRows = await sql("SELECT id FROM clubs WHERE id = $1 LIMIT 1", [
      finalClubId,
    ]);
    const exists = !!clubRows?.[0]?.id;
    if (!exists) {
      // Can't safely create a club without a slug.
      finalClubId = null;
    }
  }

  const { website, provisioned } = await ensureWebsiteAndPagesProvisioned({
    clubId: finalClubId,
    templateKey,
  });

  return { clubId: finalClubId, website, provisioned };
}
