import { Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
      <Plus className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p className="font-semibold italic">Start adding content blocks below</p>
    </div>
  );
}
