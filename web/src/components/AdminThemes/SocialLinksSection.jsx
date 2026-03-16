import { Share2 } from "lucide-react";

export function SocialLinksSection({
  localSocialBarPosition,
  setLocalSocialBarPosition,
  localSocialDisplayStyle,
  setLocalSocialDisplayStyle,
  localSocialLinks,
  setLocalSocialLinks,
  localSocialShowAddress,
  setLocalSocialShowAddress,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#111418] mb-1 flex items-center gap-2">
        <Share2 className="w-5 h-5" />
        Social links
      </h3>
      <div className="text-xs text-gray-400 mb-4">
        These show in the header and footer.
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Social bar position
          </label>
          <select
            value={localSocialBarPosition}
            onChange={(e) => setLocalSocialBarPosition(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold"
          >
            <option value="above">Above menu</option>
            <option value="below">Below menu</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Social display
          </label>
          <select
            value={localSocialDisplayStyle}
            onChange={(e) => setLocalSocialDisplayStyle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold"
          >
            <option value="names">Names</option>
            <option value="icons">Icons</option>
          </select>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={localSocialShowAddress}
            onChange={(e) => setLocalSocialShowAddress(e.target.checked)}
            className="mt-1"
          />
          <span className="min-w-0">
            <div className="text-sm font-bold text-[#111418]">
              Show address in the top bar
            </div>
            <div className="text-xs text-gray-500 mt-1">
              If you’ve entered an address, we can display it next to
              phone/email.
            </div>
          </span>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Facebook URL
          </label>
          <input
            value={localSocialLinks.facebook}
            onChange={(e) =>
              setLocalSocialLinks((s) => ({
                ...s,
                facebook: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm"
            placeholder="https://facebook.com/yourclub"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Instagram URL
          </label>
          <input
            value={localSocialLinks.instagram}
            onChange={(e) =>
              setLocalSocialLinks((s) => ({
                ...s,
                instagram: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm"
            placeholder="https://instagram.com/yourclub"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            X (Twitter) URL
          </label>
          <input
            value={localSocialLinks.x}
            onChange={(e) =>
              setLocalSocialLinks((s) => ({ ...s, x: e.target.value }))
            }
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm"
            placeholder="https://x.com/yourclub"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            YouTube URL
          </label>
          <input
            value={localSocialLinks.youtube}
            onChange={(e) =>
              setLocalSocialLinks((s) => ({
                ...s,
                youtube: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm"
            placeholder="https://youtube.com/@yourclub"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            LinkedIn URL
          </label>
          <input
            value={localSocialLinks.linkedin}
            onChange={(e) =>
              setLocalSocialLinks((s) => ({
                ...s,
                linkedin: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm"
            placeholder="https://linkedin.com/company/yourclub"
          />
        </div>
      </div>
    </div>
  );
}
