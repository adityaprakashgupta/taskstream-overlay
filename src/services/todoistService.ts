import { TodoistApi } from "@doist/todoist-api-typescript";

let todoistApi: TodoistApi | null = null;

export const initializeTodoistApi = (apiToken: string) => {
  todoistApi = new TodoistApi(apiToken);
};

export const getTodoistProjects = async () => {
  if (!todoistApi) throw new Error("Todoist API not initialized");
  return await todoistApi.getProjects();
};

export const getTodoistTasks = async (projectId: string) => {
  if (!todoistApi) throw new Error("Todoist API not initialized");
  return await todoistApi.getTasks({
    projectId,
  });
};

export const addTodoistTask = async (content: string, projectId: string) => {
  if (!todoistApi) throw new Error("Todoist API not initialized");
  return await todoistApi.addTask({
    content,
    projectId,
  });
};

export const completeTodoistTask = async (taskId: string) => {
  if (!todoistApi) throw new Error("Todoist API not initialized");
  return await todoistApi.closeTask(taskId);
};

export const deleteTodoistTask = async (taskId: string) => {
  if (!todoistApi) throw new Error("Todoist API not initialized");
  return await todoistApi.deleteTask(taskId);
};