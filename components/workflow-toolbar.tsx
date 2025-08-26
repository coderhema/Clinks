"use client"

import type React from "react"

import { useWorkflow } from "./workflow-provider"
import { Button } from "./ui/button"
import { Save, FolderOpen, Trash2, Play, Share2, ImageIcon, Video, Music, Settings } from "lucide-react"
import { useRef, useState } from "react"
import { SettingsModal } from "./settings-modal"
import { useToast } from "@/hooks/use-toast"

export function WorkflowToolbar() {
  const {
    nodes,
    connections,
    exportWorkflow,
    importWorkflow,
    clearWorkflow,
    selectedNode,
    executeWorkflow,
    isExecuting,
  } = useWorkflow()
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportJSON = () => {
    const workflowData = exportWorkflow("My AI Workflow")
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${workflowData.metadata.name.replace(/\s+/g, "_")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workflowData = JSON.parse(e.target?.result as string)
        importWorkflow(workflowData)
        toast({
          title: "Workflow Imported",
          description: "Your workflow has been successfully loaded.",
        })
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid workflow file format. Please check your file and try again.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleExportImage = () => {
    const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode.id) : null
    if (selectedNodeData?.type === "image-generator" && selectedNodeData.data.content) {
      // Create downloadable text file with the generated prompt
      const blob = new Blob([selectedNodeData.data.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "generated-image-prompt.txt"
      link.click()
      URL.revokeObjectURL(url)
    } else {
      toast({
        title: "Export Failed",
        description: "Please select an image generation node with generated content to export.",
        variant: "destructive",
      })
    }
  }

  const handleExportVideo = () => {
    const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode.id) : null
    if (selectedNodeData?.type === "video-generator" && selectedNodeData.data.content) {
      const blob = new Blob([selectedNodeData.data.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "generated-video-prompt.txt"
      link.click()
      URL.revokeObjectURL(url)
    } else {
      toast({
        title: "Export Failed",
        description: "Please select a video generation node with generated content to export.",
        variant: "destructive",
      })
    }
  }

  const handleExportAudio = () => {
    const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode.id) : null
    if (selectedNodeData?.type === "audio-generator" && selectedNodeData.data.content) {
      const blob = new Blob([selectedNodeData.data.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "generated-audio-prompt.txt"
      link.click()
      URL.revokeObjectURL(url)
    } else {
      toast({
        title: "Export Failed",
        description: "Please select an audio generation node with generated content to export.",
        variant: "destructive",
      })
    }
  }

  const handleRunWorkflow = async () => {
    if (nodes.length === 0) {
      toast({
        title: "No Workflow",
        description: "Add some nodes to your workflow first!",
        variant: "destructive",
      })
      return
    }
    await executeWorkflow()
  }

  const handleShareWorkflow = () => {
    const workflowData = exportWorkflow("Shared Workflow")
    const shareData = btoa(JSON.stringify(workflowData))
    const shareUrl = `${window.location.origin}?workflow=${shareData}`

    if (navigator.share) {
      navigator.share({
        title: "AI Workflow",
        text: "Check out this AI workflow I created!",
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Share URL Copied",
        description: "The workflow share URL has been copied to your clipboard!",
      })
    }
  }

  return (
    <>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/90 backdrop-blur-sm border rounded-lg p-2 flex items-center gap-2 border-neutral-900">
          {/* Workflow Controls */}
          <div className="flex items-center gap-1 pr-2 border-r border-neutral-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRunWorkflow}
              disabled={isExecuting}
              className="text-green-400 hover:text-green-300 hover:bg-green-400/10 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              <Play
                className={`h-4 w-4 mr-1 transition-transform hover:scale-110 ${isExecuting ? "animate-spin" : ""}`}
              />
              {isExecuting ? "Running..." : "Run"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearWorkflow}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 hover:scale-105"
            >
              <Trash2 className="h-4 w-4 transition-transform hover:scale-110" />
            </Button>
          </div>

          {/* File Operations */}
          <div className="flex items-center gap-1 pr-2 border-r border-neutral-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportJSON}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-all duration-200 hover:scale-105"
            >
              <Save className="h-4 w-4 mr-1 transition-transform hover:scale-110" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleImportJSON}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-all duration-200 hover:scale-105"
            >
              <FolderOpen className="h-4 w-4 mr-1 transition-transform hover:scale-110" />
              Load
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 transition-all duration-200 hover:scale-105"
            >
              <Settings className="h-4 w-4 transition-transform hover:scale-110 hover:rotate-90" />
            </Button>
          </div>

          {/* Export Content */}
          <div className="flex items-center gap-1 pr-2 border-r border-neutral-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportImage}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 transition-all duration-200 hover:scale-105"
            >
              <ImageIcon className="h-4 w-4 transition-transform hover:scale-110" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportVideo}
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 transition-all duration-200 hover:scale-105"
            >
              <Video className="h-4 w-4 transition-transform hover:scale-110" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportAudio}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-all duration-200 hover:scale-105"
            >
              <Music className="h-4 w-4 transition-transform hover:scale-110" />
            </Button>
          </div>

          {/* Share */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShareWorkflow}
            className="text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 transition-all duration-200 hover:scale-105"
          >
            <Share2 className="h-4 w-4 mr-1 transition-transform hover:scale-110" />
            Share
          </Button>

          {/* Status */}
          <div className="pl-2 border-l text-xs text-gray-500 border-neutral-800">
            <span className="transition-all duration-200">
              {nodes.length} node{nodes.length !== 1 ? "s" : ""} • {connections.length} connection
              {connections.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
