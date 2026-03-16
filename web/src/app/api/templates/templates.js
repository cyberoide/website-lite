// Shared template definitions for Website Lite.
// These are used both for applying templates to a club site and for rendering previews.

export function buildTemplates() {
  return {
    coastal: {
      key: "coastal",
      name: "Coastal Modern",
      description: "Bright hero + modern sections.",
      // Colors are controlled by the Themes page (website.primary_color / website.secondary_color).
      pages: [
        {
          title: "Home",
          slug: "home",
          type: "home",
          is_enabled: true,
          content: [
            {
              id: "hero-1",
              type: "hero",
              data: {
                backgroundUrl:
                  "https://demo1.clubsoft.site/wp-content/uploads/2025/05/yacht-club-4-1024x678.jpeg",
                heading: "Welcome Aboard",
                subheading:
                  "A modern yachting community for cruising, racing, and lifelong friendships.",
                ctaText: "Explore the Club",
                ctaLink: "#about",
                align: "left",
                overlayOpacity: 0.45,
              },
            },
            {
              id: "section-about",
              type: "sectionHeader",
              data: {
                anchor: "about",
                navLabel: "About",
                eyebrow: "About",
                heading: "A waterfront community",
                subheading:
                  "Big typography, clean spacing, and sections that look great on phones.",
                align: "center",
                background: "none",
              },
            },
            {
              id: "split-1",
              type: "split",
              data: {
                anchor: "amenities",
                navLabel: "Amenities",
                eyebrow: "Amenities",
                heading: "Clubhouse, slips, and events",
                text: "Enjoy dining with a view, well-maintained slips, and a calendar full of racing + social events.",
                imageUrl:
                  "https://demo1.clubsoft.site/wp-content/uploads/2025/05/marinia-3-1024x686.jpeg",
                imageSide: "right",
                background: "light",
                ctaText: "View Events",
                ctaLink: "#events",
              },
            },
            {
              id: "cards-1",
              type: "ctaCards",
              data: {
                cards: [
                  {
                    title: "New Member Specials",
                    text: "Apply online in minutes. Everything routes through ClubSoft.",
                    linkText: "Apply",
                    linkHref: "#apply",
                    imageUrl:
                      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&q=80",
                  },
                  {
                    title: "Weekly Racing",
                    text: "From casual fun races to regattas — all in one calendar.",
                    linkText: "See Calendar",
                    linkHref: "#events",
                    imageUrl:
                      "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=2400&q=80",
                  },
                  {
                    title: "Marina & Docks",
                    text: "Slip holders, guests, and beautiful waterfront access.",
                    linkText: "Learn More",
                    linkHref: "#amenities",
                    imageUrl:
                      "https://images.unsplash.com/photo-1516632664305-eda5d137be17?auto=format&fit=crop&w=2400&q=80",
                  },
                ],
              },
            },
            {
              id: "section-events",
              type: "sectionHeader",
              data: {
                anchor: "events",
                navLabel: "Events",
                eyebrow: "Events",
                heading: "What’s happening",
                subheading:
                  "This block is designed to later pull your real ClubSoft events via embed.",
                align: "center",
                background: "none",
              },
            },
            {
              id: "home-embed-1",
              type: "embed",
              data: { embedType: "calendar" },
            },
            {
              id: "testimonials-1",
              type: "testimonials",
              data: {
                anchor: "reviews",
                navLabel: "Reviews",
                heading: "What members say",
                background: "dark",
                testimonials: [
                  {
                    quote:
                      "The best part is the people — friendly, helpful, and always up for a weekend cruise.",
                    name: "Alex Morgan",
                    title: "Member",
                    imageUrl:
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
                  },
                  {
                    quote:
                      "Great docks, great food, and a packed calendar. It feels like home.",
                    name: "Jamie Lee",
                    title: "Slip Holder",
                    imageUrl:
                      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop",
                  },
                  {
                    quote:
                      "The website is simple and polished — and everything important still lives in ClubSoft.",
                    name: "Casey D.",
                    title: "Club Admin",
                    imageUrl:
                      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop",
                  },
                ],
              },
            },
            {
              id: "section-apply",
              type: "sectionHeader",
              data: {
                anchor: "apply",
                navLabel: "Apply",
                eyebrow: "Membership",
                heading: "Apply for membership",
                subheading:
                  "This can embed the live ClubSoft membership application form.",
                align: "center",
                background: "light",
              },
            },
            {
              id: "home-embed-2",
              type: "embed",
              data: { embedType: "membership" },
            },
          ],
        },
      ],
    },

    classic: {
      key: "classic",
      name: "Classic Yacht",
      description: "Bold dark header + gallery.",
      // Colors are controlled by the Themes page (website.primary_color / website.secondary_color).
      pages: [
        {
          title: "Home",
          slug: "home",
          type: "home",
          is_enabled: true,
          content: [
            {
              id: "hero-1",
              type: "hero",
              data: {
                backgroundUrl:
                  "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=2400&q=80",
                heading: "Sail. Race. Belong.",
                subheading:
                  "A timeless look with bold sections and strong contrast.",
                ctaText: "Member Login",
                ctaLink: "#login",
                align: "left",
                overlayOpacity: 0.6,
              },
            },
            {
              id: "login-anchor",
              type: "sectionHeader",
              data: {
                anchor: "login",
                navLabel: "Login",
                eyebrow: "Members",
                heading: "Member portal",
                subheading: "Login via ClubSoft.",
                align: "center",
                background: "none",
              },
            },
            { id: "home-embed-1", type: "embed", data: { embedType: "login" } },
            {
              id: "home-overlay-1",
              type: "imageOverlay",
              data: {
                imageUrl:
                  "https://demo1.clubsoft.site/wp-content/uploads/2025/05/marinia-3-1024x686.jpeg",
                title: "Clubhouse & Waterfront",
                text: "Seasonal menus, private events, and marina views.",
                overlayOpacity: 0.55,
              },
            },
            {
              id: "events-header",
              type: "sectionHeader",
              data: {
                anchor: "events",
                navLabel: "Events",
                eyebrow: "Calendar",
                heading: "Upcoming events",
                subheading:
                  "A simple embed that can become a full event calendar.",
                align: "center",
                background: "light",
              },
            },
            {
              id: "home-embed-2",
              type: "embed",
              data: { embedType: "calendar" },
            },
          ],
        },
        {
          title: "Gallery",
          slug: "gallery",
          type: "gallery",
          is_enabled: true,
          content: [
            {
              id: "gallery-header",
              type: "sectionHeader",
              data: {
                anchor: "gallery",
                navLabel: "Gallery",
                eyebrow: "Photos",
                heading: "A day on the water",
                subheading: "Clean grid with modern spacing.",
                align: "center",
                background: "none",
              },
            },
            {
              id: "gallery-1",
              type: "gallery",
              data: {
                anchor: "gallery-grid",
                navLabel: "",
                heading: "Photo Gallery",
                images: [
                  {
                    url: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1600&q=80",
                    caption: "",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1516632664305-eda5d137be17?auto=format&fit=crop&w=1600&q=80",
                    caption: "",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                    caption: "",
                  },
                  {
                    url: "https://demo1.clubsoft.site/wp-content/uploads/2025/05/yacht-club-4-1024x678.jpeg",
                    caption: "",
                  },
                  {
                    url: "https://demo1.clubsoft.site/wp-content/uploads/2025/05/marinia-3-1024x686.jpeg",
                    caption: "",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
                    caption: "",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    rivr: {
      key: "rivr",
      name: "Rivr Landing",
      description: "Hero + cards + member links.",
      // Colors are controlled by the Themes page (website.primary_color / website.secondary_color).
      pages: [
        {
          title: "Home",
          slug: "home",
          type: "home",
          is_enabled: true,
          content: [
            {
              id: "hero-1",
              type: "hero",
              data: {
                backgroundUrl:
                  "https://demo1.clubsoft.site/wp-content/uploads/2025/05/marinia-3-1024x686.jpeg",
                heading: "A great place to call home",
                subheading:
                  "Yearly moorage spaces available — welcoming community included.",
                ctaText: "Learn More",
                ctaLink: "#membership",
                align: "left",
                overlayOpacity: 0.5,
              },
            },
            {
              id: "cards-1",
              type: "ctaCards",
              data: {
                cards: [
                  {
                    title: "Moorage Available",
                    text: "Secure slips, easy access, and a great lakefront location.",
                    linkText: "Learn More",
                    linkHref: "#membership",
                    imageUrl:
                      "https://demo1.clubsoft.site/wp-content/uploads/2025/05/marinia-3-1024x686.jpeg",
                  },
                  {
                    title: "Now Accepting New Members",
                    text: "Apply online and keep everything in ClubSoft.",
                    linkText: "Join Us",
                    linkHref: "#apply",
                    imageUrl:
                      "https://demo1.clubsoft.site/wp-content/uploads/2025/05/yacht-club-4-1024x678.jpeg",
                  },
                  {
                    title: "A Legacy On The Lake",
                    text: "Sailing, racing, and a great social calendar.",
                    linkText: "Read Our Story",
                    linkHref: "#about",
                    imageUrl:
                      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&q=80",
                  },
                ],
              },
            },
            {
              id: "member-links-header",
              type: "sectionHeader",
              data: {
                anchor: "member-links",
                navLabel: "Members",
                eyebrow: "Members",
                heading: "Member links",
                subheading: "Quick links for existing members.",
                align: "center",
                background: "light",
              },
            },
            {
              id: "member-links-1",
              type: "links",
              data: {
                title: "Member Links",
                links: [
                  {
                    label: "Membership Portal",
                    url: "https://ycmanager.com/",
                    note: "(requires username and password)",
                  },
                  { label: "Membership Information", url: "#membership" },
                  { label: "Weather", url: "#" },
                ],
              },
            },
            {
              id: "section-about",
              type: "sectionHeader",
              data: {
                anchor: "about",
                navLabel: "About",
                eyebrow: "Welcome",
                heading: "Welcome to our Yacht Club",
                subheading:
                  "Boating enthusiasts come together for events, friendships, and time on the water.",
                align: "center",
                background: "none",
              },
            },
            {
              id: "split-1",
              type: "split",
              data: {
                anchor: "membership",
                navLabel: "Membership",
                eyebrow: "Membership",
                heading: "A club that’s easy to join",
                text: "Your website stays simple, but your membership system stays powerful — applications, approvals, and payments all live in ClubSoft.",
                imageUrl:
                  "https://images.unsplash.com/photo-1516632664305-eda5d137be17?auto=format&fit=crop&w=2400&q=80",
                imageSide: "right",
                background: "light",
                ctaText: "Apply Now",
                ctaLink: "#apply",
              },
            },
            {
              id: "section-events",
              type: "sectionHeader",
              data: {
                anchor: "events",
                navLabel: "Events",
                eyebrow: "Events",
                heading: "Upcoming events",
                subheading: "Embedded from ClubSoft.",
                align: "center",
                background: "none",
              },
            },
            {
              id: "home-embed-1",
              type: "embed",
              data: { embedType: "calendar" },
            },
            {
              id: "section-apply",
              type: "sectionHeader",
              data: {
                anchor: "apply",
                navLabel: "Apply",
                eyebrow: "Membership",
                heading: "Apply for membership",
                subheading: "Submit your application via ClubSoft.",
                align: "center",
                background: "light",
              },
            },
            {
              id: "home-embed-2",
              type: "embed",
              data: { embedType: "membership" },
            },
          ],
        },
      ],
    },

    journey: {
      key: "journey",
      name: "Journey One-Page",
      description: "One-page anchors + gallery + testimonials.",
      // Colors are controlled by the Themes page (website.primary_color / website.secondary_color).
      pages: [
        {
          title: "Home",
          slug: "home",
          type: "home",
          is_enabled: true,
          content: [
            {
              id: "hero-1",
              type: "hero",
              data: {
                backgroundUrl:
                  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80",
                heading: "Live, dock, and belong",
                subheading:
                  "A one-page layout with anchors and clean modern sections.",
                ctaText: "Explore",
                ctaLink: "#about",
                align: "left",
                overlayOpacity: 0.5,
              },
            },
            {
              id: "about-header",
              type: "sectionHeader",
              data: {
                anchor: "about",
                navLabel: "About",
                eyebrow: "About",
                heading: "A club built for life on the water",
                subheading:
                  "Swap images, adjust copy, and embed real ClubSoft features whenever you’re ready.",
                align: "center",
                background: "none",
              },
            },
            {
              id: "split-1",
              type: "split",
              data: {
                anchor: "membership",
                navLabel: "Membership",
                eyebrow: "Membership",
                heading: "Become a member",
                text: "Apply online, get approved in ClubSoft, and keep everything in one system.",
                imageUrl:
                  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&q=80",
                imageSide: "left",
                background: "light",
                ctaText: "Apply Now",
                ctaLink: "#apply",
              },
            },
            {
              id: "gallery-header",
              type: "sectionHeader",
              data: {
                anchor: "gallery",
                navLabel: "Gallery",
                eyebrow: "Gallery",
                heading: "A day at the marina",
                subheading: "A clean photo grid that looks great on phones.",
                align: "center",
                background: "none",
              },
            },
            {
              id: "gallery-1",
              type: "gallery",
              data: {
                anchor: "gallery-grid",
                navLabel: "",
                heading: "Photo Gallery",
                images: [
                  {
                    url: "https://demo1.clubsoft.site/wp-content/uploads/2025/05/yacht-club-4-1024x678.jpeg",
                    caption: "",
                  },
                  {
                    url: "https://demo1.clubsoft.site/wp-content/uploads/2025/05/marinia-3-1024x686.jpeg",
                    caption: "",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1600&q=80",
                    caption: "",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
                    caption: "",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1516632664305-eda5d137be17?auto=format&fit=crop&w=1600&q=80",
                    caption: "",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                    caption: "",
                  },
                ],
              },
            },
            {
              id: "testimonials-1",
              type: "testimonials",
              data: {
                anchor: "reviews",
                navLabel: "Reviews",
                heading: "What members say",
                background: "dark",
                testimonials: [
                  {
                    quote:
                      "A warm welcome, great docks, and an amazing social calendar.",
                    name: "Morgan S.",
                    title: "Member",
                    imageUrl:
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
                  },
                  {
                    quote:
                      "Everything is easy — events, applications, and communication.",
                    name: "Taylor R.",
                    title: "New Member",
                    imageUrl:
                      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop",
                  },
                ],
              },
            },
            {
              id: "apply-header",
              type: "sectionHeader",
              data: {
                anchor: "apply",
                navLabel: "Apply",
                eyebrow: "Apply",
                heading: "Apply online",
                subheading: "This embed will submit directly to ClubSoft.",
                align: "center",
                background: "light",
              },
            },
            {
              id: "apply-embed",
              type: "embed",
              data: { embedType: "membership" },
            },
            {
              id: "contact-header",
              type: "sectionHeader",
              data: {
                anchor: "contact",
                navLabel: "Contact",
                eyebrow: "Contact",
                heading: "Get in touch",
                subheading:
                  "Questions about membership or visiting? Send a message.",
                align: "center",
                background: "none",
              },
            },
            {
              id: "contact-embed",
              type: "embed",
              data: { embedType: "contact" },
            },
          ],
        },
      ],
    },
  };
}
