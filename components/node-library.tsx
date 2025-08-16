"use client"
import { useState } from "react"
import type React from "react"

import { useWorkflow } from "./workflow-provider"
import { Button } from "./ui/button"
import {
  Search,
  Plus,
  Type,
  ImageIcon,
  Palette,
  Video,
  Music,
  Upload,
  ChevronDown,
  ChevronRight,
  Grip,
} from "lucide-react"

const nodeCategories = {
  inputs: {
    name: "Input Nodes",
    color: "bg-gray-500",
    nodes: [
      { id: "text-input", name: "Text Input", icon: Type, description: "Input text prompts", color: "bg-gray-500" },
      {
        id: "image-input",
        name: "Image Input",
        icon: ImageIcon,
        description: "Upload reference images",
        color: "bg-gray-600",
      },
    ],
  },
  generators: {
    name: "AI Generators",
    color: "bg-gray-400",
    nodes: [
      {
        id: "text-generator",
        name: "Text Generator",
        icon: Type,
        description: "Generate AI text content",
        color: "bg-gray-500",
      },
      {
        id: "image-generator",
        name: "Image Generator",
        icon: Palette,
        description: "Generate AI images",
        color: "bg-gray-400",
      },
      {
        id: "video-generator",
        name: "Video Generator",
        icon: Video,
        description: "Create AI videos",
        color: "bg-gray-500",
      },
      {
        id: "logo-generator",
        name: "Logo Generator",
        icon: Palette,
        description: "Generate brand logos",
        color: "bg-gray-300",
      },
      {
        id: "audio-generator",
        name: "Audio Generator",
        icon: Music,
        description: "Generate audio content",
        color: "bg-gray-600",
      },
    ],
  },
  outputs: {
    name: "Output Nodes",
    color: "bg-gray-700",
    nodes: [{ id: "output", name: "Output", icon: Upload, description: "Export final results", color: "bg-gray-700" }],
  },
}

export function NodeLibrary() {
  const { addDrawflowNode } = useWorkflow()
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["inputs", "generators", "outputs"])

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryKey) ? prev.filter((key) => key !== categoryKey) : [...prev, categoryKey],
    )
  }

  const handleDragStart = (e: React.DragEvent, nodeData: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(nodeData))
    e.dataTransfer.effectAllowed = "copy"

    const dragPreview = document.createElement("div")
    dragPreview.className =
      "bg-gray-800 border border-gray-600 p-2 text-white text-xs font-medium shadow-xl pointer-events-none"
    dragPreview.textContent = nodeData.name
    dragPreview.style.position = "absolute"
    dragPreview.style.top = "-1000px"
    dragPreview.style.transform = "scale(0.9)"
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 0, 0)

    requestAnimationFrame(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview)
      }
    })
  }

  const filteredCategories = Object.entries(nodeCategories)
    .map(([key, category]) => ({
      key,
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.nodes.length > 0)

  return (
    <div className="w-80 bg-black border-r border-white/10 flex flex-col shadow-2xl">
      <div className="p-6 border-b border-white/10 bg-black">
        <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-3">
          <Grip className="w-6 h-6 text-white" />
          Node Library
        </h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-300 bg-neutral-900"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.key} className="border-b border-white/10 last:border-b-0">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.key)}
              className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <h3 className="text-white text-sm font-bold uppercase tracking-wider">{category.name}</h3>
                <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 font-medium">{category.nodes.length}</span>
              </div>
              {expandedCategories.includes(category.key) ? (
                <ChevronDown className="w-5 h-5 text-white transition-all duration-300 group-hover:scale-110" />
              ) : (
                <ChevronRight className="w-5 h-5 text-white transition-all duration-300 group-hover:scale-110" />
              )}
            </button>

            {/* Category Nodes */}
            {expandedCategories.includes(category.key) && (
              <div className="px-5 pb-5 space-y-3">
                {category.nodes.map((node) => {
                  const IconComponent = node.icon
                  return (
                    <div
                      key={node.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node)}
                      className="bg-white/5 border border-white/20 p-4 hover:bg-white/10 transition-all duration-200 hover:border-white/30 cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-4 w-4 text-white" />
                          <span className="text-white text-sm font-medium">{node.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
                          onClick={() => {
                            console.log("Quick add:", node.name)
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-gray-400 text-xs">{node.description}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-white/10 bg-black">
        <div className="bg-white/5 border border-white/20 p-4 space-y-3">
          <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-3">Quick Guide</h4>
          <div className="space-y-2 text-sm text-gray-300 leading-relaxed font-medium">
            <p>
              • <span className="text-white font-semibold">Drag</span> nodes onto the canvas
            </p>
            <p>
              • <span className="text-white font-semibold">Connect</span> outputs to inputs
            </p>
            <p>
              • <span className="text-white font-semibold">Double-click</span> canvas to add nodes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
