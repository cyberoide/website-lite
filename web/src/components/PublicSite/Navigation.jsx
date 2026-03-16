import React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Phone,
  Twitter,
  X as XIcon,
  Youtube,
} from "lucide-react";

function getSocialIcon(key) {
  switch (key) {
    case "facebook":
      return Facebook;
    case "instagram":
      return Instagram;
    case "linkedin":
      return Linkedin;
    case "youtube":
      return Youtube;
    case "x":
      return XIcon;
    default:
      return Twitter;
  }
}

function normalizeExternalUrl(href) {
  if (typeof href !== "string") return "";
  const trimmed = href.trim();
  if (!trimmed) return "";

  // If the admin pastes "facebook.com/club" (no scheme), make it clickable.
  const isAlreadyOk = /^(https?:\/\/|mailto:|tel:|#)/i.test(trimmed);
  if (isAlreadyOk) return trimmed;
  return `https://${trimmed}`;
}

function normalizeSocialLinks(socialLinks) {
  let obj = socialLinks;

  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch (e) {
      obj = null;
    }
  }

  if (!obj || typeof obj !== "object") return [];

  const items = [
    {
      key: "facebook",
      label: "Facebook",
      href: normalizeExternalUrl(obj.facebook),
    },
    {
      key: "instagram",
      label: "Instagram",
      href: normalizeExternalUrl(obj.instagram),
    },
    { key: "x", label: "X", href: normalizeExternalUrl(obj.x) },
    {
      key: "youtube",
      label: "YouTube",
      href: normalizeExternalUrl(obj.youtube),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: normalizeExternalUrl(obj.linkedin),
    },
  ];

  return items.filter((i) => typeof i.href === "string" && i.href.trim());
}

function formatAddressOneLine(address) {
  if (typeof address !== "string") return "";
  const trimmed = address.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\s*\n\s*/g, ", ");
}

function getTemplateKey(website) {
  const key = website?.selected_template_key;
  if (typeof key === "string" && key.trim()) return key;
  return "coastal";
}

function findPageSlug(visiblePages, candidates) {
  if (!Array.isArray(visiblePages) || visiblePages.length === 0) return "";
  const normalized = visiblePages.filter(Boolean).map((p) => ({
    slug: typeof p.slug === "string" ? p.slug : "",
    title: typeof p.title === "string" ? p.title.toLowerCase() : "",
    // Only treat as enabled when the value is literally boolean true.
    is_enabled: p?.is_enabled === true,
  }));

  for (const c of candidates) {
    const slugMatch = normalized.find((p) => p.slug === c && p.is_enabled);
    if (slugMatch) return slugMatch.slug;
  }

  // fallback: match by title keywords
  for (const c of candidates) {
    const titleMatch = normalized.find(
      (p) => p.title.includes(c.replace(/-/g, " ")) && p.is_enabled,
    );
    if (titleMatch) return titleMatch.slug;
  }

  return "";
}

function findPageSlugByEmbedType(visiblePages, embedType) {
  if (!Array.isArray(visiblePages) || visiblePages.length === 0) return "";
  const type = typeof embedType === "string" ? embedType : "";
  if (!type) return "";

  for (const p of visiblePages) {
    if (!p || p?.is_enabled !== true) continue;
    const slug = typeof p.slug === "string" ? p.slug : "";
    if (!slug) continue;

    const blocks = Array.isArray(p.content) ? p.content : [];
    const hasMatch = blocks.some(
      (b) => b?.type === "embed" && b?.data?.embedType === type,
    );

    if (hasMatch) {
      return slug;
    }
  }

  return "";
}

// NEW: prefer dedicated pages over Home when multiple pages contain the same embed.
function findPageSlugByEmbedTypePreferNonHome(visiblePages, embedType) {
  const list = Array.isArray(visiblePages) ? visiblePages : [];
  if (list.length === 0) return "";

  const withoutHome = list.filter((p) => p?.slug !== "home");
  return (
    findPageSlugByEmbedType(withoutHome, embedType) ||
    findPageSlugByEmbedType(list, embedType)
  );
}

