"use client"

import React, { useState } from "react"
import { useWorkflow, type WorkflowNode as WorkflowNodeType } from "./workflow-provider"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { X, Settings, Play, Eye, Type, ImageIcon, Palette, Video, Music, Send } from "lucide-react"
import { ConnectionHandleComponent } from "./connection-handle"

interface WorkflowNodeProps {
  node: WorkflowNodeType
}

export function WorkflowNode({ node }: WorkflowNodeProps) {
  const { updateNode, deleteNode, setSelectedNode, selectedNode } = useWorkflow()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("connection-handle")) {
      return
    }

    setIsDragging(true)
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    })
    setSelectedNode(node.id)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateNode(node.id, {
        position: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        },
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  const getNodeColor = () => {
    switch (node.type) {
      case "text-input":
        return "border-gray-600 bg-gray-900"
      case "image-input":
        return "border-gray-600 bg-gray-800"
      case "image-gen":
        return "border-gray-500 bg-black"
      case "video-gen":
        return "border-gray-500 bg-gray-900"
      case "audio-gen":
        return "border-gray-600 bg-gray-800"
      case "output":
        return "border-gray-400 bg-black"
      default:
        return "border-gray-600 bg-gray-900"
    }
  }

  const getNodeIcon = () => {
    switch (node.type) {
      case "text-input":
        return <Type className="h-4 w-4 text-gray-300" />
      case "image-input":
        return <ImageIcon className="h-4 w-4 text-gray-300" />
      case "image-gen":
        return <Palette className="h-4 w-4 text-gray-300" />
      case "video-gen":
        return <Video className="h-4 w-4 text-gray-300" />
      case "audio-gen":
        return <Music className="h-4 w-4 text-gray-300" />
      case "output":
        return <Send className="h-4 w-4 text-gray-300" />
      default:
        return <Settings className="h-4 w-4 text-gray-300" />
    }
  }

  const getPreviewImage = () => {
    switch (node.type) {
      case "image-gen":
        return "/ai-colorful-abstract.png"
      case "video-gen":
        return "/video-thumbnail.png"
      case "text-input":
        return null
      default:
        return null
    }
  }

  const previewImage = getPreviewImage()

  return (
    <Card
      className={`absolute w-52 cursor-move select-none border-2 rounded-none ${getNodeColor()} ${
        selectedNode === node.id ? "ring-2 ring-gray-400" : ""
      } hover:border-gray-400 transition-all duration-200`}
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: selectedNode === node.id ? 10 : 2,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-gray-800 border-b border-gray-700 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getNodeIcon()}
            <span className="text-gray-100 text-sm font-medium">{node.data.label}</span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-none"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedNode(node.id)
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-none"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedNode(node.id)
              }}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-none"
              onClick={(e) => {
                e.stopPropagation()
                deleteNode(node.id)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <ConnectionHandleComponent
            nodeId={node.id}
            type="input"
            position="left"
            className="w-3 h-3 bg-gray-700 border-2 border-gray-500 hover:border-gray-300 cursor-crosshair connection-handle rounded-none"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded-none border border-gray-600"
          >
            <Play className="h-3 w-3 mr-1" />
            Execute
          </Button>
          <ConnectionHandleComponent
            nodeId={node.id}
            type="output"
            position="right"
            className="w-3 h-3 bg-gray-700 border-2 border-gray-500 hover:border-gray-300 cursor-crosshair connection-handle rounded-none"
          />
        </div>

        {previewImage && (
          <div className="bg-gray-800 border border-gray-700 p-2 rounded-none">
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-16 object-cover rounded-none border border-gray-600"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-gray-400 text-xs">Output Preview</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 px-2 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-none"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedNode(node.id)
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
