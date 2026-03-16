import { Palette } from "lucide-react";

export function ThemeSettingsPanel({ website }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#111418] mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5" />
        Themes
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">
              Source
            </div>
            <div className="text-sm font-semibold text-gray-700 capitalize">
              {website?.branding_source || "custom"}
            </div>
          </div>
          {website?.logo_url && (
            <img
              src={website.logo_url}
              alt="Site logo"
              className="w-10 h-10 rounded-xl object-cover border border-gray-100"
            />
          )}
        </div>

        <a
          href="/admin/themes"
          className="block text-center py-2 text-[#0066FF] bg-blue-50 rounded-xl font-semibold hover:bg-blue-100 transition-all"
        >
          Open Themes
        </a>

        <div className="text-xs text-gray-400">
          Choose a template, set colors, social links, and footer/contact info.
        </div>
      </div>
    </div>
  );
}
