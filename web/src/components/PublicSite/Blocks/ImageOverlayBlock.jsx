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

export function ImageOverlayBlock({ block }) {
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

  const headingColor =
    typeof block?.data?.headingColor === "string" &&
    block.data.headingColor.trim()
      ? block.data.headingColor
      : "#FFFFFF";

  const bodyTextColor =
    typeof block?.data?.bodyTextColor === "string" &&
    block.data.bodyTextColor.trim()
      ? block.data.bodyTextColor
      : "rgba(255,255,255,0.85)";

  return (
    <section className="rounded-[28px] overflow-hidden border border-gray-100 shadow-sm">
      <div className="relative min-h-[320px] flex items-end bg-gray-100">
        {block?.data?.imageUrl && (
          <img
            src={block.data.imageUrl}
            alt={block.data.title || "Section"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: overlayBackground }}
        />

        <div className="relative z-10 w-full px-6 py-10 md:px-12 md:py-14">
          <h3
            className="text-3xl md:text-5xl font-black"
            style={{ color: headingColor }}
          >
            {block?.data?.title || ""}
          </h3>
          {block?.data?.text && (
            <p
              className="mt-3 text-lg max-w-2xl"
              style={{ color: bodyTextColor }}
            >
              {block.data.text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
