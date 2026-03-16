import { FullBleed } from "./FullBleed";

export function SectionHeaderPublicBlock({
  block,
  primaryColor,
  headingColor,
  bodyTextColor,
  headingFontClassName,
}) {
  const align = block?.data?.align === "left" ? "left" : "center";
  const background = block?.data?.background || "none";
  const eyebrow = block?.data?.eyebrow || "";
  const heading = block?.data?.heading || "";
  const subheading = block?.data?.subheading || "";

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

  const customBackgroundColor =
    typeof block?.data?.backgroundColor === "string" &&
    block.data.backgroundColor.trim()
      ? block.data.backgroundColor
      : "";

  const effectiveHeadingColor = overrideHeadingColor || headingColor;
  const effectiveBodyTextColor = overrideBodyTextColor || bodyTextColor;

  const eyebrowStyle = effectiveBodyTextColor
    ? { color: effectiveBodyTextColor }
    : undefined;
  const headingStyle = effectiveHeadingColor
    ? { color: effectiveHeadingColor }
    : undefined;
  const subheadingStyle = effectiveBodyTextColor
    ? { color: effectiveBodyTextColor }
    : undefined;

  const content = (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <div
          className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400"
          style={eyebrowStyle}
        >
          {eyebrow}
        </div>
      )}
      {heading && (
        <div
          className={`mt-3 text-3xl md:text-5xl font-black text-[#111418] ${
            headingFontClassName || "font-crimson-text"
          }`}
          style={headingStyle}
        >
          {heading}
        </div>
      )}
      {subheading && (
        <div
          className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"
          style={subheadingStyle}
        >
          {subheading}
        </div>
      )}
      <div className="mt-7 flex items-center justify-center">
        <div
          className="h-[3px] w-14 rounded-full"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
    </div>
  );

  if (background === "light") {
    return (
      <FullBleed className="bg-gray-50 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">{content}</div>
      </FullBleed>
    );
  }

  if (background === "dark") {
    const darkHeading = effectiveHeadingColor || "#FFFFFF";
    const darkBody = effectiveBodyTextColor || "rgba(255,255,255,0.75)";

    return (
      <FullBleed className="bg-[#111418] py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className={align === "center" ? "text-center" : "text-left"}>
            {eyebrow && (
              <div
                className="text-xs font-bold uppercase tracking-[0.25em] text-white/60"
                style={{ color: darkBody }}
              >
                {eyebrow}
              </div>
            )}
            {heading && (
              <div
                className={`mt-3 text-3xl md:text-5xl font-black text-white ${
                  headingFontClassName || "font-crimson-text"
                }`}
                style={{ color: darkHeading }}
              >
                {heading}
              </div>
            )}
            {subheading && (
              <div
                className="mt-4 text-lg text-white/75 max-w-3xl mx-auto"
                style={{ color: darkBody }}
              >
                {subheading}
              </div>
            )}
            <div className="mt-7 flex items-center justify-center">
              <div
                className="h-[3px] w-14 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>
        </div>
      </FullBleed>
    );
  }

  if (background === "custom" && customBackgroundColor) {
    return (
      <FullBleed
        className="py-14 md:py-20"
        style={{ backgroundColor: customBackgroundColor }}
      >
        <div className="max-w-6xl mx-auto px-6">{content}</div>
      </FullBleed>
    );
  }

  return <section>{content}</section>;
}
