"use client";

import { useWorkflow } from "@/components/workflow-provider";
import { Workflow, Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface WorkflowStatusProps {
  message?: string;
}

export function WorkflowStatusComponent({ message }: WorkflowStatusProps) {
  const { nodes, connections, isExecuting } = useWorkflow();

  return (
    <div className="bg-black border-2 border-white/20 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <div className="relative">
          <Workflow className="h-6 w-6 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/50" />
        </div>
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
          Workflow Status
        </h3>
      </div>

      {/* Custom Message */}
      {message && (
        <div className="bg-primary/10 border border-primary/30 p-3">
          <p className="text-white text-sm font-mono">{message}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/20 p-3 space-y-1">
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Total Nodes
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
            {connections.length}
          </div>
        </div>
      </div>

      {/* Node Breakdown */}
      {nodes.length > 0 && (
        <div className="space-y-2">
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Node Types
          </div>
          <div className="space-y-1">
            {Object.entries(
              nodes.reduce((acc, node) => {
                acc[node.type] = (acc[node.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between bg-white/5 border border-white/10 p-2"
              >
                <span className="text-primary text-xs font-mono">{type}</span>
                <span className="text-white text-sm font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Status */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 text-warning animate-spin" />
              <span className="text-warning text-sm font-bold uppercase">
                Executing...
              </span>
            </>
          ) : nodes.length > 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-success text-sm font-bold uppercase">
                Ready
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500 text-sm font-bold uppercase">
                No Nodes
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Hint */}
      {nodes.length === 0 && (
        <div className="bg-white/5 border border-white/10 p-3">
          <p className="text-gray-400 text-xs">
            <span className="text-primary">→</span> Ask me to add nodes to get
            started with your workflow
          </p>
        </div>
      )}
    </div>
  );
}

export const workflowStatusSchema = {
  message: {
    type: "string",
    description: "An optional custom message to display with the workflow status",
    required: false,
  },
};
