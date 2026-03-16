import { FullBleed } from "./FullBleed";

export function SplitPublicBlock({
  block,
  primaryColor,
  headingColor,
  bodyTextColor,
  headingFontClassName,
}) {
  const imageUrl = block?.data?.imageUrl || "";
  const imageSide = block?.data?.imageSide === "right" ? "right" : "left";
  const background = block?.data?.background || "none";

  const customBackgroundColor =
    typeof block?.data?.backgroundColor === "string" &&
    block.data.backgroundColor.trim()
      ? block.data.backgroundColor
      : "";

  const overrideHeadingColor =
    typeof block?.data?.overrideHeadingColor === "string" &&
    block.data.overrideHeadingColor.trim()
      ? block.data.overrideHeadingColor
      : "";

  const overrideBodyTextColor =
    typeof block?.data?.overrideBodyTextColor === "string" &&
    block.data.overrideBodyTextColor.trim()
      ? block.data.overrideBodyTextColor
      : "";

  const eyebrow = block?.data?.eyebrow || "";
  const heading = block?.data?.heading || "";
  const text = block?.data?.text || "";
  const ctaText = block?.data?.ctaText || "";
  const ctaLink = block?.data?.ctaLink || "#";

  const effectiveHeadingColor = overrideHeadingColor || headingColor;
  const effectiveBodyTextColor = overrideBodyTextColor || bodyTextColor;

  const eyebrowStyle = effectiveBodyTextColor
    ? { color: effectiveBodyTextColor }
    : undefined;
  const headingStyle = effectiveHeadingColor
    ? { color: effectiveHeadingColor }
    : undefined;
  const bodyStyle = effectiveBodyTextColor
    ? { color: effectiveBodyTextColor }
    : undefined;

  const inner = (
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div className={imageSide === "right" ? "md:order-2" : ""}>
        <div className="rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={heading || "Section"}
              className="w-full h-[260px] md:h-[360px] object-cover"
            />
          ) : (
            <div className="w-full h-[260px] md:h-[360px] flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
      </div>

      <div className={imageSide === "right" ? "md:order-1" : ""}>
        {eyebrow && (
          <div
            className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400"
            style={eyebrowStyle}
          >
            {eyebrow}
          </div>
        )}
        <div
          className={`mt-3 text-3xl md:text-4xl font-black text-[#111418] ${
            headingFontClassName || "font-crimson-text"
          }`}
          style={headingStyle}
        >
          {heading}
        </div>
        {text && (
          <div
            className="mt-4 text-gray-600 leading-relaxed whitespace-pre-wrap"
            style={bodyStyle}
          >
            {text}
          </div>
        )}
        {ctaText && (
          <div className="mt-7">
            <a
              href={ctaLink}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white shadow-lg"
              style={{ backgroundColor: primaryColor || "#0066FF" }}
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (background === "light") {
    return (
      <FullBleed className="bg-gray-50 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">{inner}</div>
      </FullBleed>
    );
  }

  if (background === "custom" && customBackgroundColor) {
    return (
      <FullBleed
        className="py-14 md:py-20"
        style={{ backgroundColor: customBackgroundColor }}
      >
        <div className="max-w-6xl mx-auto px-6">{inner}</div>
      </FullBleed>
    );
  }

  return <section>{inner}</section>;
}
