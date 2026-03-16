import sql from "@/app/api/utils/sql";
import {
  requireWebsiteLiteSession,
  roleAllowsClubRead,
  roleAllowsTemplateRead,
  scopeAllowsWebsiteBuilder,
} from "@/app/api/utils/websiteLiteAuth";

function normalizeDomain(value) {
  if (typeof value !== "string") return "";
  let v = value.trim();
  if (!v) return "";
  v = v.replace(/^https?:\/\//i, "");
  v = v.split("/")[0];
  v = v.toLowerCase();
  if (v.startsWith("www.")) v = v.slice(4);
  return v;
}

function canReadClub(session, clubId) {
  const canReadAllClubs = roleAllowsTemplateRead(session.role);
  if (canReadAllClubs) return true;

  const canRead = roleAllowsClubRead(session.role);
  const sameClub =
    session.club_id && Number(session.club_id) === Number(clubId);

  return !!canRead && !!sameClub;
}

async function doh(name, type) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
    name,
  )}&type=${encodeURIComponent(type)}`;

  const res = await fetch(url, {
    headers: {
      accept: "application/dns-json",
    },
  });

  const data = await res.json().catch(() => ({}));
  return data;
}

function extractAnswers(dnsJson) {
  const answers = Array.isArray(dnsJson?.Answer) ? dnsJson.Answer : [];
  return answers.map((a) => ({
    name: a?.name,
    type: a?.type,
    ttl: a?.TTL,
    data: a?.data,
  }));
}

function looksLikeCloudflareProxyA(aRecords) {
  // This is heuristic. If someone is using Cloudflare DNS and orange-cloud proxy,
  // they often get A records that are Cloudflare edge IPs.
  // We just use it to provide a helpful hint.
  const values = Array.isArray(aRecords) ? aRecords : [];
  return values.some(
    (ip) =>
      typeof ip === "string" &&
      (ip.startsWith("104.21.") || ip.startsWith("172.67.")),
  );
}

async function safeFetchText(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": "ClubSoftDnsVerifier/1.0",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    const cfRay = res.headers.get("cf-ray");
    const vercelError = res.headers.get("x-vercel-error");

    // Read a tiny snippet for debugging (Cloudflare errors often include the code)
    let snippet = "";
    try {
      const text = await res.text();
      snippet = String(text || "").slice(0, 220);
    } catch {
      snippet = "";
    }

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      cfRay: cfRay || null,
      vercelError: vercelError || null,
      snippet,
    };
  } catch (e) {
    return {
      ok: false,
      status: null,
      statusText: null,
      cfRay: null,
      vercelError: null,
      snippet: e instanceof Error ? e.message : "Request failed",
    };
  }
}

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

  // Read-only users should still be able to verify DNS.
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

    const customDomain = normalizeDomain(website?.custom_domain || "");
    if (!customDomain) {
      return Response.json(
        { error: "No custom domain saved for this club." },
        { status: 400 },
      );
    }

    const expectedTarget = "clubsoft.site";

    const apex = customDomain;
    const www = `www.${customDomain}`;

    const [apexCname, wwwCname, apexA, wwwA] = await Promise.all([
      doh(apex, "CNAME"),
      doh(www, "CNAME"),
      doh(apex, "A"),
      doh(www, "A"),
    ]);

    const apexCnameAnswers = extractAnswers(apexCname)
      .map((a) => a.data)
      .filter(Boolean);
    const wwwCnameAnswers = extractAnswers(wwwCname)
      .map((a) => a.data)
      .filter(Boolean);
    const apexAAnswers = extractAnswers(apexA)
      .map((a) => a.data)
      .filter(Boolean);
    const wwwAAnswers = extractAnswers(wwwA)
      .map((a) => a.data)
      .filter(Boolean);

    const notes = [];

    const hasWwwCname = wwwCnameAnswers.length > 0;
    const hasApexCname = apexCnameAnswers.length > 0;

    const wwwPointsToExpected = wwwCnameAnswers.some((v) =>
      String(v).toLowerCase().includes(expectedTarget),
    );

    // If no CNAME but we see Cloudflare edge A records, this could mean either:
    // - The customer is using Cloudflare and has orange-cloud proxy enabled (bad for SaaS)
    // - The DNS provider is flattening the CNAME (often OK)
    const likelyWwwCloudflareEdge =
      !hasWwwCname && looksLikeCloudflareProxyA(wwwAAnswers);
    const likelyApexCloudflareEdge =
      !hasApexCname && looksLikeCloudflareProxyA(apexAAnswers);

    if (likelyWwwCloudflareEdge || likelyApexCloudflareEdge) {
      notes.push(
        "This domain resolves to Cloudflare edge IPs. That can be normal (CNAME flattening), but if the domain is on Cloudflare and the record is Proxied (orange cloud), Cloudflare SSL for SaaS may fail. Use DNS-only (grey cloud) for the CNAME record.",
      );
    }

    if (hasWwwCname && !wwwPointsToExpected) {
      notes.push(
        `www is a CNAME but it does not point to ${expectedTarget}. Update it to CNAME → ${expectedTarget}.`,
      );
    }

    // Check TXT verification records (if we have them stored from Cloudflare)
    const hosts =
      website?.custom_domain_cloudflare?.hosts &&
      typeof website.custom_domain_cloudflare.hosts === "object"
        ? website.custom_domain_cloudflare.hosts
        : {};

    const txtChecks = [];
    for (const host of Object.keys(hosts)) {
      const entry = hosts?.[host];

      // 1) Ownership verification
      const v = entry?.verification;
      if (v && (v.type === "txt" || v.type === "TXT") && v.name && v.value) {
        const txtName = String(v.name).replace(/\.$/, "");
        const txtRes = await doh(txtName, "TXT");
        const txtAnswers = extractAnswers(txtRes)
          .map((a) => a.data)
          .filter(Boolean);

        const ok = txtAnswers.some((ans) =>
          String(ans).includes(String(v.value)),
        );
        txtChecks.push({
          kind: "ownership",
          hostname: host,
          name: txtName,
          expectedValue: v.value,
          observed: txtAnswers,
          ok,
        });
      }

      // 2) Certificate (ACME) validation TXT records
      const sslRecords = entry?.sslValidationRecords;
      if (Array.isArray(sslRecords)) {
        for (const r of sslRecords) {
          if (!r?.name || !r?.value) continue;
          const txtName = String(r.name).replace(/\.$/, "");
          const txtRes = await doh(txtName, "TXT");
          const txtAnswers = extractAnswers(txtRes)
            .map((a) => a.data)
            .filter(Boolean);

          const ok = txtAnswers.some((ans) =>
            String(ans).includes(String(r.value)),
          );

          txtChecks.push({
            kind: "certificate",
            hostname: host,
            name: txtName,
            expectedValue: r.value,
            observed: txtAnswers,
            ok,
          });
        }
      }
    }

    // Live HTTPS check
    const http = {
      apex: await safeFetchText(`https://${apex}`),
      www: await safeFetchText(`https://${www}`),
    };

    const has525 = http.apex?.status === 525 || http.www?.status === 525;
    if (has525) {
      notes.push(
        "Cloudflare is returning 525 (SSL handshake failed). This usually means Cloudflare cannot complete TLS to the origin. In Cloudflare for SaaS setups, this is commonly caused by missing/incorrect fallback origin configuration or origin TLS limitations.",
      );
    }

    const hasVercelDeploymentNotFound =
      http.apex?.vercelError === "DEPLOYMENT_NOT_FOUND" ||
      http.www?.vercelError === "DEPLOYMENT_NOT_FOUND";

    if (hasVercelDeploymentNotFound) {
      notes.push(
        "Vercel is returning DEPLOYMENT_NOT_FOUND. This means the request reached Vercel, but the origin does not recognize this custom domain. In Cloudflare SSL for SaaS setups, the most reliable fix is to run a Cloudflare Worker on your clubsoft.site zone with a wildcard route (*/*) (not just *.clubsoft.site/*) and proxy the request to www.clubsoft.site. This ensures Vercel always sees a valid hostname while the browser keeps the custom domain.",
      );
    }

    return Response.json({
      domain: customDomain,
      expected: {
        target: expectedTarget,
      },
      records: {
        apex: {
          cname: apexCnameAnswers,
          a: apexAAnswers,
        },
        www: {
          cname: wwwCnameAnswers,
          a: wwwAAnswers,
        },
      },
      checks: {
        wwwCnamePointsToTarget: hasWwwCname ? wwwPointsToExpected : null,
        likelyProxied: likelyWwwCloudflareEdge || likelyApexCloudflareEdge,
        txt: txtChecks,
        http,
      },
      notes,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
