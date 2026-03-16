import React from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { FullBleed } from "./FullBleed";

export function TestimonialsPublicBlock({
  block,
  primaryColor,
  headingColor,
  bodyTextColor,
  headingFontClassName,
}) {
  const heading = block?.data?.heading || "Testimonials";
  const bg = block?.data?.background || "dark";
  const list = Array.isArray(block?.data?.testimonials)
    ? block.data.testimonials
    : [];

  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    setActive(0);
  }, [block?.id]);

  const safeActive = Math.max(
    0,
    Math.min(active, Math.max(0, list.length - 1)),
  );
  const t = list[safeActive] || null;

  const next = () => {
    if (list.length <= 1) return;
    setActive((v) => (v + 1) % list.length);
  };

  const prev = () => {
    if (list.length <= 1) return;
    setActive((v) => (v - 1 + list.length) % list.length);
  };

  const headingStyle =
    bg === "dark"
      ? undefined
      : headingColor
        ? { color: headingColor }
        : undefined;
  const subtitleStyle =
    bg === "dark"
      ? undefined
      : bodyTextColor
        ? { color: bodyTextColor }
        : undefined;

  const content = (
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div
            className={`text-3xl md:text-5xl font-black ${
              headingFontClassName || "font-crimson-text"
            } ${bg === "dark" ? "text-white" : "text-[#111418]"}`}
            style={headingStyle}
          >
            {heading}
          </div>
          <div
            className={`mt-3 ${bg === "dark" ? "text-white/70" : "text-gray-600"}`}
            style={subtitleStyle}
          >
            Real words from real members.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className={`p-3 rounded-full border transition-all ${
              bg === "dark"
                ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                : "border-gray-200 bg-white hover:bg-gray-50 text-[#111418]"
            }`}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className={`p-3 rounded-full border transition-all ${
              bg === "dark"
                ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                : "border-gray-200 bg-white hover:bg-gray-50 text-[#111418]"
            }`}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className={`mt-10 rounded-[28px] p-8 md:p-12 border ${
          bg === "dark"
            ? "bg-white/5 border-white/10"
            : "bg-white border-gray-100 shadow-sm"
        }`}
      >
        {t ? (
          <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  bg === "dark" ? "bg-white/10" : "bg-blue-50"
                }`}
              >
                <Quote
                  className={`w-6 h-6 ${bg === "dark" ? "text-white" : "text-[#0066FF]"}`}
                  style={bg === "dark" ? undefined : { color: primaryColor }}
                />
              </div>
              {t.imageUrl ? (
                <img
                  src={t.imageUrl}
                  alt={t.name || ""}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : null}
            </div>

            <div>
              <div
                className={`text-xl md:text-2xl leading-relaxed ${
                  bg === "dark" ? "text-white" : "text-[#111418]"
                }`}
                style={bg === "dark" ? undefined : subtitleStyle}
              >
                "{t.quote || ""}"
              </div>
              <div
                className={`mt-6 font-semibold ${
                  bg === "dark" ? "text-white/85" : "text-gray-700"
                }`}
                style={bg === "dark" ? undefined : subtitleStyle}
              >
                {t.name || ""}
                {t.title ? (
                  <span
                    className={
                      bg === "dark" ? "text-white/55" : "text-gray-500"
                    }
                    style={bg === "dark" ? undefined : subtitleStyle}
                  >
                    {" "}
                    • {t.title}
                  </span>
                ) : null}
              </div>

              {list.length > 1 && (
                <div className="mt-6 flex items-center gap-2">
                  {list.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActive(idx)}
                      className="w-2.5 h-2.5 rounded-full transition-all"
                      style={{
                        backgroundColor:
                          idx === safeActive
                            ? primaryColor
                            : bg === "dark"
                              ? "rgba(255,255,255,0.22)"
                              : "rgba(17,20,24,0.18)",
                      }}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={bg === "dark" ? "text-white/70" : "text-gray-500"}>
            No testimonials yet.
          </div>
        )}
      </div>
    </div>
  );

  if (bg === "light") {
    return (
      <FullBleed className="bg-gray-50 py-16 md:py-20">{content}</FullBleed>
    );
  }

  return (
    <FullBleed className="bg-[#0b1220] py-16 md:py-20">{content}</FullBleed>
  );
}
