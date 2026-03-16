import { BlockCard } from "./BlockCard";

export function BlockCanvas({
  blocks,
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
  return (
    <div className="min-w-0">
      <div className="space-y-5">
        {blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            index={index}
            collapsed={collapsed}
            containerRefs={containerRefs}
            onToggleCollapse={onToggleCollapse}
            safeMoveBlock={safeMoveBlock}
            safeRemoveBlock={safeRemoveBlock}
            safeUpdateBlockData={safeUpdateBlockData}
            uploadAndSet={uploadAndSet}
            openMediaPicker={openMediaPicker}
            upload={upload}
            uploading={uploading}
            canEdit={canEdit}
          />
        ))}

        {blocks.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-xl font-extrabold text-[#111418]">
              Start building your page
            </div>
            <div className="text-gray-500 mt-2">
              Add a Hero, sections, and embeds from the right.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
