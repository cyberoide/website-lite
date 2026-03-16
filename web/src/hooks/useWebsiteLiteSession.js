import { useQuery } from "@tanstack/react-query";

function normalizeRole(role) {
  if (!role) return "";
  const raw = String(role).trim().toLowerCase();
  return raw
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function scopeToString(scopeRaw) {
  if (!scopeRaw) return "";
  if (typeof scopeRaw === "string") return scopeRaw;
  if (Array.isArray(scopeRaw)) return scopeRaw.map(String).join(" ");
  return "";
}

function isReadOnlyRole(roleNorm) {
  return (
    roleNorm === "clubsoft_investor" ||
    roleNorm === "clubsoft_viewer" ||
    roleNorm === "investor" ||
    roleNorm === "view_only" ||
    roleNorm === "readonly" ||
    roleNorm === "read_only"
  );
}

export default function useWebsiteLiteSession() {
  const query = useQuery({
    queryKey: ["websiteLiteSession"],
    queryFn: async () => {
      const res = await fetch("/api/sso/me");
      if (!res.ok) {
        throw new Error(
          `When fetching /api/sso/me, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    staleTime: 1000 * 30,
    retry: 0,
  });

  const session = query.data?.session || null;
  const role = session?.role ? String(session.role) : "";
  const roleNorm = normalizeRole(role);

  const readOnly = isReadOnlyRole(roleNorm);

  const scopeString = scopeToString(session?.scope)
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const hasWebsiteBuilderScope = scopeString
    .split(" ")
    .filter(Boolean)
    .includes("website_builder");

  // ClubSoft-wide roles include investors/viewers.
  const isClubSoftViewer =
    roleNorm === "super_admin" || roleNorm.startsWith("clubsoft_");

  // "Admin" in Website Lite means they can edit across clubs and manage platform tools.
  // Investors/viewers should not be treated as admins.
  const isClubSoftAdmin =
    roleNorm === "super_admin" ||
    (roleNorm.startsWith("clubsoft_") && !readOnly);

  // Can view this club's site editor
  const isClubViewer =
    hasWebsiteBuilderScope &&
    (isClubSoftViewer ||
      ["club_admin", "club_owner", "admin"].includes(roleNorm) ||
      !roleNorm);

  // Can edit (write) within this club's editor
  const isClubEditor =
    !readOnly &&
    (hasWebsiteBuilderScope ||
      isClubSoftAdmin ||
      ["club_admin", "club_owner", "admin"].includes(roleNorm) ||
      !roleNorm);

  return {
    ...query,
    session,
    hasWebsiteBuilderScope,
    isClubSoftViewer,
    isClubSoftAdmin,
    isClubViewer,
    isClubEditor,
    readOnly,
  };
}
