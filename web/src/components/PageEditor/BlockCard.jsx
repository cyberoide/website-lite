import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { getBlockMeta, getBlockTitle } from "@/utils/blockHelpers";
import { BlockRenderer } from "@/components/PageEditor/BlockRenderer";

export function BlockCard({
  block,
  index,
  collapsed,
  containerRefs,
  onToggleCollapse,
  safeMoveBlock,
  safeRemoveBlock,
  safeUpdateBlockData,
  uploadAndSet,
  openMediaPicker,
  upload,
  uploading,
  canEdit,
}) {
  const meta = getBlockMeta(block.type);
  const Icon = meta.Icon;
  const title = getBlockTitle(block);
  const isCollapsed = !!collapsed?.[block.id];

  return (
    <div
      ref={(el) => {
        containerRefs.current[block.id] = el;
      }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-700" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-[#111418] truncate">
              {title}
            </div>
            <div className="text-xs text-gray-400">{meta.label}</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleCollapse(block.id)}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-600"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => safeMoveBlock(index, "up")}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-600"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => safeMoveBlock(index, "down")}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-600"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => safeRemoveBlock(block.id)}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-600 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5">
          <BlockRenderer
            block={block}
            onUpdate={(newData) => safeUpdateBlockData(block.id, newData)}
            onUpload={(file, field) => uploadAndSet(file, block.id, field)}
            onChooseMedia={openMediaPicker}
            upload={upload}
            uploading={uploading}
            disabled={!canEdit}
          />
        </div>
      )}

      {isCollapsed && (
        <div className="p-5 text-sm text-gray-500">
          Collapsed. Expand to edit.
        </div>
      )}
    </div>
  );
}
