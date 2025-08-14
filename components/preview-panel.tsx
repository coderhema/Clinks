"use client"
import { useWorkflow } from "./workflow-provider"
import { Button } from "./ui/button"
import { X, Download, Share, Maximize2, ChevronRight } from "lucide-react"
import { useState } from "react"

// Function declaration for getPreviewContent
function getPreviewContent() {
  return <p>Preview content goes here</p>
}

export function PreviewPanel() {
  const { selectedNode, nodes, setSelectedNode } = useWorkflow()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode) : null

  if (isCollapsed) {
    return (
      <div className="w-12 bg-black border-l border-white/20 flex flex-col">
        <Button
          onClick={() => setIsCollapsed(false)}
          variant="ghost"
          className="h-12 w-12 p-0 text-gray-500 hover:text-white hover:bg-gray-900 transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (!selectedNode || !selectedNodeData) {
    return (
      <div className="w-80 bg-black border-l border-white/20 flex flex-col">
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Preview</h2>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500 hover:text-white hover:bg-gray-900 transition-all duration-200 hover:scale-110"
              onClick={() => setIsCollapsed(true)}
            >
              <X className="h-3 w-3 transition-transform hover:rotate-90" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm text-center">Select a node to see its preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-black border-l border-white/20 flex flex-col">
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Preview</h2>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500 hover:text-white hover:bg-gray-900 transition-all duration-200 hover:scale-110"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500 hover:text-white hover:bg-gray-900 transition-all duration-200 hover:scale-110"
              onClick={() => setSelectedNode(null)}
            >
              <X className="h-3 w-3 transition-transform hover:rotate-90" />
            </Button>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1">{selectedNodeData.data.label}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">{getPreviewContent()}</div>

      <div className="p-4 border-t border-white/20">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs bg-transparent border-gray-800 hover:bg-gray-900 hover:border-gray-700 transition-all duration-200 hover:scale-105"
          >
            <Download className="h-3 w-3 mr-1 transition-transform hover:scale-110" />
            Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs bg-transparent border-gray-800 hover:bg-gray-900 hover:border-gray-700 transition-all duration-200 hover:scale-105"
          >
            <Share className="h-3 w-3 mr-1 transition-transform hover:scale-110" />
            Share
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-transparent border-gray-800 hover:bg-gray-900 hover:border-gray-700 transition-all duration-200 hover:scale-105"
          >
            <Maximize2 className="h-3 w-3 transition-transform hover:scale-110" />
          </Button>
        </div>
      </div>
    </div>
  )
}
