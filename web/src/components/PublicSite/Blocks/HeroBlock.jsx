function hexToRgb(hex) {
  if (typeof hex !== "string") return null;
  const h = hex.trim().replace("#", "");
  if (h.length !== 6) return null;
  const num = Number.parseInt(h, 16);
  if (!Number.isFinite(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function HeroBlock({ block, primaryColor, headingFontClassName }) {
  const overlayOpacity =
    typeof block?.data?.overlayOpacity === "number"
      ? block.data.overlayOpacity
      : 0.55;

  const overlayColor =
    typeof block?.data?.overlayColor === "string" &&
    block.data.overlayColor.trim()
      ? block.data.overlayColor
      : "#000000";

  const overlayRgb = hexToRgb(overlayColor);
  const overlayBackground = overlayRgb
    ? `rgba(${overlayRgb.r},${overlayRgb.g},${overlayRgb.b},${overlayOpacity})`
    : `rgba(0,0,0,${overlayOpacity})`;

  const fallbackBackgroundColor =
    typeof block?.data?.fallbackBackgroundColor === "string" &&
    block.data.fallbackBackgroundColor.trim()
      ? block.data.fallbackBackgroundColor
      : "#0b1220";

  const headingColor =
    typeof block?.data?.headingColor === "string" &&
    block.data.headingColor.trim()
      ? block.data.headingColor
      : "#FFFFFF";

  const subheadingColor =
    typeof block?.data?.subheadingColor === "string" &&
    block.data.subheadingColor.trim()
      ? block.data.subheadingColor
      : "rgba(255,255,255,0.85)";

  const align = block?.data?.align === "center" ? "center" : "left";
  const textAlignClass = align === "center" ? "text-center" : "text-left";

  return (
    <section
      className="w-full"
      style={{ backgroundColor: fallbackBackgroundColor }}
    >
      <div className="relative min-h-[420px] md:min-h-[520px] flex items-end">
        {block?.data?.backgroundUrl && (
          <img
            src={block.data.backgroundUrl}
            alt={block.data.heading || "Hero"}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        )}

        <div
          className="absolute inset-0"
          style={{ background: overlayBackground }}
        />

        <div className="relative z-10 w-full">
          <div
            className={`max-w-7xl mx-auto px-6 py-14 md:px-10 md:py-20 ${textAlignClass}`}
          >
            <h2
              className={`text-4xl md:text-6xl font-black leading-tight ${headingFontClassName || ""}`}
              style={{ color: headingColor }}
            >
              {block?.data?.heading || "Headline"}
            </h2>

            {block?.data?.subheading && (
              <p
                className={
                  "mt-5 text-lg md:text-xl " +
                  (align === "center" ? "max-w-3xl mx-auto" : "max-w-3xl")
                }
                style={{ color: subheadingColor }}
              >
                {block.data.subheading}
              </p>
            )}

            {block?.data?.ctaText && (
              <div className="mt-10">
                <a
                  href={block?.data?.ctaLink || "#"}
                  className="inline-flex items-center justify-center px-7 py-3 rounded-full font-bold text-white shadow-xl"
                  style={{ backgroundColor: primaryColor || "#0066FF" }}
                >
                  {block.data.ctaText}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
