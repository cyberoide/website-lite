import { useQuery } from "@tanstack/react-query";

export function useThemeData(clubId, sessionLoading) {
  const {
    data: website,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["website", clubId],
    enabled: !!clubId && !sessionLoading,
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

  return { website, isLoading, error };
}
