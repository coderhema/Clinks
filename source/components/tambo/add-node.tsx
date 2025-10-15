"use client";

import { useEffect } from "react";
import { useWorkflow } from "@/components/workflow-provider";
import { CheckCircle, Plus } from "lucide-react";

interface AddNodeProps {
  nodeType: string;
  nodeName: string;
  position?: { x: number; y: number };
  autoAdd?: boolean;
}

export function AddNodeComponent({
  nodeType,
  nodeName,
  position = { x: 300, y: 200 },
  autoAdd = true,
}: AddNodeProps) {
  const { addNode } = useWorkflow();

  useEffect(() => {
    if (autoAdd) {
      handleAddNode();
    }
  }, [autoAdd]);

  const handleAddNode = () => {
    // Add random offset to prevent nodes from stacking
    const randomOffset = {
      x: position.x + Math.random() * 100,
      y: position.y + Math.random() * 100,
    };

    addNode({
      type: nodeType as any,
      position: randomOffset,
      data: {
        label: nodeName,
        config: { model: "llama-3.1-8b-instant" },
      },
    });
  };

  return (
    <div className="bg-white/5 border-2 border-primary/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-success" />
        <span className="text-white font-bold text-sm uppercase tracking-wider">
          Node Added
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Type:</span>
          <span className="text-primary font-mono">{nodeType}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Name:</span>
          <span className="text-white font-mono">{nodeName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Position:</span>
          <span className="text-gray-400 font-mono text-xs">
            ({Math.round(position.x)}, {Math.round(position.y)})
          </span>
        </div>
      </div>

      {!autoAdd && (
        <button
          onClick={handleAddNode}
          className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 border-2 border-primary/50 transition-colors duration-200 flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-wider"
        >
          <Plus className="h-4 w-4" />
          Add to Canvas
        </button>
      )}
    </div>
  );
}

export const addNodeSchema = {
  nodeType: {
    type: "string",
    description: "The type of node to add (e.g., 'text-input', 'image-generator', 'text-generator', 'video-generator', 'logo-generator', 'audio-generator', 'output')",
    required: true,
  },
  nodeName: {
    type: "string",
    description: "A descriptive name for the node",
    required: true,
  },
  position: {
    type: "object",
    description: "The x,y position on the canvas where the node should be placed",
    properties: {
      x: { type: "number" },
      y: { type: "number" },
    },
    required: false,
  },
  autoAdd: {
    type: "boolean",
    description: "Whether to automatically add the node (default: true)",
    required: false,
  },
};
