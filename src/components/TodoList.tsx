import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { TodoItem } from "./TodoItem";
import { toast } from "sonner";
import { 
  initializeTodoistApi, 
  getTodoistTasks, 
  getTodoistProjects,
  addTodoistTask, 
  completeTodoistTask, 
  deleteTodoistTask 
} from "../services/todoistService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newTodo, setNewTodo] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  // Get token and projectId from URL parameters
  const params = new URLSearchParams(window.location.search);
  const [apiToken, setApiToken] = useState(params.get("token") || localStorage.getItem("todoistToken") || "");
  const [selectedProjectId, setSelectedProjectId] = useState(params.get("projectId") || localStorage.getItem("todoistProjectId") || "");

  useEffect(() => {
    if (apiToken) {
      initializeTodoistApi(apiToken);
      localStorage.setItem("todoistToken", apiToken);
    }
  }, [apiToken]);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getTodoistProjects,
    enabled: !!apiToken,
  });

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos", selectedProjectId],
    queryFn: () => getTodoistTasks(selectedProjectId),
    enabled: !!apiToken && !!selectedProjectId,
    select: (data) => data.map((task) => ({
      id: task.id.toString(),
      text: task.content,
      completed: task.isCompleted || false,
    })),
  });

  const addMutation = useMutation({
    mutationFn: (content: string) => addTodoistTask(content, selectedProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", selectedProjectId] });
      toast("Task added");
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeTodoistTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", selectedProjectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodoistTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", selectedProjectId] });
      toast("Task deleted");
    },
  });

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    if (!apiToken) {
      navigate("/setup");
      return;
    }
    if (!selectedProjectId) {
      navigate("/setup");
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

  // Calculate completed and total tasks
  const completedTasks = todos.filter(todo => todo.completed).length;
  const totalTasks = todos.length;

  if (!apiToken || !selectedProjectId) {
    return (
      <div className="w-96 bg-overlay-bg/85 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-semibold mb-4 text-overlay-text">Stream Tasks</h2>
        <p className="text-overlay-text mb-4">Please configure the widget first</p>
        <button
          onClick={() => navigate("/setup")}
          className="w-full bg-overlay-accent hover:bg-overlay-secondary transition-colors rounded-lg px-3 py-2 text-white"
        >
          Go to Setup
        </button>
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

      {/* Task count display */}
      <div className="mt-4 text-sm text-overlay-text/80">
        {completedTasks} / {totalTasks} tasks completed
      </div>
    </div>
  );
};