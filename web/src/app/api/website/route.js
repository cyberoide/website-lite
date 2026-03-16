import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsClubEditing,
  roleAllowsClubRead,
  roleAllowsTemplateEditing,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";
import { ensureWebsiteAndPagesProvisioned } from "@/app/api/utils/provisionWebsiteLite";
import { buildPresetContent } from "@/utils/presetPageContent";

export async function GET(request) {
  const { session, errorResponse } = await requireWebsiteLiteSession(request);
  if (errorResponse) return errorResponse;

  if (!scopeAllowsWebsiteBuilder(session.scope)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId") || session.club_id;

  if (!clubId) {
    return Response.json({ error: "Club ID is required" }, { status: 400 });
  }

  // Club admins can only read their own club.
  // ClubSoft-wide roles (including investors/viewers) can read any club.
  const canReadAllClubs = roleAllowsTemplateRead(session.role);
  const canReadClub = roleAllowsClubRead(session.role);
  const sameClub =
    session.club_id && Number(session.club_id) === Number(clubId);

  if (!canReadAllClubs) {
    if (!canReadClub || !sameClub) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    let [website] = await sql`
      SELECT w.*, c.name as club_name, c.slug as club_slug
      FROM websites w
      JOIN clubs c ON w.club_id = c.id
      WHERE w.club_id = ${clubId}
    `;

    // Auto-provision: if ClubSoft enabled Website Builder for a club but the website
    // hasn't been provisioned in Website Lite yet, create the website + starter pages.
    if (!website) {
      try {
        await ensureWebsiteAndPagesProvisioned({
          clubId: Number(clubId),
          templateKey: "coastal",
        });

        // Re-fetch
        [website] = await sql`
          SELECT w.*, c.name as club_name, c.slug as club_slug
          FROM websites w
          JOIN clubs c ON w.club_id = c.id
          WHERE w.club_id = ${clubId}
        `;
      } catch (e) {
        console.error("Auto-provision website failed", e);
      }
    }

    if (!website) {
      return Response.json({ error: "Website not found" }, { status: 404 });
    }

    return Response.json(website);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch website" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      club_id,
      primary_color,
      secondary_color,
      is_published,
      branding_source,
      logo_url,
      icon_url,
      clubsoft_branding_snapshot,
      clubsoft_branding_last_synced_at,
      contact_phone,
      contact_email,
      contact_address,
      social_links,
      social_bar_position,
      social_display_style,
      // typography + header CTA
      body_font,
      heading_font,
      body_text_color,
      heading_text_color,
      header_cta_enabled,
      header_cta_action,
      // header/menu styling
      nav_color_mode,
      nav_link_color,
      nav_active_color,
      // social bar options
      social_show_address,
      // site structure
      navigation_mode,
      // custom domains
      custom_domain,
    } = body;

    if (!club_id) {
      return Response.json({ error: "Club ID is required" }, { status: 400 });
    }

    // Club admins can only update their own club.
    // ClubSoft admins can update any club.
    const isTemplateAdmin = roleAllowsTemplateEditing(session.role);
    const isClubEditor = roleAllowsClubEditing(session.role);
    const sameClub =
      session.club_id && Number(session.club_id) === Number(club_id);
    if (!isTemplateAdmin) {
      if (!isClubEditor || !sameClub) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // jsonb fields must be serialized consistently
    const socialLinksJson =
      typeof social_links === "undefined"
        ? undefined
        : JSON.stringify(social_links);
    const brandingSnapshotJson =
      typeof clubsoft_branding_snapshot === "undefined"
        ? undefined
        : JSON.stringify(clubsoft_branding_snapshot);

    // normalize navigation_mode
    const normalizedNavigationMode =
      navigation_mode === "single"
        ? "single"
        : navigation_mode === "multi"
          ? "multi"
          : undefined;

    // Normalize custom domain: store the apex (strip scheme/path/www)
    const hasCustomDomain = Object.prototype.hasOwnProperty.call(
      body,
      "custom_domain",
    );

    let normalizedCustomDomain =
      typeof custom_domain === "string" ? custom_domain.trim() : "";
    if (normalizedCustomDomain) {
      normalizedCustomDomain = normalizedCustomDomain
        .replace(/^https?:\/\//i, "")
        .split("/")[0]
        .toLowerCase();
      if (normalizedCustomDomain.startsWith("www.")) {
        normalizedCustomDomain = normalizedCustomDomain.slice(4);
      }
    }

    const customDomainToSave = !hasCustomDomain
      ? undefined
      : normalizedCustomDomain || null;

    let updatedWebsite;
    try {
      [updatedWebsite] = await sql`
        UPDATE websites
        SET 
          primary_color = COALESCE(${primary_color}, primary_color),
          secondary_color = COALESCE(${secondary_color}, secondary_color),
          is_published = COALESCE(${is_published}, is_published),
          branding_source = COALESCE(${branding_source}, branding_source),
          logo_url = COALESCE(${logo_url}, logo_url),
          icon_url = COALESCE(${icon_url}, icon_url),
          contact_phone = COALESCE(${contact_phone}, contact_phone),
          contact_email = COALESCE(${contact_email}, contact_email),
          contact_address = COALESCE(${contact_address}, contact_address),
          social_links = COALESCE(${socialLinksJson}::jsonb, social_links),
          social_bar_position = COALESCE(${social_bar_position}, social_bar_position),
          social_display_style = COALESCE(${social_display_style}, social_display_style),
          clubsoft_branding_snapshot = COALESCE(${brandingSnapshotJson}::jsonb, clubsoft_branding_snapshot),
          clubsoft_branding_last_synced_at = COALESCE(${clubsoft_branding_last_synced_at}::timestamptz, clubsoft_branding_last_synced_at),
          body_font = COALESCE(${body_font}, body_font),
          heading_font = COALESCE(${heading_font}, heading_font),
          body_text_color = COALESCE(${body_text_color}, body_text_color),
          heading_text_color = COALESCE(${heading_text_color}, heading_text_color),
          header_cta_enabled = COALESCE(${header_cta_enabled}, header_cta_enabled),
          header_cta_action = COALESCE(${header_cta_action}, header_cta_action),

          -- header/menu styling
          nav_color_mode = COALESCE(${nav_color_mode}, nav_color_mode),
          nav_link_color = COALESCE(${nav_link_color}, nav_link_color),
          nav_active_color = COALESCE(${nav_active_color}, nav_active_color),

          -- social bar options
          social_show_address = COALESCE(${social_show_address}, social_show_address),

          navigation_mode = COALESCE(${normalizedNavigationMode}, navigation_mode),

          -- IMPORTANT: only update custom_domain when the request included it.
          -- This avoids Postgres "could not determine data type" errors and prevents
          -- clearing Cloudflare state on unrelated saves.
          custom_domain = CASE
            WHEN ${hasCustomDomain} THEN (${customDomainToSave}::text)
            ELSE custom_domain
          END,
          custom_domain_cloudflare = CASE
            WHEN ${hasCustomDomain} = false THEN custom_domain_cloudflare
            WHEN (${customDomainToSave}::text) IS NULL THEN NULL
            WHEN (${customDomainToSave}::text) = custom_domain THEN custom_domain_cloudflare
            ELSE NULL
          END,

          updated_at = CURRENT_TIMESTAMP
        WHERE club_id = ${club_id}
        RETURNING *
      `;
    } catch (dbError) {
      // Handle unique constraint for custom domains cleanly
      const code = typeof dbError?.code === "string" ? dbError.code : "";
      const message =
        typeof dbError?.message === "string" ? dbError.message : "";
      if (
        code === "23505" ||
        message.toLowerCase().includes("websites_custom_domain_unique_idx")
      ) {
        return Response.json(
          { error: "That domain is already connected to another club." },
          { status: 409 },
        );
      }
      throw dbError;
    }

    // Auto-create the CTA pages when header buttons are enabled.
    // This prevents Join Us/Member Login from pointing back to Home on clubs that only
    // have a single starter page.
    try {
      const ctaEnabled = updatedWebsite?.header_cta_enabled === true;
      const modeRaw =
        typeof updatedWebsite?.header_cta_action === "string"
          ? updatedWebsite.header_cta_action
          : "join";
      const mode =
        modeRaw === "both" ? "both" : modeRaw === "login" ? "login" : "join";

      const needsMembership =
        ctaEnabled && (mode === "join" || mode === "both");
      const needsLogin = ctaEnabled && (mode === "login" || mode === "both");

      if (needsMembership || needsLogin) {
        const [clubRow] =
          await sql`SELECT name FROM clubs WHERE id = ${club_id} LIMIT 1`;
        const clubName = typeof clubRow?.name === "string" ? clubRow.name : "";

        const pages = await sql`
          SELECT id, slug, is_enabled, in_navigation, content, order_index
          FROM pages
          WHERE website_id = ${updatedWebsite.id}
          ORDER BY order_index ASC
        `;

        const maxOrderIndex = pages.reduce((acc, p) => {
          const v = Number(p?.order_index);
          if (Number.isFinite(v) && v > acc) return v;
          return acc;
        }, 0);

        const ensurePage = async ({ slug, title, presetKey, orderOffset }) => {
          const existing = pages.find((p) => p?.slug === slug);

          if (existing) {
            // If the page exists but is disabled, enabling the CTA should re-enable it.
            if (existing?.is_enabled !== true) {
              await sql`
                UPDATE pages
                SET is_enabled = true
                WHERE id = ${existing.id}
              `;
            }
            return;
          }

          const contentJson = JSON.stringify(
            buildPresetContent(presetKey, clubName),
          );
          await sql`
            INSERT INTO pages (
              website_id,
              title,
              slug,
              type,
              content,
              order_index,
              is_enabled,
              in_navigation
            )
            VALUES (
              ${updatedWebsite.id},
              ${title},
              ${slug},
              ${presetKey},
              ${contentJson}::jsonb,
              ${maxOrderIndex + orderOffset},
              true,
              false
            )
          `;
        };

        if (needsMembership) {
          await ensurePage({
            slug: "membership",
            title: "Membership",
            presetKey: "membership",
            orderOffset: 1,
          });
        }

        if (needsLogin) {
          await ensurePage({
            slug: "login",
            title: "Member Login",
            presetKey: "login",
            orderOffset: needsMembership ? 2 : 1,
          });
        }
      }
    } catch (e) {
      // Non-fatal: saving website settings should still succeed even if seeding pages fails.
      console.error("Failed to ensure CTA pages", e);
    }

    return Response.json(updatedWebsite);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update website" },
      { status: 500 },
    );
  }
}
