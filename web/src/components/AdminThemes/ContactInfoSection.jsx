import { Phone, Mail, MapPin } from "lucide-react";

export function ContactInfoSection({
  localPhone,
  setLocalPhone,
  localEmail,
  setLocalEmail,
  localAddress,
  setLocalAddress,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#111418] mb-1">Footer & contact info</h3>
      <div className="text-sm text-gray-500">
        These appear on the site header/footer.
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Phone
          </label>
          <input
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm"
            placeholder="(555) 555-5555"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email
          </label>
          <input
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm"
            placeholder="info@yourclub.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Address
          </label>
          <textarea
            value={localAddress}
            onChange={(e) => setLocalAddress(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm min-h-[84px]"
            placeholder="123 Marina Way&#10;City, ST 00000"
          />
        </div>
      </div>
    </div>
  );
}
