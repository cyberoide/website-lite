import { useQuery } from "@tanstack/react-query";

export function useSettingsData(clubId) {
  const {
    data: website,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["website", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const res = await fetch(`/api/website?clubId=${clubId}`);
      if (!res.ok) {
        throw new Error(
          `When fetching /api/website, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
  });

  const {
    data: cloudflareData,
    isLoading: isCloudflareLoading,
    error: cloudflareError,
  } = useQuery({
    queryKey: ["cloudflareCustomHostnames", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const res = await fetch(
        `/api/cloudflare/custom-hostnames?clubId=${clubId}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When fetching /api/cloudflare/custom-hostnames, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
  });

  return {
    website,
    isLoading,
    error,
    cloudflareData,
    isCloudflareLoading,
    cloudflareError,
  };
}
