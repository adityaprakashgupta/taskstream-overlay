import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initializeTodoistApi, getTodoistProjects } from "@/services/todoistService";
import { useQuery } from "@tanstack/react-query";

const Setup = () => {
  const [apiToken, setApiToken] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", apiToken],
    queryFn: getTodoistProjects,
    enabled: !!apiToken,
  });

  const handleApiTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value;
    setApiToken(token);
    if (token) {
      initializeTodoistApi(token);
    }
  };

  const generateWidgetUrl = () => {
    if (!apiToken || !selectedProjectId) {
      toast.error("Please provide both API token and select a project");
      return;
    }

    const params = new URLSearchParams({
      token: apiToken,
      projectId: selectedProjectId,
    });

    const url = `${window.location.origin}/?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success("Widget URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Configure Todo Widget</h1>
          <p className="text-gray-600 mt-2">Set up your Todoist integration and get a shareable widget URL</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Todoist API Token</label>
            <Input
              type="password"
              placeholder="Enter your Todoist API token"
              value={apiToken}
              onChange={handleApiTokenChange}
            />
            <p className="text-sm text-gray-500">
              Get your API token from{" "}
              <a
                href="https://todoist.com/app/settings/integrations/developer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Todoist Settings
              </a>
            </p>
          </div>

          {apiToken && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Project</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={generateWidgetUrl}
            disabled={!apiToken || !selectedProjectId}
          >
            Generate Widget URL
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Setup;