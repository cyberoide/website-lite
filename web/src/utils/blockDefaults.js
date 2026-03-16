export function getDefaultBlockData(type) {
  switch (type) {
    case "text":
      return {
        content: "",
        // Optional per-block overrides
        textColor: "",
        backgroundColor: "",
      };
    case "image":
      return { url: "", caption: "" };
    case "hero":
      return {
        backgroundUrl: "",
        heading: "Headline",
        subheading: "Add a short message here...",
        ctaText: "Learn More",
        ctaLink: "#",
        align: "left",
        overlayOpacity: 0.55,

        // Optional color overrides
        overlayColor: "#000000",
        headingColor: "#FFFFFF",
        subheadingColor: "#FFFFFF",
        fallbackBackgroundColor: "#0b1220",
      };
    case "imageOverlay":
      return {
        imageUrl: "",
        title: "Overlay Title",
        text: "Optional supporting text.",
        overlayOpacity: 0.55,

        // Optional color overrides
        overlayColor: "#000000",
        headingColor: "#FFFFFF",
        bodyTextColor: "#FFFFFF",
      };
    case "ctaCards":
      return {
        cards: [
          {
            title: "Card title",
            text: "Short description",
            linkText: "Learn more",
            linkHref: "#",
            imageUrl: "",
          },
          {
            title: "Card title",
            text: "Short description",
            linkText: "Learn more",
            linkHref: "#",
            imageUrl: "",
          },
          {
            title: "Card title",
            text: "Short description",
            linkText: "Learn more",
            linkHref: "#",
            imageUrl: "",
          },
        ],
      };
    case "links":
      return {
        title: "Links",
        links: [
          { label: "Link", url: "#", note: "" },
          { label: "Link", url: "#", note: "" },
        ],
      };

    // Rich layout blocks (for demo-style templates)
    case "sectionHeader":
      return {
        anchor: "",
        navLabel: "",
        eyebrow: "",
        heading: "Section heading",
        subheading: "",
        align: "center",
        background: "none", // none | light | dark | custom
        backgroundColor: "",
        overrideHeadingColor: "",
        overrideBodyTextColor: "",
      };
    case "split":
      return {
        anchor: "",
        navLabel: "",
        eyebrow: "",
        heading: "Section heading",
        text: "",
        imageUrl: "",
        imageSide: "left", // left | right
        background: "none", // none | light | custom
        backgroundColor: "",
        overrideHeadingColor: "",
        overrideBodyTextColor: "",
        ctaText: "Learn More",
        ctaLink: "#",
      };
    case "testimonials":
      return {
        anchor: "",
        navLabel: "",
        heading: "What members say",
        background: "dark", // dark | light
        testimonials: [
          {
            quote: "A wonderful club experience.",
            name: "Member Name",
            title: "Member",
            imageUrl: "",
          },
          {
            quote: "Beautiful marina and welcoming community.",
            name: "Guest Skipper",
            title: "Visiting Yacht",
            imageUrl: "",
          },
        ],
      };
    case "gallery":
      return {
        anchor: "",
        navLabel: "",
        heading: "Photo Gallery",
        images: [
          { url: "", caption: "" },
          { url: "", caption: "" },
          { url: "", caption: "" },
          { url: "", caption: "" },
          { url: "", caption: "" },
          { url: "", caption: "" },
        ],
      };

    default:
      return { embedType: "login" };
  }
}

export function createBlock(type) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    data: getDefaultBlockData(type),
  };
}
