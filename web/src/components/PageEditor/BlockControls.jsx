import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";

export function BlockControls({ onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onMoveUp}
        className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm hover:text-[#0066FF]"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        onClick={onRemove}
        className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm hover:text-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button
        onClick={onMoveDown}
        className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm hover:text-[#0066FF]"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
