export function GalleryPublicBlock({ block, primaryColor }) {
  const heading = block?.data?.heading || "Gallery";
  const images = Array.isArray(block?.data?.images) ? block.data.images : [];

  return (
    <section>
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-3xl md:text-5xl font-black font-crimson-text text-[#111418]">
            {heading}
          </div>
          <div
            className="mt-4 h-[3px] w-14 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
        {images
          .filter((img) => !!img?.url)
          .slice(0, 12)
          .map((img, idx) => (
            <div
              key={idx}
              className="rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm"
            >
              <img
                src={img.url}
                alt={img.caption || "Gallery"}
                className="w-full h-[170px] md:h-[220px] object-cover"
              />
            </div>
          ))}

        {images.filter((img) => !!img?.url).length === 0 && (
          <div className="col-span-2 md:col-span-3 text-gray-500">
            No photos yet.
          </div>
        )}
      </div>
    </section>
  );
}
