import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsClubEditing,
  roleAllowsClubRead,
  roleAllowsTemplateEditing,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const websiteId = searchParams.get("websiteId");
  const id = searchParams.get("id");

  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const canReadAllClubs = roleAllowsTemplateRead(session.role);
    const canReadClub = roleAllowsClubRead(session.role);

    if (id) {
      const [row] = await sql`
        SELECT p.*, w.club_id as _club_id
        FROM pages p
        JOIN websites w ON w.id = p.website_id
        WHERE p.id = ${id}
      `;

      if (!row) return Response.json([]);

      const sameClub =
        session.club_id && Number(session.club_id) === Number(row._club_id);

      if (!canReadAllClubs) {
        if (!canReadClub || !sameClub) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      const { _club_id, ...page } = row;
      return Response.json([page]);
    }

    if (!websiteId) {
      return Response.json(
        { error: "Website ID or Page ID is required" },
        { status: 400 },
      );
    }

    const [website] =
      await sql`SELECT club_id FROM websites WHERE id = ${websiteId}`;
    if (!website) {
      return Response.json({ error: "Website not found" }, { status: 404 });
    }

    const sameClub =
      session.club_id && Number(session.club_id) === Number(website.club_id);

    if (!canReadAllClubs) {
      if (!canReadClub || !sameClub) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const pages = await sql`
      SELECT * FROM pages 
      WHERE website_id = ${websiteId}
      ORDER BY order_index ASC
    `;
    return Response.json(pages);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const isTemplateAdmin = roleAllowsTemplateEditing(session.role);
    const isClubEditor = roleAllowsClubEditing(session.role);

    const body = await request.json();
    const {
      id,
      website_id,
      title,
      slug,
      type,
      content,
      order_index,
      is_enabled,
      in_navigation, // NEW
    } = body;

    // Determine website + club for authorization
    const websiteIdToCheck = website_id || (id ? null : null);
    let clubIdToCheck = null;
    if (websiteIdToCheck) {
      const [w] =
        await sql`SELECT club_id FROM websites WHERE id = ${websiteIdToCheck}`;
      clubIdToCheck = w?.club_id ?? null;
    }
    if (!clubIdToCheck && id) {
      const [row] = await sql`
        SELECT w.club_id
        FROM pages p
        JOIN websites w ON w.id = p.website_id
        WHERE p.id = ${id}
      `;
      clubIdToCheck = row?.club_id ?? null;
    }

    if (!clubIdToCheck) {
      return Response.json({ error: "Website not found" }, { status: 404 });
    }

    const sameClub =
      session.club_id && Number(session.club_id) === Number(clubIdToCheck);
    if (!isTemplateAdmin) {
      if (!isClubEditor || !sameClub) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Ensure jsonb content always serializes consistently (fixes Save issues)
    const contentJson =
      content === undefined ? undefined : JSON.stringify(content);

    if (id) {
      // Update existing page
      const [updatedPage] = await sql`
        UPDATE pages
        SET 
          title = COALESCE(${title}, title),
          slug = COALESCE(${slug}, slug),
          type = COALESCE(${type}, type),
          content = COALESCE(${contentJson}::jsonb, content),
          order_index = COALESCE(${order_index}, order_index),
          is_enabled = COALESCE(${is_enabled}, is_enabled),
          in_navigation = COALESCE(${in_navigation}, in_navigation)
        WHERE id = ${id}
        RETURNING *
      `;
      return Response.json(updatedPage);
    } else {
      // Create new page
      if (!website_id || !title || !slug || !type) {
        return Response.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      const contentToInsert = JSON.stringify(content || []);

      const [newPage] = await sql`
        INSERT INTO pages (website_id, title, slug, type, content, order_index, is_enabled, in_navigation)
        VALUES (
          ${website_id},
          ${title},
          ${slug},
          ${type},
          ${contentToInsert}::jsonb,
          ${order_index || 0},
          ${is_enabled !== undefined ? is_enabled : true},
          ${in_navigation !== undefined ? in_navigation : true}
        )
        RETURNING *
      `;
      return Response.json(newPage);
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to save page" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Page ID is required" }, { status: 400 });
  }

  try {
    const { session, errorResponse } = await requireWebsiteLiteSession(request);
    if (errorResponse) return errorResponse;

    if (!scopeAllowsWebsiteBuilder(session.scope)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const isTemplateAdmin = roleAllowsTemplateEditing(session.role);
    const isClubEditor = roleAllowsClubEditing(session.role);

    const [row] = await sql`
      SELECT w.club_id
      FROM pages p
      JOIN websites w ON w.id = p.website_id
      WHERE p.id = ${id}
    `;
    if (!row) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    const sameClub =
      session.club_id && Number(session.club_id) === Number(row.club_id);
    if (!isTemplateAdmin) {
      if (!isClubEditor || !sameClub) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await sql`DELETE FROM pages WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
