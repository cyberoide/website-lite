import { Layers, Search } from "lucide-react";
import { getBlockMeta } from "@/utils/blockHelpers";

export function BlockLibraryPanel({
  blockLibrary,
  blockSearch,
  setBlockSearch,
  addBlock,
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="font-extrabold text-[#111418] flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          Blocks
        </div>
        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-gray-100">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={blockSearch}
            onChange={(e) => setBlockSearch(e.target.value)}
            className="w-full outline-none text-sm"
            placeholder="Search blocks…"
          />
        </div>
      </div>

      <div className="p-3">
        {blockLibrary.map((group) => (
          <div key={group.group} className="mb-3">
            <div className="px-2 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              {group.group}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {group.items.map((it) => {
                const meta = getBlockMeta(it.type);
                const Icon = meta.Icon;
                return (
                  <button
                    key={it.type}
                    onClick={() => addBlock(it.type)}
                    className="w-full text-left px-4 py-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <div className="font-bold text-[#111418]">{it.label}</div>
                      <div className="text-xs text-gray-500">Add to page</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {blockLibrary.length === 0 && (
          <div className="px-3 py-10 text-center text-sm text-gray-400">
            No blocks found.
          </div>
        )}
      </div>
    </div>
  );
}
