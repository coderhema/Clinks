"use client";

import { useEffect } from "react";
import { useWorkflow } from "@/components/workflow-provider";
import { CheckCircle, Plus } from "lucide-react";
import { z } from "zod";

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

export const addNodeSchema = z.object({
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
