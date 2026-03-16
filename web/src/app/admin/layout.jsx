"use client";

import { Toaster } from "sonner";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  LogOut,
  LayoutDashboard,
  Palette,
  Layers,
  PanelTop,
  Settings,
  Image as ImageIcon,
  Building2,
  FileText,
  UserRound,
} from "lucide-react";

import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";

const FLOOK_SRC =
  "https://cdn.flook.co/p/c593e682-5aae-43f6-b29d-080841e4ebe4.js";

// ADD: GoHighLevel / LeadConnector Support Chat widget
const GHL_CHAT_WIDGET_ID = "66aabc6bafcee9edf1e620a8";
const GHL_CHAT_SRC = "https://widgets.leadconnectorhq.com/loader.js";
const GHL_CHAT_RESOURCES_URL =
  "https://widgets.leadconnectorhq.com/chat-widget/loader.js";

function ensureFlookScriptLoaded() {
  if (typeof window === "undefined") return;
  if (typeof document === "undefined") return;

  const existing = document.getElementById("flook-player");
  if (existing) return;

  const script = document.createElement("script");
  script.id = "flook-player";
  script.defer = true;
  script.src = FLOOK_SRC;
  document.head.appendChild(script);
}

function ensureGoHighLevelChatLoaded() {
  if (typeof window === "undefined") return;
  if (typeof document === "undefined") return;

  const existing = document.getElementById("ghl-support-chat-widget");
  if (existing) return;

  const script = document.createElement("script");
  script.id = "ghl-support-chat-widget";
  script.src = GHL_CHAT_SRC;
  script.async = true;
  script.setAttribute("data-resources-url", GHL_CHAT_RESOURCES_URL);
  script.setAttribute("data-widget-id", GHL_CHAT_WIDGET_ID);

  // Put it on the body so the widget can mount its UI elements.
  document.body.appendChild(script);
}

function getPathname() {
  if (typeof window === "undefined") return "/admin";
  return window.location.pathname || "/admin";
}

function prettyRole(role) {
  if (!role) return "";
  const raw = String(role).trim();
  // If role is already a human label ("ClubSoft Owner"), keep it.
  if (/[A-Z]/.test(raw) && raw.includes(" ")) {
    return raw;
  }
  const norm = raw
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  if (norm.startsWith("clubsoft_")) {
    const rest = norm.replace(/^clubsoft_/, "");
    const words = rest
      .split("_")
      .filter(Boolean)
      .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1));
    return `ClubSoft ${words.join(" ")}`.trim();
  }

  const words = norm
    .split("_")
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1));
  return words.join(" ");
}

