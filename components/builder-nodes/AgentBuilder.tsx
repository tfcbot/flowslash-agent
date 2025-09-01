import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Settings, Play, Save } from "lucide-react";

interface AgentBuilderProps {
  onSave: (agentConfig: any) => void;
  onTest: (agentConfig: any) => void;
}

export default function AgentBuilder({ onSave, onTest }: AgentBuilderProps) {
  const [agentConfig, setAgentConfig] = useState({
    name: "",
    description: "",
    modelProvider: "openai",
    modelName: "gpt-4o",
    systemPrompt: "",
    apiKey: "",
    allowedTools: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setAgentConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(agentConfig);
  };

  const handleTest = () => {
    onTest(agentConfig);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={16} className="text-blue-500" />
        <h3 className="font-medium text-gray-900 dark:text-white">
          Agent Builder
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agent Name
          </label>
          <Input
            value={agentConfig.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter agent name..."
            className="h-8"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <Input
            value={agentConfig.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe what this agent does..."
            className="h-8"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model Provider
            </label>
            <select
              value={agentConfig.modelProvider}
              onChange={(e) =>
                handleInputChange("modelProvider", e.target.value)
              }
              className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model
            </label>
            <select
              value={agentConfig.modelName}
              onChange={(e) => handleInputChange("modelName", e.target.value)}
              className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700"
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4.1">GPT-4.1</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            System Prompt
          </label>
          <textarea
            value={agentConfig.systemPrompt}
            onChange={(e) => handleInputChange("systemPrompt", e.target.value)}
            placeholder="Enter the system prompt for your agent..."
            className="w-full h-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key
          </label>
          <Input
            type="password"
            value={agentConfig.apiKey}
            onChange={(e) => handleInputChange("apiKey", e.target.value)}
            placeholder="Enter your API key..."
            className="h-8"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Allowed Tools
          </label>
          <Input
            value={agentConfig.allowedTools}
            onChange={(e) => handleInputChange("allowedTools", e.target.value)}
            placeholder="gmail, notion, slack (comma separated)"
            className="h-8"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={!agentConfig.name || !agentConfig.apiKey}
          >
            <Save size={16} className="mr-2" />
            Save Agent
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            className="flex-1"
            disabled={!agentConfig.name || !agentConfig.apiKey}
          >
            <Play size={16} className="mr-2" />
            Test Agent
          </Button>
        </div>
      </div>
    </div>
  );
}
