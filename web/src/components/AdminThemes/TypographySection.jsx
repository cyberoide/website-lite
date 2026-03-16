import { Type } from "lucide-react";

const FONT_OPTIONS = [
  { key: "inter", label: "Inter (clean default)" },
  { key: "crimson-text", label: "Crimson Text (classic / nautical)" },
  { key: "playfair-display", label: "Playfair Display (elegant)" },
  { key: "libre-baskerville", label: "Libre Baskerville (traditional)" },
  { key: "montserrat", label: "Montserrat (modern)" },
];

function getFontClass(key) {
  const k = typeof key === "string" ? key : "inter";
  if (k === "crimson-text") return "font-crimson-text";
  if (k === "playfair-display") return "font-playfair-display";
  if (k === "libre-baskerville") return "font-libre-baskerville";
  if (k === "montserrat") return "font-montserrat";
  return "font-inter";
}

export function TypographySection({
  localBodyFont,
  setLocalBodyFont,
  localHeadingFont,
  setLocalHeadingFont,
  localBodyTextColor,
  setLocalBodyTextColor,
  localHeadingTextColor,
  setLocalHeadingTextColor,
}) {
  const bodyFontClassName = getFontClass(localBodyFont);
  const headingFontClassName = getFontClass(localHeadingFont);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#111418] mb-1 flex items-center gap-2">
        <Type className="w-5 h-5" />
        Typography
      </h3>
      <div className="text-xs text-gray-400 mb-4">
        Choose your site fonts + default text colors.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Body font
          </label>
          <select
            value={localBodyFont}
            onChange={(e) => setLocalBodyFont(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
          <div
            className={`mt-2 p-3 rounded-xl border border-gray-100 bg-white ${bodyFontClassName}`}
          >
            <div className="text-xs font-bold text-gray-400 uppercase">
              Preview
            </div>
            <div className="mt-1 text-sm text-gray-700">
              The quick brown fox jumps over the lazy dog.
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Heading font
          </label>
          <select
            value={localHeadingFont}
            onChange={(e) => setLocalHeadingFont(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
          <div
            className={`mt-2 p-3 rounded-xl border border-gray-100 bg-white ${headingFontClassName}`}
          >
            <div className="text-xs font-bold text-gray-400 uppercase">
              Preview
            </div>
            <div className="mt-1 text-lg font-black text-[#111418]">
              Harbor Boating Club
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
            Body text color
          </label>
          <input
            type="color"
            value={localBodyTextColor}
            onChange={(e) => setLocalBodyTextColor(e.target.value)}
            className="w-full h-[44px] bg-transparent"
            aria-label="Body text color"
          />
          <input
            className="mt-3 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm"
            value={localBodyTextColor}
            onChange={(e) => setLocalBodyTextColor(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
            Heading text color
          </label>
          <input
            type="color"
            value={localHeadingTextColor}
            onChange={(e) => setLocalHeadingTextColor(e.target.value)}
            className="w-full h-[44px] bg-transparent"
            aria-label="Heading text color"
          />
          <input
            className="mt-3 w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm"
            value={localHeadingTextColor}
            onChange={(e) => setLocalHeadingTextColor(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Tip: we keep white text on dark sections (like dark testimonials) so it
        stays readable.
      </div>
    </div>
  );
}
