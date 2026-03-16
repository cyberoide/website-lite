import { useQuery } from "@tanstack/react-query";

export function useDashboardData(clubId, initialWebsiteId) {
  const {
    data: website,
    isLoading: websiteLoading,
    error: websiteError,
  } = useQuery({
    queryKey: ["website", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const res = await fetch(`/api/website?clubId=${clubId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error ||
            `When fetching /api/website, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    retry: 0,
  });

  const websiteId = website?.id || initialWebsiteId;

  const {
    data: pages,
    isLoading: pagesLoading,
    error: pagesError,
  } = useQuery({
    queryKey: ["pages", websiteId],
    enabled: !!websiteId,
    queryFn: async () => {
      const res = await fetch(`/api/pages?websiteId=${websiteId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error ||
            `When fetching /api/pages, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    retry: 0,
  });

  return {
    website,
    websiteLoading,
    websiteError,
    pages,
    pagesLoading,
    pagesError,
  };
}
