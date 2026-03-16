import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

const BUILT_IN_STYLE_ORDER = ["rivr", "coastal", "journey", "classic"];

export function useTemplates() {
  const { data: templatesData } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch("/api/templates");
      if (!res.ok) {
        throw new Error(
          `When fetching /api/templates, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
  });

  const templateCards = useMemo(() => {
    const items = Array.isArray(templatesData?.templates)
      ? templatesData.templates
      : [];

    // For now, the UI only exposes the 4 standard site styles.
    const map = new Map(
      items.filter((t) => t?.is_enabled !== false).map((t) => [t.key, t]),
    );

    return BUILT_IN_STYLE_ORDER.map((key) => map.get(key))
      .filter(Boolean)
      .map((t) => ({
        key: t.key,
        title: t.name,
        description: t.description || "",
        source: t.source || "built-in",
      }));
  }, [templatesData?.templates]);

  return { templateCards };
}
