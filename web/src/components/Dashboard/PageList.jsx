import React from "react";
import { Layout, Plus, Menu, FileText, EyeOff } from "lucide-react";
import { PageListItem } from "./PageListItem";

function readDragPayload(e) {
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.pageId) return parsed;
    }
  } catch (err) {
    // ignore
  }

  const fallback = e.dataTransfer.getData("text/plain");
  if (fallback) {
    return { pageId: fallback, fromSection: "" };
  }

  return null;
}

export function PageList({
  navigationPages,
  pages,
  hiddenPages,
  onAddPage,
  onSetHome,
  onMoveWithinSection,
  onMoveToSection,
  onTogglePageEnabled,
  deletePageMutation,
  readOnly = false,
}) {
  const [dragOver, setDragOver] = React.useState(null);

  const onDeletePage = (pageId) => {
    if (readOnly) return;
    if (typeof window === "undefined") return;
    const ok = window.confirm("Delete this page?");
    if (!ok) return;
    deletePageMutation.mutate(pageId);
  };

  const moveRelative = (sectionKey, pageId, direction) => {
    if (readOnly) return;
    const list = sectionKey === "nav" ? navigationPages : pages;
    const idx = (list || []).findIndex((p) => String(p.id) === String(pageId));
    if (idx < 0) return;

    const nextIdx = direction === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= list.length) return;

    onMoveWithinSection(sectionKey, pageId, list[nextIdx].id);
  };

  const onDropOnRow = (e, sectionKey, targetPageId) => {
    if (readOnly) return;
    e.preventDefault();
    const payload = readDragPayload(e);
    if (!payload?.pageId) {
      setDragOver(null);
      return;
    }

    const draggedId = payload.pageId;
    const fromSection = payload.fromSection;

    if (fromSection === sectionKey) {
      onMoveWithinSection(sectionKey, draggedId, targetPageId);
    } else {
      onMoveToSection(draggedId, sectionKey, targetPageId);
    }

    setDragOver(null);
  };

  const onDropOnSection = (e, sectionKey) => {
    if (readOnly) return;
    e.preventDefault();
    const payload = readDragPayload(e);
    if (!payload?.pageId) {
      setDragOver(null);
      return;
    }

    onMoveToSection(payload.pageId, sectionKey, null);
    setDragOver(null);
  };

  const sectionShellClass =
    "border border-gray-100 rounded-2xl bg-white overflow-hidden";

  const sectionHeaderClass =
    "px-5 py-4 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between";

  const listShellClass = "divide-y divide-gray-50";

  const emptyHintClass = "p-10 text-center text-gray-400";

  const renderSection = ({
    title,
    icon: Icon,
    sectionKey,
    list,
    subtitle,
    emptyHint,
    allowDrop,
  }) => {
    const effectiveAllowDrop = allowDrop && !readOnly;

    const overKey = dragOver?.sectionKey;
    const isSectionOver =
      effectiveAllowDrop && overKey === sectionKey && !dragOver?.pageId;

    const onDragOver = (e) => {
      if (!effectiveAllowDrop) return;
      e.preventDefault();
      setDragOver({ sectionKey, pageId: null });
    };

    return (
      <div className={sectionShellClass}>
        <div className={sectionHeaderClass}>
          <div className="min-w-0">
            <div className="font-extrabold text-[#111418] flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="truncate">{title}</span>
              <span className="text-xs text-gray-400 font-bold">
                {(Array.isArray(list) ? list.length : 0) || 0}
              </span>
            </div>
            {subtitle ? (
              <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
            ) : null}
          </div>
        </div>

        <div
          className={
            isSectionOver
              ? "outline outline-2 outline-blue-200 outline-offset-[-2px]"
              : ""
          }
          onDragOver={onDragOver}
          onDrop={(e) =>
            effectiveAllowDrop ? onDropOnSection(e, sectionKey) : null
          }
        >
          <div className={listShellClass}>
            {(list || []).map((pageRow, idx) => {
              const isHome = sectionKey === "nav" && idx === 0;
              const isDragOver =
                dragOver?.pageId &&
                String(dragOver.pageId) === String(pageRow.id);

              return (
                <PageListItem
                  key={pageRow.id}
                  sectionKey={sectionKey}
                  pageRow={pageRow}
                  idx={idx}
                  isHome={isHome}
                  isDragOver={isDragOver}
                  setDragOver={setDragOver}
                  onDropOnRow={onDropOnRow}
                  onSetHome={onSetHome}
                  onMoveRelative={moveRelative}
                  onTogglePageEnabled={onTogglePageEnabled}
                  onDeletePage={onDeletePage}
                  readOnly={readOnly}
                />
              );
            })}

            {(list || []).length === 0 && (
              <div className={emptyHintClass}>{emptyHint}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-[#111418] flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Pages
          </h2>
          <div className="text-xs text-gray-500 mt-1">
            Drag pages between Navigation and Pages. Hidden pages are not
            accessible.
          </div>
          {readOnly ? (
            <div className="text-xs text-amber-700 mt-2 font-semibold">
              Read-only: editing is disabled.
            </div>
          ) : null}
        </div>

        <button
          onClick={onAddPage}
          disabled={readOnly}
          className="text-sm font-semibold text-[#0066FF] hover:underline flex items-center gap-1 disabled:opacity-60 disabled:no-underline"
          title={readOnly ? "Read-only access" : ""}
        >
          <Plus className="w-4 h-4" />
          Add Page
        </button>
      </div>

      <div className="p-5 space-y-5 bg-gray-50/30">
        {renderSection({
          title: "Navigation",
          icon: Menu,
          sectionKey: "nav",
          list: navigationPages,
          subtitle: "These pages show in the site menu.",
          emptyHint:
            "No navigation pages yet. Drag a page here to add it to the menu.",
          allowDrop: true,
        })}

        {renderSection({
          title: "Pages",
          icon: FileText,
          sectionKey: "pages",
          list: pages,
          subtitle:
            "Editable pages that don’t show in the menu (great for Join Us / Member Login).",
          emptyHint:
            "No extra pages yet. Add a page, then drag it into Navigation if you want it in the menu.",
          allowDrop: true,
        })}

        {renderSection({
          title: "Hidden",
          icon: EyeOff,
          sectionKey: "hidden",
          list: hiddenPages,
          subtitle:
            "Hidden pages don’t appear in the menu and can’t be visited.",
          emptyHint: "No hidden pages.",
          allowDrop: false,
        })}
      </div>
    </div>
  );
}
