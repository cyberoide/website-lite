import { createBlock } from "@/utils/blockDefaults";

export function buildPresetContent(presetKey, clubName) {
  const name = clubName || "Your Club";

  if (presetKey === "home") {
    const hero = createBlock("hero");
    hero.data.heading = `Welcome to ${name}`;
    hero.data.subheading =
      "Discover membership, events, and everything happening at the club.";
    hero.data.ctaText = "Apply for Membership";
    hero.data.ctaLink = "#membership";

    const cards = createBlock("ctaCards");
    cards.data.cards = [
      {
        title: "Membership",
        text: "Apply online in minutes.",
        linkText: "Apply",
        linkHref: "#membership",
        imageUrl: "",
      },
      {
        title: "Events",
        text: "See what's happening this season.",
        linkText: "View events",
        linkHref: "#events",
        imageUrl: "",
      },
      {
        title: "Contact",
        text: "Questions? Get in touch with the club.",
        linkText: "Contact us",
        linkHref: "#contact",
        imageUrl: "",
      },
    ];

    const links = createBlock("links");
    links.data.title = "Quick Links";
    links.data.links = [
      { label: "Member Login", url: "#login", note: "" },
      { label: "Apply for Membership", url: "#membership", note: "" },
      { label: "Upcoming Events", url: "#events", note: "" },
    ];

    return [hero, cards, links];
  }

  if (presetKey === "about") {
    const header = createBlock("sectionHeader");
    header.data.heading = "About the Club";
    header.data.subheading = "A short introduction and what makes us special.";
    header.data.align = "left";

    const text = createBlock("text");
    text.data.content =
      "Write a short story about the club, the marina, and what members love most.";

    return [header, text];
  }

  if (presetKey === "events") {
    const header = createBlock("sectionHeader");
    header.data.anchor = "events";
    header.data.navLabel = "Events";
    header.data.heading = "Upcoming Events";
    header.data.subheading =
      "Stay up to date with races, socials, and club events.";
    header.data.align = "left";

    const embed = createBlock("embed");
    embed.data.embedType = "calendar";

    return [header, embed];
  }

  if (presetKey === "contact") {
    const header = createBlock("sectionHeader");
    header.data.anchor = "contact";
    header.data.navLabel = "Contact";
    header.data.heading = "Contact";
    header.data.subheading = "Send a message and we'll get back to you.";
    header.data.align = "left";

    const embed = createBlock("embed");
    embed.data.embedType = "contact";

    return [header, embed];
  }

  if (presetKey === "membership") {
    const header = createBlock("sectionHeader");
    header.data.anchor = "membership";
    header.data.navLabel = "Membership";
    header.data.heading = "Membership";
    header.data.subheading = "Apply online through ClubSoft.";
    header.data.align = "left";

    const embed = createBlock("embed");
    embed.data.embedType = "membership";

    return [header, embed];
  }

  if (presetKey === "leadership") {
    const header = createBlock("sectionHeader");
    header.data.heading = "Leadership";
    header.data.subheading = "Meet the board and officers.";
    header.data.align = "left";

    const embed = createBlock("embed");
    embed.data.embedType = "leadership";

    return [header, embed];
  }

  if (presetKey === "login") {
    const header = createBlock("sectionHeader");
    header.data.heading = "Member Login";
    header.data.subheading = "Sign in to ClubSoft.";
    header.data.align = "left";

    const embed = createBlock("embed");
    embed.data.embedType = "login";

    return [header, embed];
  }

  // documents
  const header = createBlock("sectionHeader");
  header.data.heading = "Documents";
  header.data.subheading = "Share PDFs, policies, and resources.";
  header.data.align = "left";

  const links = createBlock("links");
  links.data.title = "Downloads";
  links.data.links = [
    { label: "Membership Packet", url: "#", note: "PDF" },
    { label: "Club Rules", url: "#", note: "PDF" },
  ];

  return [header, links];
}
