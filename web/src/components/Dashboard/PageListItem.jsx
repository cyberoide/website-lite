import {
  GripVertical,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronUp,
  ChevronDown,
  Home,
} from "lucide-react";

export function PageListItem({
  sectionKey,
  pageRow,
  idx,
  isHome,
  isDragOver,
  setDragOver,
  onDropOnRow,
  onSetHome,
  onMoveRelative,
  onTogglePageEnabled,
  onDeletePage,
  readOnly = false,
}) {
  const isHiddenSection = sectionKey === "hidden";
  const canDrag = !isHiddenSection && !readOnly;

  const rowClassName =
    "p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors" +
    (isDragOver ? " bg-blue-50/40" : "");

  const onRowDragOver = (e) => {
    if (isHiddenSection) return;
    if (readOnly) return;
    e.preventDefault();
    setDragOver({ sectionKey, pageId: pageRow.id });
  };

  const onDragStart = (e) => {
    if (!canDrag) return;
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ pageId: pageRow.id, fromSection: sectionKey }),
      );
      e.dataTransfer.setData("text/plain", String(pageRow.id));
    } catch (err) {
      // ignore
    }
  };

  const onDragEnd = () => {
    setDragOver(null);
  };

  const disabledIconClass = "opacity-50 cursor-not-allowed";

  return (
    <div
      className={rowClassName}
      onDragOver={onRowDragOver}
      onDrop={(e) =>
        isHiddenSection || readOnly
          ? null
          : onDropOnRow(e, sectionKey, pageRow.id)
      }
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Drag handle */}
        <div
          className={
            canDrag
              ? "text-gray-300 cursor-grab active:cursor-grabbing"
              : "text-gray-200 cursor-not-allowed"
          }
          draggable={canDrag}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          title={
            readOnly
              ? "Read-only access"
              : canDrag
                ? "Drag to move"
                : "Hidden pages can’t be dragged"
          }
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="font-semibold text-[#111418] flex items-center gap-2 min-w-0">
            <span className="truncate">{pageRow.title}</span>
            {isHome && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-bold uppercase tracking-wider">
                Home
              </span>
            )}
            {sectionKey === "pages" && pageRow.is_enabled && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                Not in menu
              </span>
            )}
            {!pageRow.is_enabled && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                Hidden
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider truncate">
            /{pageRow.slug}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => (readOnly ? null : onSetHome(pageRow.id))}
          disabled={readOnly}
          className={`p-2 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            isHome
              ? "bg-blue-50 text-blue-700"
              : "text-gray-400 hover:text-[#0066FF] hover:bg-blue-50"
          }`}
          title={readOnly ? "Read-only access" : "Set as Home"}
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          onClick={() => onMoveRelative(sectionKey, pageRow.id, "up")}
          disabled={readOnly}
          className={
            "p-2 rounded-xl text-gray-400 hover:text-[#111418] hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          }
          title={readOnly ? "Read-only access" : "Move up"}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => onMoveRelative(sectionKey, pageRow.id, "down")}
          disabled={readOnly}
          className={
            "p-2 rounded-xl text-gray-400 hover:text-[#111418] hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          }
          title={readOnly ? "Read-only access" : "Move down"}
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <button
          onClick={() => (readOnly ? null : onTogglePageEnabled(pageRow))}
          disabled={readOnly}
          className={`p-2 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            pageRow.is_enabled
              ? "text-green-700 bg-green-50 hover:bg-green-100"
              : "text-gray-600 bg-gray-100 hover:bg-gray-200"
          }`}
          title={
            readOnly ? "Read-only access" : pageRow.is_enabled ? "Hide" : "Show"
          }
        >
          {pageRow.is_enabled ? (
            <ToggleRight className="w-5 h-5" />
          ) : (
            <ToggleLeft className="w-5 h-5" />
          )}
        </button>

        <a
          href={`/admin/editor/${pageRow.id}`}
          className={
            "p-2 text-gray-400 hover:text-[#0066FF] hover:bg-blue-50 rounded-xl transition-all" +
            (readOnly ? " " + disabledIconClass : "")
          }
          title={readOnly ? "View (read-only)" : "Edit"}
        >
          <Edit2 className="w-5 h-5" />
        </a>

        <button
          onClick={() => onDeletePage(pageRow.id)}
          disabled={readOnly}
          className={
            "p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          }
          title={readOnly ? "Read-only access" : "Delete"}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