function safeHexOrEmpty(v) {
  if (typeof v !== "string") return "";
  const trimmed = v.trim();
  if (!trimmed) return "";
  return trimmed;
}

export function Navigation({
  club,
  website,
  logoUrl,
  primaryColor,
  isSinglePageMode,
  onePageNavItems,
  visiblePages,
  apiPreview,
  resolvedPageSlug,
  onAnchorClick,
  onPageChange,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const hasLogo = !!logoUrl;
  const templateKey = getTemplateKey(website);

  const enabledPages = React.useMemo(() => {
    const list = Array.isArray(visiblePages) ? visiblePages : [];
    // Hidden should mean hidden everywhere.
    return list.filter((p) => p?.is_enabled === true);
  }, [visiblePages]);

  const navigationPages = React.useMemo(() => {
    // Treat null/undefined as true so older rows behave like before.
    return enabledPages.filter((p) => p?.in_navigation !== false);
  }, [enabledPages]);

  const homeSlug = React.useMemo(() => {
    const homePage =
      navigationPages.find((p) => p?.slug === "home") ||
      enabledPages.find((p) => p?.slug === "home");
    if (homePage?.slug) return homePage.slug;

    const firstNav = navigationPages[0];
    if (firstNav?.slug) return firstNav.slug;

    const firstEnabled = enabledPages[0];
    return firstEnabled?.slug || "home";
  }, [navigationPages, enabledPages]);

  const singleModeItems = React.useMemo(() => {
    if (!isSinglePageMode) return [];

    const anchors = (Array.isArray(onePageNavItems) ? onePageNavItems : [])
      .map((item) => {
        if (!item?.label || !item?.anchor) return null;
        return {
          key: `anchor-${item.anchor}`,
          label: item.label,
          kind: "anchor",
          anchor: item.anchor,
        };
      })
      .filter(Boolean);

    const extraPages = navigationPages
      .filter((p) => p?.slug && p.slug !== homeSlug)
      .map((p) => ({
        key: `page-${p.id}`,
        label: p.title,
        kind: "page",
        slug: p.slug,
      }));

    return [
      { key: "__home", label: "Home", kind: "home" },
      ...anchors,
      ...extraPages,
    ];
  }, [isSinglePageMode, onePageNavItems, navigationPages, homeSlug]);

  const socialItems = normalizeSocialLinks(website?.social_links);
  const phone =
    typeof website?.contact_phone === "string" ? website.contact_phone : "";
  const email =
    typeof website?.contact_email === "string" ? website.contact_email : "";

  const addressRaw =
    typeof website?.contact_address === "string" ? website.contact_address : "";
  const addressOneLine = formatAddressOneLine(addressRaw);
  const showAddressInTopBar =
    website?.social_show_address === true && !!addressOneLine;

  const showTopBar =
    !!phone || !!email || socialItems.length > 0 || showAddressInTopBar;

  const socialBarPosition =
    website?.social_bar_position === "below" ? "below" : "above";
  const socialDisplayStyle =
    website?.social_display_style === "icons" ? "icons" : "names";

  const headingTextColor =
    typeof website?.heading_text_color === "string" &&
    website.heading_text_color.trim()
      ? website.heading_text_color
      : "#111418";

  const navColorMode = website?.nav_color_mode === "custom" ? "custom" : "auto";
  const navLinkColorRaw = safeHexOrEmpty(website?.nav_link_color);
  const navActiveColorRaw = safeHexOrEmpty(website?.nav_active_color);

  const variant =
    templateKey === "classic"
      ? "dark"
      : templateKey === "rivr"
        ? "solid"
        : "light";

  const isLightVariant = variant === "light";

  const computedNavLinkColor = React.useMemo(() => {
    if (navColorMode === "custom" && navLinkColorRaw) {
      return navLinkColorRaw;
    }
    if (isLightVariant) {
      return headingTextColor;
    }
    return "rgba(255,255,255,0.88)";
  }, [navColorMode, navLinkColorRaw, isLightVariant, headingTextColor]);

  const computedNavActiveColor = React.useMemo(() => {
    if (navColorMode === "custom" && navActiveColorRaw) {
      return navActiveColorRaw;
    }
    if (isLightVariant) {
      return primaryColor;
    }

    // On dark headers, use secondary for Classic to make it feel different.
    if (templateKey === "classic") {
      return "var(--secondary)";
    }

    return "white";
  }, [
    navColorMode,
    navActiveColorRaw,
    isLightVariant,
    primaryColor,
    templateKey,
  ]);

  // Header CTA buttons (Join Us / Member Login / both)
  const headerCtaEnabled = website?.header_cta_enabled === true;
  const headerCtaModeRaw =
    typeof website?.header_cta_action === "string"
      ? website.header_cta_action
      : "join";
  const headerCtaMode =
    headerCtaModeRaw === "both"
      ? "both"
      : headerCtaModeRaw === "login"
        ? "login"
        : "join";

  const ctaButtonBaseClass =
    "hidden md:inline-flex items-center justify-center px-5 py-2 rounded-full font-extrabold text-sm shadow-sm border transition-all";

  const ctaButtonStyle =
    templateKey === "classic" || templateKey === "rivr"
      ? { backgroundColor: "rgba(255,255,255,0.95)", color: primaryColor }
      : {
          backgroundColor: primaryColor,
          color: "white",
          borderColor: "transparent",
        };

  const ctaButtonHoverClass =
    templateKey === "classic" || templateKey === "rivr"
      ? "hover:bg-[color:var(--secondary)] hover:text-white"
      : "hover:bg-[color:var(--secondary)]";

  const hasAnchor = React.useCallback(
    (anchor) => {
      const list = Array.isArray(onePageNavItems) ? onePageNavItems : [];
      return list.some((item) => item?.anchor === anchor);
    },
    [onePageNavItems],
  );

  const loginPageSlug = React.useMemo(() => {
    // Prefer a dedicated page that actually contains the ClubSoft login embed.
    const embedMatch = findPageSlugByEmbedTypePreferNonHome(
      enabledPages,
      "login",
    );
    if (embedMatch) return embedMatch;
    return findPageSlug(enabledPages, ["login", "member-login"]) || "";
  }, [enabledPages]);

  const joinPageSlug = React.useMemo(() => {
    // Prefer a dedicated page that actually contains the ClubSoft membership application embed.
    // IMPORTANT: some templates include the embed on Home (single-page style), but for multi-page
    // sites we want the CTA to go to the dedicated Membership page when it exists.
    const embedMatch = findPageSlugByEmbedTypePreferNonHome(
      enabledPages,
      "membership",
    );
    if (embedMatch) return embedMatch;
    return findPageSlug(enabledPages, ["membership", "join", "apply"]) || "";
  }, [enabledPages]);

  const signinFallbackUrl = React.useMemo(() => {
    const clubSlug = typeof club?.slug === "string" ? club.slug.trim() : "";
    if (clubSlug) {
      return `https://app.clubsoft.co/account/signin?club=${encodeURIComponent(clubSlug)}`;
    }
    return "https://app.clubsoft.co/account/signin";
  }, [club?.slug]);

  const membershipFallbackUrl = React.useMemo(() => {
    const clubSlug = typeof club?.slug === "string" ? club.slug.trim() : "";
    if (clubSlug) {
      return `https://app.clubsoft.co/contact-form/membership-application?club=${encodeURIComponent(clubSlug)}`;
    }
    return "https://app.clubsoft.co/contact-form/membership-application";
  }, [club?.slug]);

  const canShowJoinCta = React.useMemo(() => {
    if (!headerCtaEnabled) return false;
    if (!(headerCtaMode === "join" || headerCtaMode === "both")) return false;

    // If there's a dedicated page (even if it's not in Navigation), always allow.
    if (joinPageSlug) return true;

    // In one-page mode, allow the CTA if the target anchor exists on the page.
    if (isSinglePageMode) {
      return hasAnchor("apply") || hasAnchor("membership");
    }

    return false;
  }, [
    headerCtaEnabled,
    headerCtaMode,
    isSinglePageMode,
    hasAnchor,
    joinPageSlug,
  ]);

  const canShowLoginCta = React.useMemo(() => {
    if (!headerCtaEnabled) return false;
    if (!(headerCtaMode === "login" || headerCtaMode === "both")) return false;

    if (loginPageSlug) return true;

    if (isSinglePageMode) {
      return hasAnchor("login");
    }

    // If there's no page/anchor, we can still fall back to ClubSoft sign-in.
    return true;
  }, [
    headerCtaEnabled,
    headerCtaMode,
    isSinglePageMode,
    hasAnchor,
    loginPageSlug,
  ]);

  const joinCtaHref = React.useMemo(() => {
    if (joinPageSlug) {
      const page = encodeURIComponent(joinPageSlug);
      return apiPreview ? `?preview=1&page=${page}` : `?page=${page}`;
    }

    if (isSinglePageMode) {
      // Keep the old “one-page” behavior as a fallback.
      return "#apply";
    }

    return membershipFallbackUrl;
  }, [joinPageSlug, apiPreview, isSinglePageMode, membershipFallbackUrl]);

  const loginCtaHref = React.useMemo(() => {
    if (loginPageSlug) {
      const page = encodeURIComponent(loginPageSlug);
      return apiPreview ? `?preview=1&page=${page}` : `?page=${page}`;
    }

    if (isSinglePageMode) {
      return "#login";
    }

    return signinFallbackUrl;
  }, [loginPageSlug, apiPreview, isSinglePageMode, signinFallbackUrl]);

  // NOTE: CTA buttons use real hrefs so they work even if JS navigation fails.
  // (We keep regular top-nav links as SPA-style buttons for smooth switching.)

  const desktopCtaButtonsNode = headerCtaEnabled ? (
    <div className="hidden md:flex items-center gap-2">
      {canShowJoinCta && (
        <a
          href={joinCtaHref}
          onClick={() => setMobileMenuOpen(false)}
          className={`${ctaButtonBaseClass} ${ctaButtonHoverClass}`}
          style={ctaButtonStyle}
        >
          Join Us
        </a>
      )}
      {canShowLoginCta && (
        <a
          href={loginCtaHref}
          onClick={() => setMobileMenuOpen(false)}
          className={`${ctaButtonBaseClass} ${ctaButtonHoverClass}`}
          style={ctaButtonStyle}
        >
          Member Login
        </a>
      )}
    </div>
  ) : null;

  // Mobile header is tight; show a single quick CTA (full CTA options stay in the menu).
  const mobileCtaAction = canShowLoginCta ? "login" : "join";
  const mobileCtaLabel = mobileCtaAction === "login" ? "Login" : "Join";
  const mobileCtaHref =
    mobileCtaAction === "login" ? loginCtaHref : joinCtaHref;
  const mobileCtaClassName =
    "md:hidden inline-flex items-center justify-center px-4 py-2 rounded-full font-extrabold text-sm shadow-sm border";

  const mobileCtaNode =
    headerCtaEnabled && (canShowJoinCta || canShowLoginCta) ? (
      <a
        href={mobileCtaHref}
        onClick={() => setMobileMenuOpen(false)}
        className={`${mobileCtaClassName} ${ctaButtonHoverClass}`}
        style={ctaButtonStyle}
      >
        {mobileCtaLabel}
      </a>
    ) : null;

  const onBrandClick = React.useCallback(() => {
    setMobileMenuOpen(false);

    if (isSinglePageMode) {
      onAnchorClick("__top");
      return;
    }

    if (homeSlug) {
      onPageChange(homeSlug);
      return;
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [homeSlug, isSinglePageMode, onAnchorClick, onPageChange]);

  const topBar = showTopBar ? (
    <div
      className="border-b border-white/10"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4 min-w-0">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white truncate"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="truncate">{phone}</span>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white truncate"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{email}</span>
            </a>
          )}
          {showAddressInTopBar && (
            <div className="hidden lg:inline-flex items-center gap-2 text-xs font-semibold text-white/90 truncate">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{addressOneLine}</span>
            </div>
          )}
        </div>

        {socialItems.length > 0 && (
          <div className="flex items-center gap-3">
            {socialItems.slice(0, 5).map((s) => {
              const Icon = getSocialIcon(s.key);
              const showIcons = socialDisplayStyle === "icons";

              if (showIcons) {
                return (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/10"
                    aria-label={s.label}
                    title={s.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              }

              return (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-white/90 hover:text-white"
                >
                  {s.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ) : null;

  const linkTextBaseClass =
    templateKey === "rivr"
      ? "text-sm font-semibold tracking-wide"
      : "text-sm font-bold uppercase tracking-widest";

  const pillBaseClass =
    templateKey === "rivr" && !isLightVariant ? "px-3 py-2 rounded-full" : "";

  const hoverClass = isLightVariant
    ? "hover:text-[color:var(--primary)]"
    : templateKey === "classic"
      ? "hover:text-[color:var(--secondary)]"
      : "hover:text-white";

  const desktopGapClass =
    templateKey === "rivr"
      ? "gap-6"
      : templateKey === "classic"
        ? "gap-5"
        : "gap-4";

  const renderDesktopLinks = () => {
    const items = isSinglePageMode
      ? singleModeItems
      : navigationPages.map((page) => ({
          key: String(page.id),
          label: page.title,
          kind: "page",
          slug: page.slug,
          disabled: apiPreview && !page.is_enabled,
        }));

    return (
      <div
        className={`hidden md:flex items-center flex-wrap ${desktopGapClass}`}
      >
        {items.map((item) => {
          const isActive =
            item.kind === "page" && resolvedPageSlug === item.slug;

          const color = isActive
            ? computedNavActiveColor
            : computedNavLinkColor;

          const activePillClassName =
            pillBaseClass && isActive
              ? "bg-white/10 border border-white/15"
              : "";

          const className =
            `${linkTextBaseClass} ${pillBaseClass} ${activePillClassName} transition-colors ${hoverClass}`.trim();

          const onClick = () => {
            if (item.kind === "home") {
              setMobileMenuOpen(false);
              onAnchorClick("__top");
              return;
            }
            if (item.kind === "anchor") {
              setMobileMenuOpen(false);
              onAnchorClick(item.anchor);
              return;
            }
            setMobileMenuOpen(false);
            onPageChange(item.slug);
          };

          return (
            <button
              key={item.key}
              onClick={onClick}
              className={className}
              style={{ color }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  };

  const headerShellClassName =
    variant === "solid" || variant === "dark"
      ? "border-b border-white/10"
      : "border-b border-gray-100";

  const headerShellStyle =
    variant === "solid" || variant === "dark"
      ? { backgroundColor: primaryColor }
      : undefined;

  const headerInnerClassName =
    templateKey === "journey"
      ? "max-w-7xl mx-auto px-6 py-4 flex flex-col items-center gap-4"
      : templateKey === "rivr"
        ? "max-w-7xl mx-auto px-6 py-5 flex items-center justify-between"
        : "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between";

  const brandTitleClassName = hasLogo
    ? "sr-only"
    : variant === "solid" || variant === "dark"
      ? "font-black text-xl tracking-tight text-white truncate"
      : "font-black text-xl tracking-tight truncate";

  const brandIconNode = hasLogo ? (
    <img src={logoUrl} alt={club.name} className="h-10 w-auto" />
  ) : null;

  const brandNode = (
    <button
      type="button"
      onClick={onBrandClick}
      className="flex items-center gap-3 min-w-0"
      title="Home"
    >
      {brandIconNode}
      <span className={brandTitleClassName}>{club.name}</span>
    </button>
  );

  const lightHeaderClassName = "bg-white border-b border-gray-100";

  const mobileMenuBgClassName =
    variant === "light"
      ? "md:hidden border-t border-gray-100 bg-white"
      : "md:hidden border-t border-white/10";

  const mobileMenuStyle =
    variant === "light" ? undefined : { backgroundColor: primaryColor };

  const mobileNavItems = isSinglePageMode
    ? singleModeItems.map((item) => ({
        key: item.key,
        label: item.label,
        onClick: () => {
          if (item.kind === "home") {
            onAnchorClick("__top");
            setMobileMenuOpen(false);
            return;
          }
          if (item.kind === "anchor") {
            onAnchorClick(item.anchor);
            setMobileMenuOpen(false);
            return;
          }
          onPageChange(item.slug);
          setMobileMenuOpen(false);
        },
        isActive: item.kind === "page" && resolvedPageSlug === item.slug,
        disabled: false,
      }))
    : navigationPages.map((page) => ({
        key: String(page.id),
        label: page.title,
        onClick: () => {
          onPageChange(page.slug);
          setMobileMenuOpen(false);
        },
        isActive: resolvedPageSlug === page.slug,
        disabled: apiPreview && !page.is_enabled,
      }));

  return (
    <nav className="sticky top-0 z-50">
      {socialBarPosition === "above" && topBar}

      <div
        className={
          variant === "light" ? lightHeaderClassName : headerShellClassName
        }
        style={variant === "light" ? undefined : headerShellStyle}
      >
        <div className={headerInnerClassName}>
          {templateKey === "journey" ? (
            <div className="flex w-full items-center justify-center">
              {brandNode}
            </div>
          ) : (
            brandNode
          )}

          {templateKey === "journey" ? (
            <div className="w-full flex items-center justify-center gap-5 flex-wrap">
              {renderDesktopLinks()}
              {desktopCtaButtonsNode}
            </div>
          ) : (
            <>
              {renderDesktopLinks()}
              {desktopCtaButtonsNode}
            </>
          )}

          <div className="flex items-center gap-2 md:hidden">
            {mobileCtaNode}
            <button
              className={
                variant === "light" ? "md:hidden" : "md:hidden text-white"
              }
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XIcon /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Make Rivr Landing feel like a landing page even if the pages stay the same */}
        {templateKey === "rivr" && (
          <div
            className="h-[3px] w-full"
            style={{ backgroundColor: "var(--secondary)" }}
          />
        )}
      </div>

      {socialBarPosition === "below" && topBar}

      {mobileMenuOpen && (
        <div className={mobileMenuBgClassName} style={mobileMenuStyle}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2">
            {mobileNavItems.map((p) => {
              const color = p.isActive
                ? computedNavActiveColor
                : variant === "light"
                  ? computedNavLinkColor
                  : "rgba(255,255,255,0.92)";

              const disabledSuffix = p.disabled ? " (disabled)" : "";
              const label = `${p.label}${disabledSuffix}`;

              return (
                <button
                  key={p.key}
                  onClick={p.onClick}
                  className="py-3 text-left font-semibold"
                  style={{ color }}
                >
                  {label}
                </button>
              );
            })}

            {(canShowJoinCta || canShowLoginCta) && (
              <div className="mt-3 flex flex-col gap-2">
                {canShowJoinCta && (
                  <a
                    href={joinCtaHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      variant === "light"
                        ? "inline-flex items-center justify-center px-5 py-3 rounded-full font-extrabold bg-[color:var(--primary)] text-white hover:bg-[color:var(--secondary)]"
                        : "inline-flex items-center justify-center px-5 py-3 rounded-full font-extrabold bg-white text-[color:var(--primary)] hover:bg-[color:var(--secondary)] hover:text-white"
                    }
                  >
                    Join Us
                  </a>
                )}

                {canShowLoginCta && (
                  <a
                    href={loginCtaHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      variant === "light"
                        ? "inline-flex items-center justify-center px-5 py-3 rounded-full font-extrabold bg-[color:var(--primary)] text-white hover:bg-[color:var(--secondary)]"
                        : "inline-flex items-center justify-center px-5 py-3 rounded-full font-extrabold bg-white text-[color:var(--primary)] hover:bg-[color:var(--secondary)] hover:text-white"
                    }
                  >
                    Member Login
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
