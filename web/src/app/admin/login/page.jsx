"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminLoginPage() {
  const queryClient = useQueryClient();
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoTokenDetected, setAutoTokenDetected] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "/admin/dashboard";
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("callbackUrl") || "/admin/dashboard";
  }, []);

  const isLikelyProd = useMemo(() => {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname;
    return !(
      host.includes("localhost") ||
      host.includes("createdevserver.com") ||
      host.endsWith(".local")
    );
  }, []);

  const clubsoftAppHref = useMemo(() => {
    // Keep it simple: send users to ClubSoft. They’re usually already logged in there.
    return "https://app.clubsoft.co/";
  }, []);

  const completeLogin = useCallback(
    async (token) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/sso/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = data?.error || "Could not verify token";
          throw new Error(message);
        }

        queryClient.invalidateQueries({ queryKey: ["websiteLiteSession"] });
        toast.success("Signed in");

        if (typeof window !== "undefined") {
          window.location.href = callbackUrl;
        }
      } catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : "Could not sign in";
        setError(message);
        toast.error("Could not sign in");
      } finally {
        setLoading(false);
      }
    },
    [callbackUrl, queryClient],
  );

  const onDevLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sso/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Dev login not allowed");
      }
      queryClient.invalidateQueries({ queryKey: ["websiteLiteSession"] });
      toast.success("Dev session created");
      if (typeof window !== "undefined") {
        window.location.href = callbackUrl;
      }
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Dev login failed";
      setError(message);
      toast.error("Dev login failed");
    } finally {
      setLoading(false);
    }
  }, [callbackUrl, queryClient]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");

    if (token) {
      // Do NOT show the JWT in the UI or keep it in the URL.
      setAutoTokenDetected(true);
      // Strip token from the address bar ASAP so it isn't visible / copied / sent as a referrer.
      searchParams.delete("token");
      const nextQs = searchParams.toString();
      const nextUrl = nextQs ? `/admin/login?${nextQs}` : "/admin/login";
      try {
        window.history.replaceState({}, "", nextUrl);
      } catch {
        // ignore
      }

      completeLogin(token);
    }
  }, [completeLogin]);

  const showTokenUi = !autoTokenDetected;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-12 rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-[#0066FF]" />
        </div>
        <h1 className="text-2xl font-black text-[#111418] mb-4">
          ClubSoft SSO
        </h1>
        <p className="text-gray-500 mb-6">
          {autoTokenDetected
            ? "Signing you in from ClubSoft…"
            : "Open Website Builder from ClubSoft to sign in."}
        </p>

        <div className="space-y-3 text-left">
          {showTokenUi ? (
            <>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                <div className="font-semibold text-[#111418]">
                  Sign in through ClubSoft
                </div>
                <div className="mt-1 text-gray-600">
                  For security, the sign-in token is handled automatically when
                  you come from the ClubSoft app.
                </div>
              </div>

              {/* Production path: send users to ClubSoft app */}
              {isLikelyProd ? (
                <a
                  href={clubsoftAppHref}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] text-white rounded-2xl font-semibold hover:bg-[#0052CC] transition-all"
                >
                  Open ClubSoft
                </a>
              ) : null}

              {/* Dev / troubleshooting tools should not be shown on production */}
              {!isLikelyProd ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="text-xs font-bold text-gray-500 hover:text-black"
                  >
                    {showAdvanced ? "Hide" : "Show"} troubleshooting options
                  </button>

                  {showAdvanced ? (
                    <>
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        SSO JWT (advanced)
                      </label>
                      <textarea
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
                        rows={5}
                        className="w-full rounded-2xl border border-gray-200 p-3 text-sm font-mono outline-none focus:border-blue-300"
                      />

                      <button
                        onClick={() => {
                          const t = tokenInput.trim();
                          if (!t) {
                            setError("Please paste a token");
                            return;
                          }
                          completeLogin(t);
                        }}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] text-white rounded-2xl font-semibold hover:bg-[#0052CC] transition-all disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <KeyRound className="w-5 h-5" />
                        )}
                        Sign in
                      </button>

                      <div className="pt-2">
                        <button
                          onClick={onDevLogin}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-800 rounded-2xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-60"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          Dev login (non-production)
                        </button>
                        <div className="text-xs text-gray-400 mt-2 flex items-start gap-2">
                          <KeyRound className="w-4 h-4 mt-[2px]" />
                          <div>
                            In production, ClubSoft should redirect here with
                            <span className="font-mono">?token=</span>.
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3 text-sm text-gray-700">
              <Loader2 className="w-5 h-5 animate-spin text-[#0066FF]" />
              <div>
                <div className="font-semibold text-[#111418]">
                  Signing you in…
                </div>
                <div className="text-gray-600">
                  This should only take a second.
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {isLikelyProd ? (
            <div className="text-xs text-gray-400 pt-2">
              Tip: If you bookmarked this page, the normal way to sign in is to
              open <span className="font-semibold">Website Builder</span> from
              inside ClubSoft.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
