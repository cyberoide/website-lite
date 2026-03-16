import { MemberLoginWidget } from "../EmbedWidgets/MemberLoginWidget";
import { MembershipForm } from "../EmbedWidgets/MembershipForm";
import { EventCalendar } from "../EmbedWidgets/EventCalendar";
import { ContactForm } from "../EmbedWidgets/ContactForm";
import { LeadershipDetails } from "../EmbedWidgets/LeadershipDetails";

export function EmbedBlock({ block, clubSlug }) {
  const embedType = block?.data?.embedType;

  if (embedType === "login") {
    return <MemberLoginWidget clubSlug={clubSlug} />;
  }

  if (embedType === "membership") {
    return <MembershipForm clubSlug={clubSlug} />;
  }

  if (embedType === "calendar") {
    return <EventCalendar clubSlug={clubSlug} />;
  }

  if (embedType === "contact") {
    return <ContactForm clubSlug={clubSlug} />;
  }

  if (embedType === "leadership") {
    // Default to exec + trustees (can be made configurable later via block.data.view)
    return <LeadershipDetails clubSlug={clubSlug} view="executive-trustees" />;
  }

  return null;
}
