import { useQuery } from "@tanstack/react-query";

export function usePublicSite(slug, preview) {
  return useQuery({
    queryKey: ["public-site", slug, preview],
    enabled: typeof slug === "string" && !!slug.trim(),
    queryFn: async () => {
      const safeSlug = String(slug || "");
      const url = preview
        ? `/api/public/${safeSlug}?preview=1`
        : `/api/public/${safeSlug}`;
      const res = await fetch(url);
      if (!res.ok) {
        const maybeJson = await res
          .json()
          .catch(() => ({ error: "Site not found" }));
        const message = maybeJson?.error || "Site not found";
        throw new Error(message);
      }
      return res.json();
    },
  });
}
