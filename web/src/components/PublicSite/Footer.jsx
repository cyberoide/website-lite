import React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  X,
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
      return X;
    default:
      return Twitter;
  }
}

function normalizeExternalUrl(href) {
  if (typeof href !== "string") return "";
  const trimmed = href.trim();
  if (!trimmed) return "";
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

function getTemplateKey(website) {
  const key = website?.selected_template_key;
  if (typeof key === "string" && key.trim()) return key;
  return "coastal";
}

export function Footer({
  club,
  primaryColor,
  // secondaryColor, // no longer shown in footer
  website,
  isSinglePageMode,
  onePageNavItems,
  visiblePages,
  apiPreview,
  resolvedPageSlug,
  onAnchorClick,
  onPageChange,
}) {
  const templateKey = getTemplateKey(website);
  const socialItems = normalizeSocialLinks(website?.social_links);
  const socialDisplayStyle =
    website?.social_display_style === "icons" ? "icons" : "names";
  const phone =
    typeof website?.contact_phone === "string" ? website.contact_phone : "";
  const email =
    typeof website?.contact_email === "string" ? website.contact_email : "";
  const address =
    typeof website?.contact_address === "string" ? website.contact_address : "";

  const year = new Date().getFullYear();

  const isDark = templateKey === "classic";

  const footerShellClassName = isDark
    ? "bg-[#0B3A67] text-white"
    : "bg-gray-50 text-gray-900";

  const footerShellStyle = isDark
    ? { backgroundColor: primaryColor }
    : undefined;

  const headingClassName = isDark
    ? "font-black text-2xl mb-4 text-white"
    : "font-black text-2xl mb-4";

  const subTextClassName = isDark ? "text-white/70" : "text-gray-600";

  const smallHeadingClassName = isDark
    ? "font-bold mb-4 uppercase text-xs tracking-widest text-white/70"
    : "font-bold mb-4 uppercase text-xs tracking-widest text-gray-400";

  const linkClassName = isDark
    ? "text-white/90 hover:underline font-medium"
    : "text-gray-600 hover:underline font-medium";

  const bottomBarClassName = isDark
    ? "border-t border-white/10"
    : "border-t border-gray-200";

  const bottomTextClassName = isDark ? "text-white/70" : "text-gray-500";

  const enabledPages = React.useMemo(() => {
    const list = Array.isArray(visiblePages) ? visiblePages : [];
    // Hidden pages should not appear in footer navigation.
    return list.filter((p) => p?.is_enabled === true);
  }, [visiblePages]);

  const navigationPages = React.useMemo(() => {
    return enabledPages.filter((p) => p?.in_navigation !== false);
  }, [enabledPages]);

  const homeSlug = React.useMemo(() => {
    const home =
      navigationPages.find((p) => p?.slug === "home") ||
      enabledPages.find((p) => p?.slug === "home");
    if (home?.slug) return home.slug;

    const firstNav = navigationPages[0];
    if (firstNav?.slug) return firstNav.slug;

    const firstEnabled = enabledPages[0];
    return firstEnabled?.slug || "home";
  }, [navigationPages, enabledPages]);

  const singleModeFooterItems = React.useMemo(() => {
    if (!isSinglePageMode) return [];

    const anchors = (Array.isArray(onePageNavItems) ? onePageNavItems : [])
      .map((item) => {
        if (!item?.label || !item?.anchor) return null;
        return { key: `anchor-${item.anchor}`, kind: "anchor", ...item };
      })
      .filter(Boolean);

    const extraPages = navigationPages
      .filter((p) => p?.slug && p.slug !== homeSlug)
      .map((p) => ({
        key: `page-${p.id}`,
        kind: "page",
        label: p.title,
        slug: p.slug,
      }));

    return [
      { key: "__home", kind: "home", label: "Home" },
      ...anchors,
      ...extraPages,
    ];
  }, [isSinglePageMode, onePageNavItems, navigationPages, homeSlug]);

  return (
    <footer
      className={`${footerShellClassName} border-t ${isDark ? "border-white/10" : "border-gray-100"}`}
      style={footerShellStyle}
    >
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className={headingClassName}>{club.name}</h3>

            {(phone || email || address) && (
              <div className={`mt-6 space-y-1 text-sm ${subTextClassName}`}>
                {phone && (
                  <div>
                    <a href={`tel:${phone}`} className="hover:underline">
                      {phone}
                    </a>
                  </div>
                )}
                {email && (
                  <div>
                    <a href={`mailto:${email}`} className="hover:underline">
                      {email}
                    </a>
                  </div>
                )}
                {address && (
                  <div
                    className={
                      isDark
                        ? "whitespace-pre-line text-white/70"
                        : "whitespace-pre-line text-gray-500"
                    }
                  >
                    {address}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className={smallHeadingClassName}>Navigation</h4>
            <ul className="space-y-2">
              {isSinglePageMode
                ? singleModeFooterItems.map((item) => {
                    const onClick = () => {
                      if (item.kind === "home") {
                        onAnchorClick("__top");
                        return;
                      }
                      if (item.kind === "anchor") {
                        onAnchorClick(item.anchor);
                        return;
                      }
                      onPageChange(item.slug);
                    };

                    return (
                      <li key={item.key}>
                        <button
                          onClick={onClick}
                          className={linkClassName}
                          style={isDark ? undefined : { color: primaryColor }}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  })
                : navigationPages.map((p) => {
                    const isActive = resolvedPageSlug === p.slug;
                    const activeStyle = isDark
                      ? undefined
                      : { color: isActive ? primaryColor : undefined };

                    const activeClassName =
                      isDark && isActive
                        ? "text-white hover:underline font-medium"
                        : linkClassName;

                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => onPageChange(p.slug)}
                          className={activeClassName}
                          style={activeStyle}
                        >
                          {p.title}
                        </button>
                      </li>
                    );
                  })}
            </ul>
          </div>

          <div>
            <h4 className={smallHeadingClassName}>Follow</h4>
            {socialItems.length === 0 ? (
              <div
                className={`text-sm ${isDark ? "text-white/70" : "text-gray-500"}`}
              >
                No social links yet.
              </div>
            ) : (
              <ul
                className={
                  socialDisplayStyle === "icons"
                    ? "flex flex-wrap gap-3"
                    : "space-y-2"
                }
              >
                {socialItems.map((s) => {
                  const Icon = getSocialIcon(s.key);
                  const showIcons = socialDisplayStyle === "icons";

                  if (showIcons) {
                    return (
                      <li key={s.key}>
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          className={
                            isDark
                              ? "inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/15"
                              : "inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-gray-100 text-gray-700 hover:shadow-md"
                          }
                          aria-label={s.label}
                          title={s.label}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className={linkClassName}
                      >
                        {s.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className={bottomBarClassName}>
        <div
          className={`max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs ${bottomTextClassName}`}
        >
          <div>
            © {year} {club.name}. All rights reserved.
          </div>
          <div>
            Powered by{" "}
            <a
              href="https://clubsoft.co"
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:underline"
              style={isDark ? { color: "white" } : { color: primaryColor }}
            >
              ClubSoft
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
