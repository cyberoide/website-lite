import { Box } from "lucide-react";

export function EmbedBlock({ data, onUpdate }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <Box className="w-6 h-6 text-[#0066FF]" />
        </div>
        <div>
          <div className="font-bold text-blue-900">ClubSoft Embed</div>
          <div className="text-sm text-blue-700 capitalize">
            {data.embedType.replace("-", " ")}
          </div>
        </div>
      </div>

      <select
        className="bg-white border-none rounded-lg text-sm font-semibold text-blue-900 focus:ring-blue-200"
        value={data.embedType}
        onChange={(e) => onUpdate({ embedType: e.target.value })}
      >
        <option value="login">Login Widget</option>
        <option value="membership">Membership Form</option>
        <option value="calendar">Event Calendar</option>
        <option value="contact">Contact Form</option>
        <option value="leadership">Leadership Details</option>
      </select>
    </div>
  );
}
