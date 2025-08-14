"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageIcon, Video, Music, Type, Palette, Play, Settings } from "lucide-react"

const nodeIcons = {
  "text-input": Type,
  "image-gen": ImageIcon,
  "video-gen": Video,
  "audio-gen": Music,
  "style-transfer": Palette,
}

const nodeColors = {
  "text-input": "bg-blue-600",
  "image-gen": "bg-green-600",
  "video-gen": "bg-purple-600",
  "audio-gen": "bg-orange-600",
  "style-transfer": "bg-pink-600",
}

export const AINode = memo(({ data, selected }: NodeProps) => {
  const Icon = nodeIcons[data.type as keyof typeof nodeIcons] || Type
  const colorClass = nodeColors[data.type as keyof typeof nodeColors] || "bg-gray-600"

  return (
    <Card
      className={`
      min-w-[200px] bg-gray-900 border-gray-700 text-white
      ${selected ? "ring-2 ring-blue-500" : ""}
      transition-all duration-200 hover:shadow-lg
    `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ left: -6 }}
      />

      {/* Node Header */}
      <div className={`${colorClass} px-3 py-2 flex items-center gap-2`}>
        <Icon size={16} className="text-white" />
        <span className="font-medium text-sm">{data.label}</span>
      </div>

      {/* Node Content */}
      <div className="p-3 space-y-2">
        {data.type === "text-input" && (
          <textarea
            className="w-full h-20 bg-gray-800 border-gray-600 text-white text-xs p-2 resize-none"
            placeholder="Enter your prompt..."
            defaultValue={data.content}
          />
        )}

        {(data.type === "image-gen" || data.type === "video-gen") && (
          <div className="space-y-2">
            <div className="w-full h-24 bg-gray-800 border border-gray-600 flex items-center justify-center">
              {data.preview ? (
                <img
                  src={data.preview || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Icon size={24} className="text-gray-500" />
              )}
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs bg-gray-800 border-gray-600 hover:bg-gray-700"
              >
                <Play size={12} className="mr-1" />
                Generate
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2 bg-gray-800 border-gray-600 hover:bg-gray-700">
                <Settings size={12} />
              </Button>
            </div>
          </div>
        )}

        {data.type === "audio-gen" && (
          <div className="space-y-2">
            <div className="w-full h-12 bg-gray-800 border border-gray-600 flex items-center justify-center">
              <Music size={20} className="text-gray-500" />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              <Play size={12} className="mr-1" />
              Generate Audio
            </Button>
          </div>
        )}

        <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
          {data.type}
        </Badge>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ right: -6 }}
      />
    </Card>
  )
})

AINode.displayName = "AINode"
