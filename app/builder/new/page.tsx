"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewFlowPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a unique flow ID and redirect to the builder
    const flowId = Math.random().toString(36).substr(2, 9);
    router.replace(`/builder/${flowId}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Creating new flow...
        </p>
      </div>
    </div>
  );
}
