import { useState, useEffect } from "react";

export function useThemeState(website) {
  const [localPrimary, setLocalPrimary] = useState("#0066FF");
  const [localSecondary, setLocalSecondary] = useState("#FFD400");
  const [localBrandingSource, setLocalBrandingSource] = useState("custom");
  const [localLogoUrl, setLocalLogoUrl] = useState(null);
  const [localIconUrl, setLocalIconUrl] = useState(null);

  const [localPhone, setLocalPhone] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [localSocialBarPosition, setLocalSocialBarPosition] = useState("above");
  const [localSocialDisplayStyle, setLocalSocialDisplayStyle] =
    useState("names");
  const [localSocialLinks, setLocalSocialLinks] = useState({
    facebook: "",
    instagram: "",
    x: "",
    youtube: "",
    linkedin: "",
  });

  // ADD: typography
  const [localBodyFont, setLocalBodyFont] = useState("inter");
  const [localHeadingFont, setLocalHeadingFont] = useState("inter");
  const [localBodyTextColor, setLocalBodyTextColor] = useState("#111418");
  const [localHeadingTextColor, setLocalHeadingTextColor] = useState("#111418");

  // ADD: header CTA
  const [localHeaderCtaEnabled, setLocalHeaderCtaEnabled] = useState(false);
  const [localHeaderCtaAction, setLocalHeaderCtaAction] = useState("join");

  // Header/nav styling
  const [localNavColorMode, setLocalNavColorMode] = useState("auto");
  const [localNavLinkColor, setLocalNavLinkColor] = useState("#111418");
  const [localNavActiveColor, setLocalNavActiveColor] = useState("#0066FF");

  // Social bar options
  const [localSocialShowAddress, setLocalSocialShowAddress] = useState(false);

  useEffect(() => {
    if (!website) return;

    if (website?.primary_color) setLocalPrimary(website.primary_color);
    if (website?.secondary_color) setLocalSecondary(website.secondary_color);
    if (website?.branding_source)
      setLocalBrandingSource(website.branding_source);
    if (website?.logo_url) setLocalLogoUrl(website.logo_url);
    if (website?.icon_url) setLocalIconUrl(website.icon_url);

    if (typeof website?.contact_phone === "string")
      setLocalPhone(website.contact_phone);
    if (typeof website?.contact_email === "string")
      setLocalEmail(website.contact_email);
    if (typeof website?.contact_address === "string")
      setLocalAddress(website.contact_address);

    if (typeof website?.social_bar_position === "string") {
      setLocalSocialBarPosition(website.social_bar_position);
    }
    if (typeof website?.social_display_style === "string") {
      setLocalSocialDisplayStyle(website.social_display_style);
    }

    // ADD: typography
    if (typeof website?.body_font === "string" && website.body_font.trim()) {
      setLocalBodyFont(website.body_font);
    }
    if (
      typeof website?.heading_font === "string" &&
      website.heading_font.trim()
    ) {
      setLocalHeadingFont(website.heading_font);
    }
    if (
      typeof website?.body_text_color === "string" &&
      website.body_text_color.trim()
    ) {
      setLocalBodyTextColor(website.body_text_color);
    }
    if (
      typeof website?.heading_text_color === "string" &&
      website.heading_text_color.trim()
    ) {
      setLocalHeadingTextColor(website.heading_text_color);
    }

    // ADD: header CTA
    if (typeof website?.header_cta_enabled === "boolean") {
      setLocalHeaderCtaEnabled(website.header_cta_enabled);
    }
    if (
      typeof website?.header_cta_action === "string" &&
      website.header_cta_action.trim()
    ) {
      setLocalHeaderCtaAction(website.header_cta_action);
    }

    // Header/nav styling
    if (typeof website?.nav_color_mode === "string" && website.nav_color_mode) {
      setLocalNavColorMode(
        website.nav_color_mode === "custom" ? "custom" : "auto",
      );
    }
    if (typeof website?.nav_link_color === "string" && website.nav_link_color) {
      setLocalNavLinkColor(website.nav_link_color);
    }
    if (
      typeof website?.nav_active_color === "string" &&
      website.nav_active_color
    ) {
      setLocalNavActiveColor(website.nav_active_color);
    }

    if (typeof website?.social_show_address === "boolean") {
      setLocalSocialShowAddress(website.social_show_address);
    }

    let sl = null;
    if (website?.social_links && typeof website.social_links === "object") {
      sl = website.social_links;
    } else if (typeof website?.social_links === "string") {
      try {
        const parsed = JSON.parse(website.social_links);
        if (parsed && typeof parsed === "object") sl = parsed;
      } catch (e) {
        // ignore
      }
    }
    if (sl) {
      setLocalSocialLinks({
        facebook: typeof sl.facebook === "string" ? sl.facebook : "",
        instagram: typeof sl.instagram === "string" ? sl.instagram : "",
        x: typeof sl.x === "string" ? sl.x : "",
        youtube: typeof sl.youtube === "string" ? sl.youtube : "",
        linkedin: typeof sl.linkedin === "string" ? sl.linkedin : "",
      });
    }
  }, [website]);

  return {
    localPrimary,
    setLocalPrimary,
    localSecondary,
    setLocalSecondary,
    localBrandingSource,
    setLocalBrandingSource,
    localLogoUrl,
    setLocalLogoUrl,
    localIconUrl,
    setLocalIconUrl,
    localPhone,
    setLocalPhone,
    localEmail,
    setLocalEmail,
    localAddress,
    setLocalAddress,
    localSocialBarPosition,
    setLocalSocialBarPosition,
    localSocialDisplayStyle,
    setLocalSocialDisplayStyle,
    localSocialLinks,
    setLocalSocialLinks,

    // ADD: typography
    localBodyFont,
    setLocalBodyFont,
    localHeadingFont,
    setLocalHeadingFont,
    localBodyTextColor,
    setLocalBodyTextColor,
    localHeadingTextColor,
    setLocalHeadingTextColor,

    // ADD: header CTA
    localHeaderCtaEnabled,
    setLocalHeaderCtaEnabled,
    localHeaderCtaAction,
    setLocalHeaderCtaAction,

    // Header/nav styling
    localNavColorMode,
    setLocalNavColorMode,
    localNavLinkColor,
    setLocalNavLinkColor,
    localNavActiveColor,
    setLocalNavActiveColor,

    // Social bar options
    localSocialShowAddress,
    setLocalSocialShowAddress,
  };
}
