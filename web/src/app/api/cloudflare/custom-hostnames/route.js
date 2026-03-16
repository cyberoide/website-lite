import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsClubEditing,
  roleAllowsClubRead,
  roleAllowsTemplateEditing,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";

function normalizeDomainInput(value) {
  if (typeof value !== "string") return "";
  let v = value.trim();
  if (!v) return "";

  v = v.replace(/^https?:\/\//i, "");
  v = v.split("/")[0];
  v = v.toLowerCase();

  if (v.startsWith("www.")) v = v.slice(4);
  return v;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required server secret ${name}. Add it in Project Settings → Secrets.`,
    );
  }
  return value;
}

async function cloudflareRequest(path, { method, body }) {
  const token = requireEnv("CLOUDFLARE_API_TOKEN");
  const base = "https://api.cloudflare.com/client/v4";

  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    const apiMessage =
      data?.errors?.[0]?.message ||
      data?.messages?.[0] ||
      `Cloudflare API error [${res.status}] ${res.statusText}`;
    const err = new Error(apiMessage);
    err.cloudflare = data;
    throw err;
  }

  return data;
}

async function resolveZoneId() {
  // Users often paste a zone name like "clubsoft.site" instead of the Zone ID.
  // Accept either and resolve to an actual Zone ID.
  const configured = requireEnv("CLOUDFLARE_ZONE_ID");

  // Zone IDs are 32-char-ish hex strings. If it looks like a domain, treat it as a zone name.
  const looksLikeZoneName =
    configured.includes(".") || configured.includes("/");
  if (!looksLikeZoneName) {
    return configured;
  }

  const zoneName = configured.replace(/^https?:\/\//i, "").split("/")[0];
  const listed = await cloudflareRequest(
    `/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=1`,
    { method: "GET" },
  );

  const result = Array.isArray(listed?.result) ? listed.result[0] : null;
  const zoneId = result?.id;
  if (!zoneId) {
    throw new Error(
      `Could not find Cloudflare Zone ID for ${zoneName}. In Cloudflare, copy the Zone ID for that domain and set CLOUDFLARE_ZONE_ID.`,
    );
  }

  return zoneId;
}

const DEFAULT_CUSTOM_ORIGIN_SERVER = "clubsoft.site";

async function editCustomHostname(zoneId, id, { customOriginServer }) {
  // Per Cloudflare docs, PATCH is also used to refresh validation, but you must
  // include an ssl object with the same method/type as the original request.
  const data = await cloudflareRequest(
    `/zones/${zoneId}/custom_hostnames/${id}`,
    {
      method: "PATCH",
      body: {
        ssl: {
          method: "txt",
          type: "dv",
        },
        ...(customOriginServer
          ? { custom_origin_server: customOriginServer }
          : {}),
      },
    },
  );

  return data?.result;
}

function pickOwnershipVerificationRecord(customHostnameResult) {
  const ownership = customHostnameResult?.ownership_verification;
  if (ownership?.type && ownership?.name && ownership?.value) {
    return {
      type: ownership.type,
      name: ownership.name,
      value: ownership.value,
    };
  }

  // Some accounts may use HTTP verification.
  const ownershipHttp = customHostnameResult?.ownership_verification_http;
  if (ownershipHttp?.http_url && ownershipHttp?.http_body) {
    return {
      type: "HTTP",
      http_url: ownershipHttp.http_url,
      http_body: ownershipHttp.http_body,
    };
  }

  return null;
}

function extractSslValidationRecords(customHostnameResult) {
  const records = customHostnameResult?.ssl?.validation_records;
  if (!Array.isArray(records)) return [];

  const out = [];
  for (const r of records) {
    const name = r?.txt_name;
    const value = r?.txt_value;
    if (
      typeof name === "string" &&
      name.trim() &&
      typeof value === "string" &&
      value.trim()
    ) {
      out.push({ type: "TXT", name, value });
    }
  }
  return out;
}

async function createOrGetCustomHostname(zoneId, hostname) {
  const desiredOriginServer = DEFAULT_CUSTOM_ORIGIN_SERVER;

  // 1) Try create
  try {
    const created = await cloudflareRequest(
      `/zones/${zoneId}/custom_hostnames`,
      {
        method: "POST",
        body: {
          hostname,
          ssl: {
            method: "txt",
            type: "dv",
          },
          // IMPORTANT:
          // Without a custom origin, Cloudflare will often use the *custom hostname*
          // for SNI to your origin. Many origins (and hosted platforms) do not have
          // a certificate for each customer domain, which results in Cloudflare 525.
          // Setting a custom origin server causes SNI to use the custom origin.
          custom_origin_server: desiredOriginServer,
        },
      },
    );

    const result = created?.result;

    return {
      id: result?.id,
      hostname: result?.hostname,
      status: result?.status,
      ssl: result?.ssl,
      verification: pickOwnershipVerificationRecord(result),
      sslValidationRecords: extractSslValidationRecords(result),
      raw: result,
      source: "created",
      customOriginServer: result?.custom_origin_server || desiredOriginServer,
    };
  } catch (e) {
    // If it already exists, fetch it.
    const msg = e instanceof Error ? e.message.toLowerCase() : "";
    const looksLikeExists =
      msg.includes("already exists") ||
      msg.includes("hostname already") ||
      msg.includes("duplicate") ||
      msg.includes("already added");

    if (!looksLikeExists) throw e;
  }

  // 2) Fallback: list with filter
  const listed = await cloudflareRequest(
    `/zones/${zoneId}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`,
    { method: "GET" },
  );

  const result = Array.isArray(listed?.result) ? listed.result[0] : null;

  // If we found it, ensure the origin settings are present. This also triggers
  // a validation refresh which helps when DNS was added after the first attempt.
  if (result?.id) {
    const hasOrigin =
      typeof result?.custom_origin_server === "string" &&
      result.custom_origin_server.trim();

    if (!hasOrigin) {
      try {
        const patched = await editCustomHostname(zoneId, result.id, {
          customOriginServer: desiredOriginServer,
        });

        if (patched) {
          return {
            id: patched?.id,
            hostname: patched?.hostname,
            status: patched?.status,
            ssl: patched?.ssl,
            verification: pickOwnershipVerificationRecord(patched),
            sslValidationRecords: extractSslValidationRecords(patched),
            raw: patched,
            source: "patched",
            customOriginServer:
              patched?.custom_origin_server || desiredOriginServer,
          };
        }
      } catch (e) {
        console.error(
          "Cloudflare PATCH /custom_hostnames failed",
          hostname,
          e instanceof Error ? e.message : e,
        );

        return {
          id: result?.id,
          hostname: result?.hostname,
          status: result?.status,
          ssl: result?.ssl,
          verification: pickOwnershipVerificationRecord(result),
          sslValidationRecords: extractSslValidationRecords(result),
          raw: result,
          source: "fetched",
          customOriginServer: result?.custom_origin_server || null,
          patchError: e instanceof Error ? e.message : "Failed to patch",
        };
      }
    }
  }

  return {
    id: result?.id,
    hostname: result?.hostname,
    status: result?.status,
    ssl: result?.ssl,
    verification: pickOwnershipVerificationRecord(result),
    sslValidationRecords: extractSslValidationRecords(result),
    raw: result,
    source: "fetched",
    customOriginServer: result?.custom_origin_server || null,
  };
}

async function getCustomHostnameById(zoneId, id) {
  const data = await cloudflareRequest(
    `/zones/${zoneId}/custom_hostnames/${id}`,
    {
      method: "GET",
    },
  );
  const result = data?.result;
  return {
    id: result?.id,
    hostname: result?.hostname,
    status: result?.status,
    ssl: result?.ssl,
    verification: pickOwnershipVerificationRecord(result),
    sslValidationRecords: extractSslValidationRecords(result),
    raw: result,
    customOriginServer: result?.custom_origin_server || null,
  };
}

function canReadClub(session, clubId) {
  const canReadAllClubs = roleAllowsTemplateRead(session.role);
  if (canReadAllClubs) return true;

  const canRead = roleAllowsClubRead(session.role);
  const sameClub =
    session.club_id && Number(session.club_id) === Number(clubId);

  return !!canRead && !!sameClub;
}

function canWriteClub(session, clubId) {
  const isTemplateAdmin = roleAllowsTemplateEditing(session.role);
  if (isTemplateAdmin) return true;

  const isClubEditor = roleAllowsClubEditing(session.role);
  const sameClub =
    session.club_id && Number(session.club_id) === Number(clubId);

  return !!isClubEditor && !!sameClub;
}

export async function GET(request) {
  const { session, errorResponse } = await requireWebsiteLiteSession(request);
  if (errorResponse) return errorResponse;

  if (!scopeAllowsWebsiteBuilder(session.scope)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId") || session.club_id;
  const refresh = searchParams.get("refresh") === "1";

  if (!clubId) {
    return Response.json({ error: "Club ID is required" }, { status: 400 });
  }

  // Read-only users should still be able to view Cloudflare status.
  if (!canReadClub(session, clubId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [website] = await sql`
      SELECT club_id, custom_domain, custom_domain_cloudflare
      FROM websites
      WHERE club_id = ${clubId}
      LIMIT 1
    `;

    if (!website) {
      return Response.json({ error: "Website not found" }, { status: 404 });
    }

    const customDomain =
      typeof website.custom_domain === "string" ? website.custom_domain : "";

    if (!refresh || !customDomain) {
      return Response.json({
        customDomain,
        cloudflare: website.custom_domain_cloudflare || null,
      });
    }

    const zoneId = await resolveZoneId();

    const current = website.custom_domain_cloudflare;
    const hosts =
      current?.hosts && typeof current.hosts === "object" ? current.hosts : {};

    const nextHosts = { ...hosts };
    for (const host of Object.keys(nextHosts)) {
      const entry = nextHosts[host];
      const id = entry?.id;
      if (!id) continue;
      try {
        const updated = await getCustomHostnameById(zoneId, id);
        nextHosts[host] = {
          ...entry,
          ...updated,
          refreshedAt: new Date().toISOString(),
        };
      } catch (e) {
        nextHosts[host] = {
          ...entry,
          refreshError: e instanceof Error ? e.message : "Failed to refresh",
          refreshedAt: new Date().toISOString(),
        };
      }
    }

    const payload = {
      ...(current && typeof current === "object" ? current : {}),
      generatedAt: new Date().toISOString(),
      zoneId,
      hosts: nextHosts,
    };

    const [updatedWebsite] = await sql`
      UPDATE websites
      SET custom_domain_cloudflare = ${JSON.stringify(payload)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE club_id = ${clubId}
      RETURNING custom_domain_cloudflare
    `;

    return Response.json({
      customDomain,
      cloudflare: updatedWebsite?.custom_domain_cloudflare || payload,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, errorResponse } = await requireWebsiteLiteSession(request);
  if (errorResponse) return errorResponse;

  if (!scopeAllowsWebsiteBuilder(session.scope)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const clubId = body?.club_id || session.club_id;

    if (!clubId) {
      return Response.json({ error: "Club ID is required" }, { status: 400 });
    }

    // Write access required
    if (!canWriteClub(session, clubId)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Resolve which domain to provision
    const [website] = await sql`
      SELECT club_id, custom_domain
      FROM websites
      WHERE club_id = ${clubId}
      LIMIT 1
    `;

    const customDomain = normalizeDomainInput(
      typeof body?.custom_domain === "string"
        ? body.custom_domain
        : website?.custom_domain,
    );

    if (!customDomain) {
      return Response.json(
        { error: "Save a custom domain first." },
        { status: 400 },
      );
    }

    const zoneId = await resolveZoneId();

    const apexHost = customDomain;
    const wwwHost = `www.${customDomain}`;

    const [apexResult, wwwResult] = await Promise.all([
      createOrGetCustomHostname(zoneId, apexHost),
      createOrGetCustomHostname(zoneId, wwwHost),
    ]);

    const payload = {
      zoneId,
      generatedAt: new Date().toISOString(),
      hosts: {
        [apexHost]: apexResult,
        [wwwHost]: wwwResult,
      },
    };

    const [updatedWebsite] = await sql`
      UPDATE websites
      SET custom_domain = ${customDomain},
          custom_domain_cloudflare = ${JSON.stringify(payload)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE club_id = ${clubId}
      RETURNING custom_domain, custom_domain_cloudflare
    `;

    return Response.json({
      customDomain: updatedWebsite?.custom_domain,
      cloudflare: updatedWebsite?.custom_domain_cloudflare || payload,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
