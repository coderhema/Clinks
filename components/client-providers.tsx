"use client";

import { TamboProvider } from "@tambo-ai/react";
import { ReactNode, useEffect, useState, useMemo } from "react";
import { WorkflowProvider, useWorkflow } from "./workflow-provider";
import { createWorkflowTools } from "@/lib/tambo-tools";
import type { TamboTool } from "@tambo-ai/react";

interface ClientProvidersProps {
  children: ReactNode;
}

function TamboProviderWithTools({ children }: { children: ReactNode }) {
  const { addNode, nodes, connections, isExecuting } = useWorkflow();
  const [apiKey, setApiKey] = useState<string>("");
  const [isValidKey, setIsValidKey] = useState<boolean>(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TAMBO_API_KEY || "";
    setApiKey(key);

    // Validate API key format
    if (!key || key === "your_api_key_here") {
      console.warn(
        "⚠️ Tambo API key not configured. Please add NEXT_PUBLIC_TAMBO_API_KEY to your .env.local file.",
      );
      setIsValidKey(false);
    } else if (key.length < 20) {
      console.error(
        "❌ Tambo API key appears invalid (too short). Please check your key.",
      );
      setIsValidKey(false);
    } else {
      console.log("✅ Tambo API key configured");
      setIsValidKey(true);
    }
  }, []);

  // Create tools with access to workflow context
  const tools = useMemo<TamboTool[]>(() => {
    const workflowTools = createWorkflowTools({
      addNode,
      getNodes: () => nodes,
      getConnections: () => connections,
      isExecuting,
    });

    console.log(
      "🔧 Created workflow tools:",
      workflowTools.map((t) => t.name),
    );
    return workflowTools;
  }, [addNode, nodes, connections, isExecuting]);

  // Always render children, but only wrap with TamboProvider if key is valid
  if (!apiKey || !isValidKey) {
    return <>{children}</>;
  }

  return (
    <TamboProvider apiKey={apiKey} tools={tools}>
      {children}
    </TamboProvider>
  );
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <WorkflowProvider>
      <TamboProviderWithTools>{children}</TamboProviderWithTools>
    </WorkflowProvider>
  );
}
