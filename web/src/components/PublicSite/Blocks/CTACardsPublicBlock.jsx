import { ArrowUpRight } from "lucide-react";

export function CTACardsPublicBlock({
  block,
  primaryColor,
  headingColor,
  bodyTextColor,
  headingFontClassName,
}) {
  const cards = Array.isArray(block?.data?.cards) ? block.data.cards : [];

  const titleStyle = headingColor ? { color: headingColor } : undefined;
  const textStyle = bodyTextColor ? { color: bodyTextColor } : undefined;

  return (
    <section>
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const href = card?.linkHref || "#";
          const title = card?.title || "";
          const text = card?.text || "";
          const linkText = card?.linkText || "Learn more";
          const img = card?.imageUrl || null;

          return (
            <a
              key={idx}
              href={href}
              className="group rounded-3xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl transition-all"
            >
              <div className="relative h-44 bg-gray-100">
                {img && (
                  <img
                    src={img}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/0" />
              </div>
              <div className="p-6">
                <div
                  className={`font-black text-xl text-[#111418] ${
                    headingFontClassName || ""
                  }`}
                  style={titleStyle}
                >
                  {title}
                </div>
                {text && (
                  <div className="text-gray-600 mt-2" style={textStyle}>
                    {text}
                  </div>
                )}
                <div
                  className="inline-flex items-center gap-2 mt-5 font-bold"
                  style={{ color: primaryColor || "#0066FF" }}
                >
                  {linkText}
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
