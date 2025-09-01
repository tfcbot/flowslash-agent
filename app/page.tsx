"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Workflow, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data for now - will be replaced with real API calls
const mockFlows = [
  {
    id: "1",
    name: "Customer Support Agent",
    description: "AI agent for handling customer inquiries",
    status: "active",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Data Analysis Workflow",
    description: "Automated data processing and analysis",
    status: "draft",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function HomePage() {
  const router = useRouter();
  const [flows, setFlows] = useState(mockFlows);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFlows = flows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateFlow = () => {
    const flowId = Math.random().toString(36).substr(2, 9);
    router.push(`/builder/${flowId}`);
  };

  const handleOpenFlow = (flowId: string) => {
    router.push(`/builder/${flowId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Flowslash Agent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Build and deploy AI agents with visual workflows
          </p>
        </div>
        <Button
          onClick={handleCreateFlow}
          size="lg"
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          New Flow
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search flows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlows.map((flow) => (
          <Card
            key={flow.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleOpenFlow(flow.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Workflow size={20} className="text-blue-600" />
                <CardTitle className="text-lg">{flow.name}</CardTitle>
              </div>
              <CardDescription>{flow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    flow.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {flow.status}
                </span>
                <span>
                  Updated {new Date(flow.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFlows.length === 0 && (
        <div className="text-center py-12">
          <Workflow size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No flows found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by creating your first flow"}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreateFlow}>Create Your First Flow</Button>
          )}
        </div>
      )}
    </div>
  );
}
