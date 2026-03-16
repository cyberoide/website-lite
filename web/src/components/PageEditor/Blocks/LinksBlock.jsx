import { Link as LinkIcon, Plus } from "lucide-react";

export function LinksBlock({ data, onUpdate }) {
  const handleLinkUpdate = (idx, field, value) => {
    const nextLinks = [...(data.links || [])];
    nextLinks[idx] = { ...nextLinks[idx], [field]: value };
    onUpdate({ links: nextLinks });
  };

  const handleRemoveLink = (idx) => {
    const nextLinks = [...(data.links || [])];
    nextLinks.splice(idx, 1);
    onUpdate({ links: nextLinks });
  };

  const handleAddLink = () => {
    const nextLinks = [...(data.links || [])];
    nextLinks.push({ label: "Link", url: "#", note: "" });
    onUpdate({ links: nextLinks });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <LinkIcon className="w-4 h-4" />
        Link List
      </div>

      <input
        className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
        value={data.title || ""}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Section title"
      />

      <div className="space-y-3">
        {(data.links || []).map((l, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-gray-50 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#111418]">Link {idx + 1}</div>
              <button
                onClick={() => handleRemoveLink(idx)}
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <input
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
                value={l.label || ""}
                onChange={(e) => handleLinkUpdate(idx, "label", e.target.value)}
                placeholder="Label"
              />
              <input
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
                value={l.url || ""}
                onChange={(e) => handleLinkUpdate(idx, "url", e.target.value)}
                placeholder="URL"
              />
            </div>

            <input
              className="mt-3 w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
              value={l.note || ""}
              onChange={(e) => handleLinkUpdate(idx, "note", e.target.value)}
              placeholder="Note (optional)"
            />
          </div>
        ))}

        <button
          onClick={handleAddLink}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>
    </div>
  );
}
