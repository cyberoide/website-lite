import {
  PanelTop,
  Heading1,
  Columns2,
  Columns3,
  MessageSquareQuote,
  Images,
  Layers,
  Image as ImageIcon,
  Box,
  Link as LinkIcon,
  Type,
} from "lucide-react";

export function getBlockMeta(type) {
  switch (type) {
    case "hero":
      return { label: "Hero", Icon: PanelTop };
    case "sectionHeader":
      return { label: "Section Header", Icon: Heading1 };
    case "split":
      return { label: "Split Section", Icon: Columns2 };
    case "ctaCards":
      return { label: "Feature Cards", Icon: Columns3 };
    case "testimonials":
      return { label: "Testimonials", Icon: MessageSquareQuote };
    case "gallery":
      return { label: "Gallery", Icon: Images };
    case "imageOverlay":
      return { label: "Text over Image", Icon: Layers };
    case "image":
      return { label: "Image", Icon: ImageIcon };
    case "embed":
      return { label: "ClubSoft Embed", Icon: Box };
    case "links":
      return { label: "Links", Icon: LinkIcon };
    case "text":
    default:
      return { label: "Text", Icon: Type };
  }
}

export function getBlockTitle(block) {
  const type = typeof block?.type === "string" ? block.type : "text";

  const candidates = [
    block?.data?.navLabel,
    block?.data?.heading,
    block?.data?.title,
    block?.data?.label,
    block?.data?.subheading,
  ];

  const found = candidates.find((v) => typeof v === "string" && v.trim());
  if (found) return found;

  const meta = getBlockMeta(type);
  return meta.label;
}

export function getBlockLibrary() {
  return [
    {
      group: "Layout",
      items: [
        { type: "hero", label: "Hero" },
        { type: "sectionHeader", label: "Section Header" },
        { type: "split", label: "Split Section" },
        { type: "imageOverlay", label: "Text over Image" },
      ],
    },
    {
      group: "Content",
      items: [
        { type: "text", label: "Text" },
        { type: "image", label: "Image" },
        { type: "gallery", label: "Gallery" },
        { type: "testimonials", label: "Testimonials" },
      ],
    },
    {
      group: "Calls to action",
      items: [
        { type: "ctaCards", label: "Feature Cards" },
        { type: "links", label: "Links" },
      ],
    },
    {
      group: "ClubSoft embeds",
      items: [{ type: "embed", label: "Embed" }],
    },
  ];
}

export function filterBlockLibrary(library, searchQuery) {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return library;

  return library
    .map((g) => {
      const nextItems = g.items.filter((it) =>
        it.label.toLowerCase().includes(q),
      );
      return { ...g, items: nextItems };
    })
    .filter((g) => g.items.length > 0);
}
