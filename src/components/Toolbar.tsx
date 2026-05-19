import { Plus, StickyNote } from 'lucide-react';

interface ToolbarProps {
  count: number;
  onAdd: () => void;
}

export function Toolbar({ count, onAdd }: ToolbarProps) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-[#f5f2ea]/70 border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={18} className="text-black/70" />
          <h1 className="font-semibold tracking-tight text-black/85">
            Sticky Notes
          </h1>
          <span className="text-xs text-black/50 ml-1">
            {count} {count === 1 ? 'note' : 'notes'}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 text-white text-sm font-medium hover:bg-black transition-colors"
        >
          <Plus size={16} />
          New note
        </button>
      </div>
    </header>
  );
}
