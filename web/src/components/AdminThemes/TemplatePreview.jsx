export function TemplatePreview({ templatePreviewSrc }) {
  if (!templatePreviewSrc) return null;

  return (
    <div className="hidden lg:block fixed z-50 right-[40px] top-[120px] w-[520px] h-[340px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-none">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Theme preview
        </div>
      </div>
      <div className="w-full h-full overflow-hidden bg-white">
        <iframe
          title="Theme preview"
          src={templatePreviewSrc}
          className="border-0"
          style={{
            width: 1400,
            height: 900,
            transform: "scale(0.36)",
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}
