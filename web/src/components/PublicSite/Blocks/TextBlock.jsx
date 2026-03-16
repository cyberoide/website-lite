export function TextBlock({ block, bodyTextColor }) {
  const overrideTextColor =
    typeof block?.data?.textColor === "string" && block.data.textColor.trim()
      ? block.data.textColor
      : "";

  const overrideBackgroundColor =
    typeof block?.data?.backgroundColor === "string" &&
    block.data.backgroundColor.trim()
      ? block.data.backgroundColor
      : "";

  const effectiveTextColor = overrideTextColor || bodyTextColor;

  const bodyStyle = effectiveTextColor
    ? { color: effectiveTextColor }
    : undefined;

  const wrapperStyle = overrideBackgroundColor
    ? { backgroundColor: overrideBackgroundColor }
    : undefined;

  const wrapperClassName = overrideBackgroundColor
    ? "rounded-[22px] border border-gray-100 p-6 md:p-8"
    : "";

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <div className="prose prose-lg max-w-none">
        <p
          className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap"
          style={bodyStyle}
        >
          {block.data.content}
        </p>
      </div>
    </div>
  );
}
