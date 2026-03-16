export function ImageBlock({ block }) {
  if (!block.data.url) return null;

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl">
      <img
        src={block.data.url}
        alt={block.data.caption}
        className="w-full h-auto"
        loading="lazy"
        decoding="async"
      />
      {block.data.caption && (
        <p className="p-4 text-center text-gray-500 italic">
          {block.data.caption}
        </p>
      )}
    </div>
  );
}
