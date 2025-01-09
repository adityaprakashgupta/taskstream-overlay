import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { TodoItem } from "./TodoItem";
import { toast } from "sonner";
import { initializeTodoistApi, getTodoistTasks, addTodoistTask, completeTodoistTask, deleteTodoistTask } from "../services/todoistService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [apiToken, setApiToken] = useState(localStorage.getItem("todoistToken") || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (apiToken) {
      initializeTodoistApi(apiToken);
      localStorage.setItem("todoistToken", apiToken);
    }
  }, [apiToken]);

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: getTodoistTasks,
    enabled: !!apiToken,
    select: (data) => data.map((task) => ({
      id: task.id.toString(),
      text: task.content,
      completed: task.isCompleted || false,
    })),
  });

  const addMutation = useMutation({
    mutationFn: addTodoistTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast("Task added");
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeTodoistTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodoistTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast("Task deleted");
    },
  });

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    if (!apiToken) {
      toast.error("Please enter your Todoist API token first");
      return;
    }

    addMutation.mutate(newTodo);
    setNewTodo("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, todos.length - 1));
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  if (!apiToken) {
    return (
      <div className="w-96 bg-overlay-bg/85 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-semibold mb-4 text-overlay-text">Stream Tasks</h2>
        <input
          type="password"
          placeholder="Enter your Todoist API token"
          className="w-full bg-white/10 rounded-lg px-3 py-2 text-overlay-text placeholder:text-overlay-text/50 focus:outline-none focus:ring-2 focus:ring-overlay-accent mb-2"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
        />
        <p className="text-sm text-overlay-text/70">
          Get your API token from{" "}
          <a
            href="https://todoist.com/app/settings/integrations/developer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-overlay-accent hover:underline"
          >
            Todoist Settings
          </a>
        </p>
      </div>
    );
  }

  return (
    <div 
      className="w-96 bg-overlay-bg/85 backdrop-blur-sm rounded-lg shadow-lg p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h2 className="text-xl font-semibold mb-4 text-overlay-text">Stream Tasks</h2>
      
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-overlay-text placeholder:text-overlay-text/50 focus:outline-none focus:ring-2 focus:ring-overlay-accent"
        />
        <button
          type="submit"
          className="bg-overlay-accent hover:bg-overlay-secondary transition-colors rounded-lg px-3 py-2 text-white"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-overlay-text">Loading tasks...</div>
        ) : (
          todos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              {...todo}
              isActive={index === activeIndex}
              onComplete={() => completeMutation.mutate(todo.id)}
              onDelete={() => deleteMutation.mutate(todo.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};