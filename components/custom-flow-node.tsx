"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Video, Music, Type, Palette, Play, Settings, Upload } from "lucide-react"

const nodeIcons = {
  "text-input": Type,
  "image-input": ImageIcon,
  "image-gen": Palette,
  "video-gen": Video,
  "audio-gen": Music,
  output: Upload,
}

interface CustomFlowNodeProps {
  node: any
  zoom: number
  pan: { x: number; y: number }
  isSelected: boolean
  onSelect: () => void
  onStartConnection: (nodeId: string, x: number, y: number) => void
  onCompleteConnection: (nodeId: string, x: number, y: number) => void
}

export function CustomFlowNode({
  node,
  zoom,
  pan,
  isSelected,
  onSelect,
  onStartConnection,
  onCompleteConnection,
}: CustomFlowNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const nodeRef = useRef<HTMLDivElement>(null)

  const Icon = nodeIcons[node.type as keyof typeof nodeIcons] || Type

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsDragging(true)
      const rect = nodeRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
      onSelect()
    },
    [onSelect],
  )

  const handleOutputClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const rect = nodeRef.current?.getBoundingClientRect()
      if (rect) {
        onStartConnection(node.id, rect.right, rect.top + rect.height / 2)
      }
    },
    [node.id, onStartConnection],
  )

  const handleInputClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const rect = nodeRef.current?.getBoundingClientRect()
      if (rect) {
        onCompleteConnection(node.id, rect.left, rect.top + rect.height / 2)
      }
    },
    [node.id, onCompleteConnection],
  )

  return (
    <div
      ref={nodeRef}
      className="absolute cursor-move select-none"
      style={{
        left: node.position.x * zoom + pan.x,
        top: node.position.y * zoom + pan.y,
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
        zIndex: isSelected ? 10 : 5,
        willChange: isDragging ? "transform" : "auto",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`
        min-w-[280px] bg-neutral-900 border border-neutral-700 text-white
        ${isSelected ? "ring-1 ring-blue-400" : ""}
        transition-all duration-100 hover:border-neutral-600 shadow-xl
      `}
      >
        {/* Input Handle */}
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-neutral-600 border border-neutral-500 cursor-pointer hover:bg-neutral-500 transition-all duration-100"
          onClick={handleInputClick}
        />

        {/* Node Header */}
        <div className="bg-neutral-800 px-4 py-3 flex items-center gap-3 border-b border-neutral-700">
          <Icon size={18} className="text-neutral-300" />
          <span className="font-semibold text-sm text-white">{node.data.label}</span>
          <Badge variant="secondary" className="ml-auto text-xs bg-neutral-700 text-neutral-300 border-0">
            {node.type}
          </Badge>
        </div>

        {/* Node Content */}
        <div className="p-4 space-y-3">
          {node.type === "text-input" && (
            <textarea
              className="w-full h-20 bg-neutral-900 border border-neutral-600 text-white text-sm p-3 resize-none focus:border-neutral-500 focus:outline-none transition-colors"
              placeholder="Enter your prompt..."
              defaultValue={node.data.content}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {(node.type === "image-gen" || node.type === "video-gen") && (
            <div className="space-y-3">
              <div className="w-full h-32 bg-neutral-800 border border-neutral-600 flex items-center justify-center overflow-hidden">
                {node.data.preview ? (
                  <img
                    src={node.data.preview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-full max-h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-500">
                    <Icon size={28} />
                    <span className="text-xs">No preview</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Style parameters..."
                  className="w-full bg-neutral-900 border border-neutral-600 text-white text-sm px-3 py-2 focus:border-neutral-500 focus:outline-none transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
                <select
                  className="w-full bg-neutral-900 border border-neutral-600 text-white text-sm px-3 py-2 focus:border-neutral-500 focus:outline-none transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option>Quality: Standard</option>
                  <option>Quality: High</option>
                  <option>Quality: Ultra</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 border-0 transition-colors duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Play size={14} className="mr-2" />
                  Generate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 bg-neutral-800 border-neutral-600 hover:bg-neutral-700 transition-colors duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings size={14} />
                </Button>
              </div>
            </div>
          )}

          {node.type === "audio-gen" && (
            <div className="space-y-3">
              <div className="w-full h-20 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-neutral-500">
                  <Music size={24} />
                  <span className="text-xs">Audio Preview</span>
                </div>
              </div>

              <select
                className="w-full bg-neutral-900 border border-neutral-600 text-white text-sm px-3 py-2 focus:border-neutral-500 focus:outline-none transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <option>Duration: 30s</option>
                <option>Duration: 60s</option>
                <option>Duration: 120s</option>
              </select>

              <Button
                size="sm"
                className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-700 border-0 transition-colors duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <Play size={14} className="mr-2" />
                Generate Audio
              </Button>
            </div>
          )}
        </div>

        {/* Output Handle */}
        <div
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-neutral-600 border border-neutral-500 cursor-pointer hover:bg-neutral-500 transition-all duration-100"
          onClick={handleOutputClick}
        />
      </div>
    </div>
  )
}
