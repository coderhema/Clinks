"use client";

import { useEffect } from "react";
import { useWorkflow } from "@/components/workflow-provider";
import { Link, CheckCircle } from "lucide-react";
import { z } from "zod";

interface ConnectNodesProps {
  sourceNodeId: string;
  targetNodeId: string;
  autoConnect?: boolean;
}

export function ConnectNodesComponent({
  sourceNodeId,
  targetNodeId,
  autoConnect = true,
}: ConnectNodesProps) {
  const { addConnection, nodes } = useWorkflow();

  useEffect(() => {
    if (autoConnect) {
      handleConnect();
    }
  }, [autoConnect]);

  const handleConnect = () => {
    // Find the nodes to get their names
    const sourceNode = nodes.find((n) => n.id === sourceNodeId);
    const targetNode = nodes.find((n) => n.id === targetNodeId);

    if (!sourceNode || !targetNode) {
      console.error("Source or target node not found");
      return;
    }

    addConnection({
      source: sourceNodeId,
      target: targetNodeId,
    });
  };

  const sourceNode = nodes.find((n) => n.id === sourceNodeId);
  const targetNode = nodes.find((n) => n.id === targetNodeId);

  return (
    <div className="bg-white/5 border-2 border-success/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-success" />
        <span className="text-white font-bold text-sm uppercase tracking-wider">
          Nodes Connected
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-primary/20 border border-primary/50 p-2">
            <span className="text-gray-500 text-xs">Source:</span>
            <p className="text-white font-mono text-sm">
              {sourceNode?.data.label || sourceNodeId}
            </p>
          </div>
          <Link className="h-4 w-4 text-primary" />
          <div className="flex-1 bg-primary/20 border border-primary/50 p-2">
            <span className="text-gray-500 text-xs">Target:</span>
            <p className="text-white font-mono text-sm">
              {targetNode?.data.label || targetNodeId}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-success/10 border border-success/30 p-2">
        <p className="text-success text-xs font-mono">
          ✓ Connection established - data will flow from source to target
        </p>
      </div>
    </div>
  );
}

export const connectNodesSchema = z.object({
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
