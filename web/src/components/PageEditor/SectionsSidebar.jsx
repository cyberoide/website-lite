import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { getBlockMeta, getBlockTitle } from "@/utils/blockHelpers";

export function SectionsSidebar({
  blocks,
  containerRefs,
  dragOverBlockId,
  onBlockDragOver,
  onBlockDrop,
  onBlockDragStart,
  onBlockDragEnd,
  safeMoveBlock,
}) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-[92px]">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="font-extrabold text-[#111418] flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              Sections
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Click a section to jump.
            </div>
          </div>

          <div className="p-3 space-y-1">
            {blocks.map((block, idx) => {
              const meta = getBlockMeta(block.type);
              const Icon = meta.Icon;
              const title = getBlockTitle(block);

              const isDragOver =
                dragOverBlockId && String(dragOverBlockId) === String(block.id);

              const rowClassName =
                "flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-gray-50" +
                (isDragOver ? " bg-blue-50/40" : "");

              return (
                <div
                  key={block.id}
                  className={rowClassName}
                  onDragOver={(e) => onBlockDragOver(e, block.id)}
                  onDrop={(e) => onBlockDrop(e, block.id)}
                >
                  {/* Drag handle */}
                  <div
                    className="text-gray-300 cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => onBlockDragStart(e, block.id)}
                    onDragEnd={onBlockDragEnd}
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <button
                    onClick={() => {
                      const el = containerRefs.current?.[block.id];
                      if (el && typeof el.scrollIntoView === "function") {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                    className="flex items-center gap-2 min-w-0 flex-1"
                    title={title}
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#111418] truncate">
                        {title}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {meta.label}
                      </div>
                    </div>
                  </button>

                  {/* Keep up/down buttons as a fallback */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => safeMoveBlock(idx, "up")}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => safeMoveBlock(idx, "down")}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {blocks.length === 0 && (
              <div className="px-3 py-10 text-center text-sm text-gray-400">
                Add a block to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
