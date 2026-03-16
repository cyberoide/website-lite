import { ArrowUpRight } from "lucide-react";

export function LinksPublicBlock({
  block,
  primaryColor,
  headingColor,
  bodyTextColor,
  headingFontClassName,
}) {
  const title = block?.data?.title || "Links";
  const links = Array.isArray(block?.data?.links) ? block.data.links : [];

  const titleStyle = headingColor ? { color: headingColor } : undefined;
  const bodyStyle = bodyTextColor ? { color: bodyTextColor } : undefined;

  return (
    <section className="rounded-3xl border border-gray-100 bg-gray-50 p-6 md:p-8">
      <div
        className={`font-black text-2xl text-[#111418] ${
          headingFontClassName || ""
        }`}
        style={titleStyle}
      >
        {title}
      </div>
      <div className="mt-5 grid md:grid-cols-2 gap-3">
        {links.map((l, idx) => {
          const label = l?.label || "Link";
          const url = l?.url || "#";
          const note = l?.note || "";

          return (
            <a
              key={idx}
              href={url}
              className="group rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold text-[#111418]" style={titleStyle}>
                  {label}
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
              </div>
              {note && (
                <div className="text-sm text-gray-500 mt-1" style={bodyStyle}>
                  {note}
                </div>
              )}
              <div className="text-xs mt-2 font-mono text-gray-400 truncate">
                {url}
              </div>
              <div
                className="text-sm font-semibold mt-3"
                style={{ color: primaryColor || "#0066FF" }}
              >
                Open
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
