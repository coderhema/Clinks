"use client";

import { useState } from "react";
import { useWorkflow } from "@/components/workflow-provider";
import { Play, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

interface ExecuteWorkflowProps {
  autoExecute?: boolean;
  message?: string;
}

export function ExecuteWorkflowComponent({
  autoExecute = false,
  message,
}: ExecuteWorkflowProps) {
  const { executeWorkflow, isExecuting, nodes, connections } = useWorkflow();
  const [executionStarted, setExecutionStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (nodes.length === 0) {
      setError("No nodes in workflow. Add nodes first.");
      return;
    }

    try {
      setError(null);
      setExecutionStarted(true);
      await executeWorkflow();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
    }
  };

  // Auto-execute if requested
  useState(() => {
    if (autoExecute && !executionStarted && !isExecuting && nodes.length > 0) {
      handleExecute();
    }
  });

  const canExecute = nodes.length > 0 && !isExecuting;

  return (
    <div className="bg-black border-2 border-primary/50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <div className="relative">
          <Play className="h-6 w-6 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/50" />
        </div>
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
          Execute Workflow
        </h3>
      </div>

      {/* Custom Message */}
      {message && (
        <div className="bg-primary/10 border border-primary/30 p-3">
          <p className="text-white text-sm font-mono">{message}</p>
        </div>
      )}

      {/* Workflow Info */}
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

      {/* Status */}
      <div className="space-y-2">
        {isExecuting && (
          <div className="bg-warning/20 border-2 border-warning/50 p-3 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-warning animate-spin flex-shrink-0" />
            <div>
              <p className="text-warning text-sm font-bold uppercase">
                Executing Workflow
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Processing nodes and generating content...
              </p>
            </div>
          </div>
        )}

        {executionStarted && !isExecuting && !error && (
          <div className="bg-success/20 border-2 border-success/50 p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
            <div>
              <p className="text-success text-sm font-bold uppercase">
                Execution Complete
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Check the preview panel to see results
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 p-3 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-500 text-sm font-bold uppercase">Error</p>
              <p className="text-gray-400 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {!executionStarted && nodes.length === 0 && (
          <div className="bg-white/5 border border-white/10 p-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase">
                No Workflow
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Add nodes to your workflow before executing
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Execute Button */}
      {!autoExecute && (
        <button
          onClick={handleExecute}
          disabled={!canExecute}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 border-2 border-primary/50 transition-all duration-200 flex items-center justify-center gap-2 font-bold uppercase text-sm tracking-wider disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-primary relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-center gap-2">
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Execute Workflow</span>
              </>
            )}
          </div>
        </button>
      )}

      {/* Hints */}
      {!executionStarted && nodes.length > 0 && !isExecuting && (
        <div className="bg-white/5 border border-white/10 p-3">
          <p className="text-gray-400 text-xs">
            <span className="text-primary">💡 Tip:</span> Make sure all nodes
            are properly configured before executing. Check that input nodes
            have content and generator nodes have prompts.
          </p>
        </div>
      )}
    </div>
  );
}

export const executeWorkflowSchema = z.object({
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
