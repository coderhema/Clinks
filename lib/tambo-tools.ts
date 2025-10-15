import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { WorkflowNode } from "@/components/workflow-provider";

// Define the node type schema
const NodeTypeSchema = z.enum([
  "text-input",
  "image-input",
  "image-gen",
  "video-gen",
  "audio-gen",
  "output",
  "image-generator",
  "video-generator",
  "audio-generator",
  "logo-generator",
  "text-generator",
]);

interface WorkflowToolsContext {
  addNode: (node: Omit<WorkflowNode, "id">) => string;
  getNodes: () => WorkflowNode[];
  getConnections: () => any[];
  isExecuting: boolean;
}

export function createWorkflowTools(
  context: WorkflowToolsContext,
): TamboTool[] {
  // Tool to add a node to the workflow
  const addNodeTool = async (args: string) => {
    try {
      // Parse the JSON string argument
      const params = JSON.parse(args);
      const { nodeType, nodeName = "New Node", position } = params;

      // Calculate default position if not provided
      const nodePosition = position || {
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 300,
      };

      // Create the node
      const nodeId = context.addNode({
        type: nodeType,
        position: nodePosition,
        data: {
          label: nodeName,
          config: {},
        },
      });

      return JSON.stringify({
        success: true,
        nodeId,
        message: `Successfully added ${nodeType} node named "${nodeName}" at position (${Math.round(nodePosition.x)}, ${Math.round(nodePosition.y)})`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: `Failed to add node: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  // Tool to get workflow status
  const getWorkflowStatusTool = async () => {
    try {
      const nodes = context.getNodes();
      const connections = context.getConnections();

      // Count nodes by type
      const nodeTypes: Record<string, number> = {};
      nodes.forEach((node) => {
        nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
      });

      return JSON.stringify({
        totalNodes: nodes.length,
        totalConnections: connections.length,
        nodeTypes,
        isExecuting: context.isExecuting,
      });
    } catch (error) {
      return JSON.stringify({
        totalNodes: 0,
        totalConnections: 0,
        nodeTypes: {},
        isExecuting: false,
      });
    }
  };

  return [
    {
      name: "add_workflow_node",
      description:
        "Add a new node to the workflow canvas. Use this when the user wants to add any type of node (text input, image generator, video generator, etc.) to their workflow. Available node types: text-input, image-input, image-gen, video-gen, audio-gen, output, image-generator, video-generator, audio-generator, logo-generator, text-generator",
      tool: addNodeTool,
      toolSchema: {
        type: "object",
        properties: {
          nodeType: {
            type: "string",
            enum: [
              "text-input",
              "image-input",
              "image-gen",
              "video-gen",
              "audio-gen",
              "output",
              "image-generator",
              "video-generator",
              "audio-generator",
              "logo-generator",
              "text-generator",
            ],
            description:
              "The type of node to add (e.g., text-generator, image-generator)",
          },
          nodeName: {
            type: "string",
            description: "Optional name/label for the node",
          },
          position: {
            type: "object",
            properties: {
              x: {
                type: "number",
                description: "X coordinate",
              },
              y: {
                type: "number",
                description: "Y coordinate",
              },
            },
            description: "Optional position for the node on the canvas",
          },
        },
        required: ["nodeType"],
      } as any,
    },
    {
      name: "get_workflow_status",
      description:
        "Get the current status and statistics of the workflow, including total nodes, connections, node types count, and execution status. Use this when the user asks about the workflow state.",
      tool: getWorkflowStatusTool,
      toolSchema: {
        type: "object",
        properties: {},
      } as any,
    },
  ];
}
