import { useState } from "react";
import { Plus } from "lucide-react";
import { TodoItem } from "./TodoItem";
import { toast } from "sonner";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo = {
      id: Math.random().toString(36).substring(7),
      text: newTodo,
      completed: false,
    };

    setTodos([...todos, todo]);
    setNewTodo("");
    toast("Task added");
  };

  const completeTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    toast("Task deleted");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, todos.length - 1));
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
  };

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
        {todos.map((todo, index) => (
          <TodoItem
            key={todo.id}
            {...todo}
            isActive={index === activeIndex}
            onComplete={completeTodo}
            onDelete={deleteTodo}
          />
        ))}
      </div>
    </div>
  );
};