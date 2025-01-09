import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isActive?: boolean;
}

export const TodoItem = ({
  id,
  text,
  completed,
  onComplete,
  onDelete,
  isActive = false,
}: TodoItemProps) => {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-4 py-2 rounded-lg animate-task-appear",
        completed && "opacity-50",
        isActive && "bg-overlay-accent/20 border border-overlay-accent"
      )}
    >
      <button
        onClick={() => onComplete(id)}
        className={cn(
          "w-5 h-5 rounded-full border border-overlay-accent flex items-center justify-center",
          completed && "bg-overlay-accent"
        )}
      >
        {completed && <Check size={12} className="text-white" />}
      </button>
      <span className={cn("flex-1 text-overlay-text", completed && "line-through")}>
        {text}
      </span>
      <button
        onClick={() => onDelete(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-overlay-text hover:text-red-400"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};