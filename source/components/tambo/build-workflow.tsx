"use client";

import { useEffect, useState } from "react";
import { useWorkflow } from "@/components/workflow-provider";
import { Workflow, CheckCircle, Zap, Loader2 } from "lucide-react";
import { z } from "zod";

interface WorkflowNodeDefinition {
  type: string;
  name: string;
  position?: { x: number; y: number };
}

interface WorkflowConnectionDefinition {
  sourceIndex: number;
  targetIndex: number;
}

interface BuildWorkflowProps {
  workflowName: string;
  nodes: WorkflowNodeDefinition[];
  connections?: WorkflowConnectionDefinition[];
  autoBuild?: boolean;
}

export function BuildWorkflowComponent({
  workflowName,
  nodes,
  connections = [],
  autoBuild = true,
}: BuildWorkflowProps) {
  const { addNode, addConnection } = useWorkflow();
  const [isBuilding, setIsBuilding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [createdNodeIds, setCreatedNodeIds] = useState<string[]>([]);

  useEffect(() => {
    if (autoBuild && !isBuilding && !isComplete) {
      handleBuild();
    }
  }, [autoBuild, isBuilding, isComplete]);

  const handleBuild = async () => {
    setIsBuilding(true);
    const nodeIds: string[] = [];

    try {
      // Add all nodes first
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const baseX = 150;
        const baseY = 150;
        const spacing = 250;

        // Calculate position in a flow layout
        const position = node.position || {
          x: baseX + (i % 3) * spacing,
          y: baseY + Math.floor(i / 3) * spacing,
        };

        const nodeId = addNode({
          type: node.type as any,
          position,
          data: {
            label: node.name,
            config: { model: "llama-3.1-8b-instant" },
          },
        });

        nodeIds.push(nodeId);

        // Small delay to make the building visible
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setCreatedNodeIds(nodeIds);

      // Add connections between nodes
      if (connections.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        for (const conn of connections) {
          if (nodeIds[conn.sourceIndex] && nodeIds[conn.targetIndex]) {
            addConnection({
              source: nodeIds[conn.sourceIndex],
              target: nodeIds[conn.targetIndex],
            });
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      } else {
        // If no explicit connections, connect nodes in sequence
        for (let i = 0; i < nodeIds.length - 1; i++) {
          addConnection({
            source: nodeIds[i],
            target: nodeIds[i + 1],
          });
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      setIsComplete(true);
    } catch (error) {
      console.error("Error building workflow:", error);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="bg-black border-2 border-primary/50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <div className="relative">
          <Workflow className="h-6 w-6 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/50" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">
            Building Workflow
          </h3>
          <p className="text-gray-400 text-xs font-mono mt-1">{workflowName}</p>
        </div>
        {isComplete && (
          <CheckCircle className="h-5 w-5 text-success animate-in zoom-in duration-300" />
        )}
        {isBuilding && (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/20 p-3 space-y-1">
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Nodes
          </div>
          <div className="text-white text-2xl font-bold font-display">
            {nodes.length}
          </div>
        </div>

        <div className="bg-white/5 border border-white/20 p-3 space-y-1">
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Connections
          </div>
          <div className="text-white text-2xl font-bold font-display">
            {connections.length || nodes.length - 1}
          </div>
        </div>
      </div>

      {/* Node List */}
      <div className="space-y-2">
        <div className="text-gray-400 text-xs uppercase tracking-wider">
          Workflow Steps
        </div>
        <div className="space-y-1">
          {nodes.map((node, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 bg-white/5 border p-2 transition-all duration-300 ${
                createdNodeIds[index]
                  ? "border-success/50 animate-in fade-in slide-in-from-left"
                  : "border-white/10 opacity-50"
              }`}
            >
              <div className="text-primary text-xs font-bold font-mono">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-mono">{node.name}</p>
                <p className="text-gray-500 text-[10px] font-mono">
                  {node.type}
                </p>
              </div>
              {createdNodeIds[index] && (
                <CheckCircle className="h-3 w-3 text-success" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="border-t border-white/10 pt-3">
        {isBuilding && (
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-bold uppercase">
              Building workflow...
            </span>
          </div>
        )}
        {isComplete && (
          <div className="bg-success/10 border border-success/30 p-3">
            <p className="text-success text-xs font-bold uppercase">
              ✓ Workflow complete and ready to use!
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Configure each node and click "Execute Workflow" to run
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const buildWorkflowSchema = z.object({
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
