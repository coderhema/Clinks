"use client";

import { TamboProvider } from "@tambo-ai/react";
import { ReactNode, useEffect, useState } from "react";
import { z } from "zod";
import {
  AddNodeComponent,
  WorkflowStatusComponent,
} from "@/source/components/tambo";

interface ClientProvidersProps {
  children: ReactNode;
}

// Define component schemas using Zod
const addNodeSchema = z.object({
  nodeType: z
    .string()
    .describe(
      "The type of node to add: 'text-input', 'image-input', 'text-generator', 'image-generator', 'video-generator', 'logo-generator', 'audio-generator', or 'output'",
    ),
  nodeName: z.string().describe("A descriptive name for the node"),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional()
    .describe("The x,y position on the canvas (optional, defaults to random)"),
  autoAdd: z
    .boolean()
    .optional()
    .describe("Whether to automatically add the node (default: true)"),
});

const workflowStatusSchema = z.object({
  message: z
    .string()
    .optional()
    .describe("An optional custom message to display with the workflow status"),
});

// Define Tambo components array
const tamboComponents = [
  {
    name: "AddNode",
    description:
      "Adds a new node to the workflow canvas. Use this to create input nodes, AI generator nodes, or output nodes in the user's workflow. Available node types: text-input (for text prompts), image-input (for uploading images), text-generator (AI text generation), image-generator (AI image generation), video-generator (AI video creation), logo-generator (AI logo design), audio-generator (AI audio creation), and output (for exporting results).",
    component: AddNodeComponent,
    propsSchema: addNodeSchema,
  },
  {
    name: "WorkflowStatus",
    description:
      "Displays the current status of the workflow including the number of nodes, connections, node types breakdown, and execution status. Use this to show the user information about their current workflow state or to confirm actions taken.",
    component: WorkflowStatusComponent,
    propsSchema: workflowStatusSchema,
  },
];

export function ClientProviders({ children }: ClientProvidersProps) {
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
    } else if (key.length < 10) {
      console.error(
        "❌ Tambo API key appears invalid (too short). Please check your key.",
      );
      setIsValidKey(false);
    } else {
      console.log("✅ Tambo API key configured");
      setIsValidKey(true);
    }
  }, []);

  // Always render children, but only wrap with TamboProvider if key is valid
  if (!apiKey || !isValidKey) {
    return <>{children}</>;
  }

  return (
    <TamboProvider apiKey={apiKey} components={tamboComponents}>
      {children}
    </TamboProvider>
  );
}