export default function AdminLayout({ children }) {
  const queryClient = useQueryClient();

  // NOTE: We keep the full query object so we can also access activeClub (if present)
  const sessionQuery = useWebsiteLiteSession();
  const { session, isLoading, isClubSoftAdmin, isClubSoftViewer, readOnly } =
    sessionQuery;
  const activeClub = sessionQuery.data?.activeClub || null;

  const [pathname, setPathname] = useState(getPathname());

  // Load Flook (tooltips/tours) on all Website Lite admin screens.
  useEffect(() => {
    ensureFlookScriptLoaded();
  }, []);

  // ADD: Load GoHighLevel support chat on admin screens (but not the login screen)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof document === "undefined") return;

    const isLoginPage =
      typeof pathname === "string" && pathname.startsWith("/admin/login");
    if (isLoginPage) return;

    ensureGoHighLevelChatLoaded();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => setPathname(getPathname());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const isLoginPage = useMemo(() => {
    return typeof pathname === "string" && pathname.startsWith("/admin/login");
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoginPage) return;
    if (isLoading) return;
    if (!session) {
      const callback = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      window.location.href = `/admin/login?callbackUrl=${callback}`;
    }
  }, [isLoading, isLoginPage, session]);

  // ADD: Club list + club switcher for ClubSoft-wide users (including investors)
  const { data: clubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ["clubs"],
    enabled: !!session && isClubSoftViewer,
    queryFn: async () => {
      const res = await fetch("/api/clubs");
      if (!res.ok) {
        throw new Error(
          `When fetching /api/clubs, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    staleTime: 1000 * 30,
    retry: 0,
  });

  const clubs = Array.isArray(clubsData?.clubs) ? clubsData.clubs : [];

  const switchClubMutation = useMutation({
    mutationFn: async (clubId) => {
      const res = await fetch("/api/sso/switch-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/sso/switch-club, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    onSuccess: () => {
      // refresh all club-scoped data
      queryClient.invalidateQueries({ queryKey: ["websiteLiteSession"] });
      queryClient.invalidateQueries({ queryKey: ["website"] });
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });

      if (typeof window !== "undefined") {
        window.location.href = "/admin/dashboard";
      }
    },
    onError: (e) => {
      console.error(e);
      // keep it simple: no toast dependency in layout
      if (typeof window !== "undefined") {
        window.alert("Could not switch clubs");
      }
    },
  });

  const onLogout = useCallback(async () => {
    try {
      const res = await fetch("/api/sso/logout", { method: "POST" });
      if (!res.ok) {
        throw new Error(
          `When posting /api/sso/logout, the response was [${res.status}] ${res.statusText}`,
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["websiteLiteSession"] });
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
  }, [queryClient]);

  const navItems = useMemo(() => {
    const items = [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        Icon: LayoutDashboard,
      },
      {
        href: "/admin/pages",
        label: "Pages",
        Icon: FileText,
      },
      {
        href: "/admin/themes",
        label: "Branding",
        Icon: Palette,
      },
      {
        href: "/admin/media",
        label: "Media",
        Icon: ImageIcon,
      },
      {
        href: "/admin/settings",
        label: "Settings",
        Icon: Settings,
      },
    ];

    if (isClubSoftAdmin) {
      items.push({
        href: "/admin/clubs",
        label: "Clubs",
        Icon: Building2,
      });

      items.push({
        href: "/admin/templates",
        label: "Templates",
        Icon: Layers,
      });
    }

    return items;
  }, [isClubSoftAdmin]);

  const signedInAsLabel = useMemo(() => {
    if (!session) return null;
    const name =
      (typeof session.user_name === "string" && session.user_name.trim()) ||
      null;
    const email =
      (typeof session.user_email === "string" && session.user_email.trim()) ||
      null;
    const fallback = session.user_id ? String(session.user_id) : "";

    const primary = name || email || fallback;
    const roleLabel = prettyRole(session.role);

    return {
      primary,
      secondary: roleLabel || null,
    };
  }, [session]);

  // Sync this signed-in user as a GoHighLevel contact (so chats don't look like anonymous visitors)
  const syncGhlContactMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ghl/sync-contact", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            `When posting /api/ghl/sync-contact, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return data;
    },
    retry: 0,
  });

  const ghlSyncKey = useMemo(() => {
    if (!session) return null;
    const userId = session.user_id ? String(session.user_id) : "";
    const clubId = session.club_id ? String(session.club_id) : "";
    if (!userId) return null;
    return `${userId}:${clubId}`;
  }, [session]);

  const didSyncGhlRef = useRef(null);

  useEffect(() => {
    if (!session) return;
    if (!ghlSyncKey) return;
    if (didSyncGhlRef.current === ghlSyncKey) return;

    didSyncGhlRef.current = ghlSyncKey;

    // fire-and-forget; backend will no-op if email missing
    syncGhlContactMutation.mutate();
  }, [ghlSyncKey, session, syncGhlContactMutation]);

  // Best-effort: if your HighLevel widget has the "Enable Contact Form" toggle ON,
  // auto-fill the form with the signed-in user's name/email and submit it.
  // This is what makes the conversation show a real contact (not "Visitor").
  const ghlIdentity = useMemo(() => {
    if (!session) return null;
    const name =
      typeof session.user_name === "string" ? session.user_name.trim() : "";
    const email =
      typeof session.user_email === "string" ? session.user_email.trim() : "";

    // We also add club context into the default message field if we can.
    const clubLabel =
      (activeClub?.name && String(activeClub.name).trim()) ||
      (activeClub?.slug && String(activeClub.slug).trim()) ||
      "";

    return {
      name,
      email,
      clubLabel,
      role:
        typeof session.role === "string" && session.role.trim()
          ? session.role.trim()
          : "",
    };
  }, [activeClub?.name, activeClub?.slug, session]);

  const ghlAutoIdentifyKey = useMemo(() => {
    if (!ghlIdentity) return null;
    if (!ghlSyncKey) return null;
    return `${ghlSyncKey}:${ghlIdentity.email || ""}`;
  }, [ghlIdentity, ghlSyncKey]);

  const didAutoIdentifyRef = useRef(null);

  const tryFillGhlContactForm = useCallback(() => {
    try {
      if (typeof window === "undefined") return false;
      if (!ghlIdentity) return false;
      if (!window.leadConnector?.chatWidget?.isActive?.()) return false;

      const nameValue = ghlIdentity.name;
      const emailValue = ghlIdentity.email;

      if (!nameValue && !emailValue) {
        return false;
      }

      // The widget renders DOM nodes into the page, so we can *sometimes* reach inputs directly.
      // If the widget ever switches to cross-origin iframes, this will simply no-op.
      const rootCandidates = [
        document.querySelector("#lc_chat-widget"),
        document.querySelector("[id*='lc_chat']"),
        document.querySelector("[class*='lc-chat']"),
        document.querySelector("[class*='chat-widget']"),
        document.body,
      ].filter(Boolean);

      const root = rootCandidates[0];
      if (!root) return false;

      const inputs = Array.from(root.querySelectorAll("input"));
      const buttons = Array.from(root.querySelectorAll("button"));
      const textareas = Array.from(root.querySelectorAll("textarea"));

      const pickInput = (predicate) =>
        inputs.find((i) => {
          try {
            return predicate(i);
          } catch (e) {
            return false;
          }
        });

      const nameInput = pickInput((i) => {
        const n = String(i.getAttribute("name") || "").toLowerCase();
        const p = String(i.getAttribute("placeholder") || "").toLowerCase();
        const t = String(i.getAttribute("type") || "").toLowerCase();
        return t === "text" && (n === "name" || p.includes("name"));
      });

      const emailInput = pickInput((i) => {
        const n = String(i.getAttribute("name") || "").toLowerCase();
        const p = String(i.getAttribute("placeholder") || "").toLowerCase();
        const t = String(i.getAttribute("type") || "").toLowerCase();
        return t === "email" || n === "email" || p.includes("email");
      });

      // Optional: if your widget includes a prefilled message textbox
      const messageTextarea = textareas.find((t) => {
        const p = String(t.getAttribute("placeholder") || "").toLowerCase();
        return (
          p.includes("message") || p.includes("how can") || p.includes("type")
        );
      });

      const setValue = (el, value) => {
        if (!el) return;
        if (!value) return;
        if (String(el.value || "").trim()) return;
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };

      setValue(nameInput, nameValue);
      setValue(emailInput, emailValue);

      if (messageTextarea) {
        const parts = [
          ghlIdentity.clubLabel ? `Club: ${ghlIdentity.clubLabel}` : null,
          ghlIdentity.role ? `Role: ${ghlIdentity.role}` : null,
        ].filter(Boolean);
        const defaultMsg = parts.length ? parts.join(" • ") : "";
        setValue(messageTextarea, defaultMsg);
      }

      // Find a submit button (usually the "Send" / "Start" button)
      const submitButton =
        buttons.find((b) => {
          const type = String(b.getAttribute("type") || "").toLowerCase();
          if (type === "submit") return true;
          const label = String(b.textContent || "")
            .trim()
            .toLowerCase();
          return (
            label === "send" || label === "start" || label.includes("send")
          );
        }) || null;

      const haveMinimum =
        (!!nameInput && String(nameInput.value || "").trim()) ||
        (!!emailInput && String(emailInput.value || "").trim());

      if (submitButton && haveMinimum) {
        submitButton.click();
        return true;
      }

      return false;
    } catch (e) {
      console.error("GHL auto-identify failed", e);
      return false;
    }
  }, [ghlIdentity]);

  const scheduleGhlAutofill = useCallback(() => {
    if (!ghlIdentity) return;
    if (!ghlAutoIdentifyKey) return;
    if (didAutoIdentifyRef.current === ghlAutoIdentifyKey) return;

    // Try for a short window right after the user opens the widget.
    const startedAt = Date.now();
    const maxMs = 10_000;

    const timer = window.setInterval(() => {
      const tooLate = Date.now() - startedAt > maxMs;
      if (tooLate) {
        window.clearInterval(timer);
        return;
      }

      const ok = tryFillGhlContactForm();
      if (ok) {
        didAutoIdentifyRef.current = ghlAutoIdentifyKey;
        window.clearInterval(timer);
      }
    }, 400);
  }, [ghlAutoIdentifyKey, ghlIdentity, tryFillGhlContactForm]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ghlIdentity) return;

    const onWidgetLoaded = () => {
      // When the widget loads we attach a click listener. When user opens the widget,
      // leadConnector.chatWidget.isActive() becomes true, and we attempt autofill.
      scheduleGhlAutofill();
    };

    const onAnyClick = () => {
      scheduleGhlAutofill();
    };

    window.addEventListener("LC_chatWidgetLoaded", onWidgetLoaded);
    document.addEventListener("click", onAnyClick, true);

    return () => {
      window.removeEventListener("LC_chatWidgetLoaded", onWidgetLoaded);
      document.removeEventListener("click", onAnyClick, true);
    };
  }, [ghlIdentity, scheduleGhlAutofill]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] font-inter">
        <Toaster position="top-right" />
        {children}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8F9FC] font-inter">
      <Toaster position="top-right" />

      {/*
        IMPORTANT: Make the left nav stay fixed while the main content scrolls.
        We do this by making the whole admin shell a fixed-height container
        and allowing the <main> area to handle scrolling.
      */}
      <div className="flex h-screen overflow-hidden">
        {/* Left blue nav (matches your screenshot vibe) */}
        <aside className="bg-[#0B3A67] text-white w-[76px] md:w-[240px] flex flex-col border-r border-white/10 shrink-0">
          <div className="px-4 md:px-5 py-5 border-b border-white/10">
            <a
              href="/admin/dashboard"
              className="flex items-center gap-3 min-w-0"
              onClick={() => setPathname("/admin/dashboard")}
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <PanelTop className="w-5 h-5" />
              </div>
              <div className="hidden md:block min-w-0">
                <div className="font-black leading-tight truncate">
                  ClubSoft
                </div>
                <div className="text-xs text-white/70 font-semibold truncate">
                  Website Lite
                </div>
              </div>
            </a>

            {/* ADD: Club switcher */}
            {isClubSoftViewer && session && (
              <div className="hidden md:block mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                    Editing club
                  </div>
                  {readOnly ? (
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 bg-white/10 border border-white/10 px-2 py-1 rounded-full">
                      Read-only
                    </div>
                  ) : null}
                </div>
                <select
                  value={session.club_id || ""}
                  onChange={(e) => {
                    const nextRaw = e.target.value;
                    const next = Number(nextRaw);
                    if (!nextRaw) return;
                    if (!next) return;
                    if (Number(session.club_id) === next) return;
                    switchClubMutation.mutate(next);
                  }}
                  disabled={clubsLoading || switchClubMutation.isPending}
                  className="mt-2 w-full bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl px-3 py-2 outline-none"
                >
                  {!session.club_id ? (
                    <option value="" style={{ color: "#111418" }}>
                      Select a club…
                    </option>
                  ) : null}

                  {clubs.length === 0 ? (
                    <option
                      value={session.club_id || ""}
                      style={{ color: "#111418" }}
                    >
                      {clubsLoading ? "Loading…" : "No clubs"}
                    </option>
                  ) : (
                    clubs.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        style={{ color: "#111418" }}
                      >
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
                {!session.club_id ? (
                  <div className="text-xs text-white/70 mt-2">
                    Pick a club to manage media, pages, and settings.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="p-3 md:p-4 space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive =
                typeof pathname === "string" && pathname.startsWith(item.href);

              const baseClass =
                "w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all";

              const activeClass = isActive
                ? "bg-white text-[#0B3A67] shadow-sm"
                : "text-white/90 hover:bg-white/10";

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setPathname(item.href)}
                  className={`${baseClass} ${activeClass}`}
                >
                  <item.Icon className="w-5 h-5" />
                  <span className="hidden md:inline text-sm font-semibold">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>

          {/* Signed-in badge */}
          {session && signedInAsLabel ? (
            <div className="p-3 md:p-4 border-t border-white/10">
              <div className="hidden md:flex items-start gap-3 rounded-2xl bg-white/10 border border-white/10 px-3 py-3">
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <UserRound className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Signed in as
                  </div>
                  <div className="text-sm font-extrabold leading-tight truncate">
                    {signedInAsLabel.primary}
                  </div>
                  {signedInAsLabel.secondary ? (
                    <div className="text-xs text-white/70 font-semibold truncate">
                      {signedInAsLabel.secondary}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Compact icon on small width */}
              <div className="md:hidden flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center"
                  title={`Signed in as ${signedInAsLabel.primary}${signedInAsLabel.secondary ? ` (${signedInAsLabel.secondary})` : ""}`}
                >
                  <UserRound className="w-5 h-5" />
                </div>
              </div>
            </div>
          ) : null}

          <div className="p-3 md:p-4 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-white/90 hover:bg-white/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-semibold">
                Sign out
              </span>
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          {isLoading && (
            <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-500">
              Loading…
            </div>
          )}

          {!isLoading && !session ? (
            <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-500">
              Redirecting to sign in…
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
