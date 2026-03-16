import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSettingsMutations(clubId) {
  const queryClient = useQueryClient();

  const saveDomainMutation = useMutation({
    mutationFn: async ({ clubId: cid, customDomain }) => {
      const res = await fetch("/api/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_id: cid, custom_domain: customDomain }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/website, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website", clubId] });
      queryClient.invalidateQueries({
        queryKey: ["cloudflareCustomHostnames", clubId],
      });
      toast.success("Saved domain settings");
    },
    onError: (e) => {
      console.error(e);
      const message = e instanceof Error ? e.message : "Could not save domain";
      toast.error(message);
    },
  });

  const activateDomainMutation = useMutation({
    mutationFn: async ({ normalizedDomain }) => {
      const res = await fetch("/api/cloudflare/custom-hostnames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: clubId,
          custom_domain: normalizedDomain,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/cloudflare/custom-hostnames, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cloudflareCustomHostnames", clubId],
      });
      toast.success("Domain activated in Cloudflare");
    },
    onError: (e) => {
      console.error(e);
      const message =
        e instanceof Error ? e.message : "Could not activate domain";
      toast.error(message);
    },
  });

  const refreshStatusMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/cloudflare/custom-hostnames?clubId=${clubId}&refresh=1`,
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cloudflareCustomHostnames", clubId],
      });
      toast.success("Refreshed Cloudflare status");
    },
    onError: (e) => {
      console.error(e);
      const message =
        e instanceof Error ? e.message : "Could not refresh status";
      toast.error(message);
    },
  });

  const dnsVerifyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/dns/verify?clubId=${clubId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When fetching /api/dns/verify, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onError: (e) => {
      console.error(e);
      const message = e instanceof Error ? e.message : "Could not verify DNS";
      toast.error(message);
    },
  });

  return {
    saveDomainMutation,
    activateDomainMutation,
    refreshStatusMutation,
    dnsVerifyMutation,
  };
}
