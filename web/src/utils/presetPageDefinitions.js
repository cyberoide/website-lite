import {
  FileText,
  Calendar,
  Phone,
  Users,
  UserCheck,
  LogIn,
  Folder,
} from "lucide-react";

export const presetPages = [
  {
    key: "home",
    title: "Home",
    slug: "home",
    Icon: FileText,
    description: "Hero + quick links",
  },
  {
    key: "about",
    title: "About",
    slug: "about",
    Icon: FileText,
    description: "Intro + story",
  },
  {
    key: "events",
    title: "Events",
    slug: "events",
    Icon: Calendar,
    description: "Event calendar embed",
  },
  {
    key: "membership",
    title: "Membership",
    slug: "membership",
    Icon: UserCheck,
    description: "Application form embed",
  },
  {
    key: "login",
    title: "Member Login",
    slug: "login",
    Icon: LogIn,
    description: "Login widget embed",
  },
  {
    key: "leadership",
    title: "Leadership",
    slug: "leadership",
    Icon: Users,
    description: "Board/officers embed",
  },
  {
    key: "documents",
    title: "Documents",
    slug: "documents",
    Icon: Folder,
    description: "PDF links",
  },
  {
    key: "contact",
    title: "Contact",
    slug: "contact",
    Icon: Phone,
    description: "Contact form embed",
  },
];
