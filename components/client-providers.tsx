"use client";

import { TamboProvider, type TamboComponent } from "@tambo-ai/react";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { AddNodeComponent } from "@/source/components/tambo/add-node";
import { WorkflowStatusComponent } from "@/source/components/tambo/workflow-status";
import { ConnectNodesComponent } from "@/source/components/tambo/connect-nodes";
import { BuildWorkflowComponent } from "@/source/components/tambo/build-workflow";
import { ExecuteWorkflowComponent } from "@/source/components/tambo/execute-workflow";

interface ClientProvidersProps {
  children: React.ReactNode;
}

// Define Zod schemas for component props
const addNodePropsSchema = z.object({
  nodeType: z
    .enum([
      "text-input",
      "image-input",
      "text-generator",
      "image-generator",
      "video-generator",
      "logo-generator",
      "audio-generator",
      "output",
    ])
    .describe(
      "The type of node to add. Choose based on what the user wants to create: text-input for entering text, image-input for uploading images, text-generator for AI text generation, image-generator for creating images, video-generator for creating videos, logo-generator for creating logos, audio-generator for creating audio, and output for displaying results.",
    ),
  nodeName: z
    .string()
    .describe(
      "A clear, descriptive name for the node that explains its purpose in the workflow",
    ),
  position: z
    .object({
      x: z.number().describe("X coordinate on the canvas (typically 100-800)"),
      y: z.number().describe("Y coordinate on the canvas (typically 100-600)"),
    })
    .optional()
    .describe(
      "Position where the node should appear on the canvas. If not specified, uses default with random offset to prevent stacking.",
    ),
  autoAdd: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to automatically add the node to the canvas. Set to true to add immediately.",
    ),
});

const workflowStatusPropsSchema = z.object({
  message: z
    .string()
    .optional()
    .describe(
      "An optional custom message to display with the workflow status. Use this to give context or instructions to the user.",
    ),
});

const connectNodesPropsSchema = z.object({
  sourceNodeId: z
    .string()
    .describe(
      "The ID of the source node (where data comes from). This should be the ID of a node that was previously added. Node IDs are returned when nodes are created.",
    ),
  targetNodeId: z
    .string()
    .describe(
      "The ID of the target node (where data goes to). This should be the ID of a node that was previously added.",
    ),
  autoConnect: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to automatically create the connection (default: true)"),
});

const buildWorkflowPropsSchema = z.object({
  workflowName: z
    .string()
    .describe(
      "A descriptive name for the workflow being created (e.g., 'Text to Image Pipeline', 'Logo Generation Workflow')",
    ),
  nodes: z
    .array(
      z.object({
        type: z
          .enum([
            "text-input",
            "image-input",
            "text-generator",
            "image-generator",
            "video-generator",
            "logo-generator",
            "audio-generator",
            "output",
          ])
          .describe(
            "The type of node (text-input, text-generator, image-generator, video-generator, logo-generator, audio-generator, output)",
          ),
        name: z.string().describe("A descriptive name for this node"),
        position: z
          .object({
            x: z.number(),
            y: z.number(),
          })
          .optional()
          .describe("Optional position override"),
      }),
    )
    .describe(
      "Array of node definitions to create in the workflow. Each node should have a type and name. Nodes will be connected in the order they are defined.",
    ),
  connections: z
    .array(
      z.object({
        sourceIndex: z
          .number()
          .describe("Index of the source node in the nodes array (0-based)"),
        targetIndex: z
          .number()
          .describe("Index of the target node in the nodes array (0-based)"),
      }),
    )
    .optional()
    .describe(
      "Optional array of connections between nodes. If not provided, nodes will be connected in sequence (node 0 to 1, 1 to 2, etc). Use sourceIndex and targetIndex based on the order of nodes in the nodes array.",
    ),
  autoBuild: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to automatically build the workflow immediately (default: true)",
    ),
});

const executeWorkflowPropsSchema = z.object({
  autoExecute: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Whether to automatically execute the workflow immediately (default: false). Set to true if the user wants to run the workflow right away.",
    ),
  message: z
    .string()
    .optional()
    .describe(
      "An optional message to display before execution, such as instructions or what the workflow will do",
    ),
});

// Register Tambo components
const tamboComponents: TamboComponent[] = [
  {
    name: "AddNode",
    description:
      "Adds a single node to the workflow canvas. Use this when the user asks to add a specific type of node, like 'add a text generator' or 'create an image node'. The node will appear on the canvas and can be configured. For building complete multi-node workflows, use BuildWorkflow instead.",
    component: AddNodeComponent,
    propsSchema: addNodePropsSchema,
  },
  {
    name: "BuildWorkflow",
    description:
      "Creates a complete multi-node workflow with automatic connections. Use this when the user wants to create an entire pipeline or workflow with multiple steps, like 'create a text-to-image workflow' or 'build a logo generation pipeline'. This is the best choice for creating complete end-to-end workflows. It automatically positions nodes and connects them in sequence unless custom connections are specified.",
    component: BuildWorkflowComponent,
    propsSchema: buildWorkflowPropsSchema,
  },
  {
    name: "ConnectNodes",
    description:
      "Connects two existing nodes together so data can flow from source to target. Use this when the user wants to connect specific nodes that already exist, or to create custom connection patterns. Requires the node IDs of both the source and target nodes.",
    component: ConnectNodesComponent,
    propsSchema: connectNodesPropsSchema,
  },
  {
    name: "ExecuteWorkflow",
    description:
      "Executes the current workflow, running all nodes and generating content. Use this when the user wants to run their workflow, see results, or test their pipeline. Make sure nodes are configured before executing. The execution processes nodes in order based on their connections.",
    component: ExecuteWorkflowComponent,
    propsSchema: executeWorkflowPropsSchema,
  },
  {
    name: "WorkflowStatus",
    description:
      "Displays the current status of the workflow including total nodes, connections, node types breakdown, and execution state. Use this when the user asks about their workflow status, wants to see what nodes they have, asks 'what's in my workflow', 'show my workflow', or wants an overview of their current setup.",
    component: WorkflowStatusComponent,
    propsSchema: workflowStatusPropsSchema,
  },
];

export function ClientProviders({
  children,
}: ClientProvidersProps): React.JSX.Element {
  const [apiKey, setApiKey] = useState<string>("");
  const [isValidKey, setIsValidKey] = useState<boolean>(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TAMBO_TOKEN || "";
    setApiKey(key);

    // Validate API key format
    if (!key || key === "your_api_key_here") {
      console.warn(
        "⚠️ Tambo API key not configured. Please add NEXT_PUBLIC_TAMBO_TOKEN to your .env.local file.",
      );
      setIsValidKey(false);
    } else if (key.length < 10) {
      console.error(
        "❌ Tambo API key appears invalid (too short). Please check your key.",
      );
      setIsValidKey(false);
    } else {
      console.log("✅ Tambo API key configured");
      console.log(
        `📦 Registered ${tamboComponents.length} Tambo workflow components:`,
      );
      tamboComponents.forEach((comp) => {
        console.log(
          `   - ${comp.name}: ${comp.description?.substring(0, 80)}...`,
        );
      });
      setIsValidKey(true);
    }
  }, []);

  // Always render children, but only wrap with TamboProvider if key is valid
  if (!apiKey || !isValidKey) {
    return <>{children}</>;
  }

  return (
    <TamboProvider apiKey={apiKey} components={tamboComponents}>
      {children as any}
    </TamboProvider>
  );
}
