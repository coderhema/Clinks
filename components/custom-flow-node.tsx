"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchableSelect } from "./searchable-select"
import { ImageIcon, Video, Music, Type, Palette, Play, Settings, Upload } from "lucide-react"

const nodeIcons = {
  "text-input": Type,
  "image-input": ImageIcon,
  "image-generator": Palette, // Updated from "image-gen" to "image-generator"
  "video-generator": Video, // Updated from "video-gen" to "video-generator"
  "audio-generator": Music, // Updated from "audio-gen" to "audio-generator"
  "logo-generator": Palette, // Added new logo generator type
  output: Upload,
}

const textModels = [
  // Groq Models (Text only)
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Fast)", provider: "Groq" },
  { value: "llama3-70b-8192", label: "Llama 3 70B", provider: "Groq" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B", provider: "Groq" },
  { value: "gemma2-9b-it", label: "Gemma 2 9B", provider: "Groq" },

  // OpenRouter Text Models
  { value: "openai/gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku", provider: "Anthropic" },
  { value: "google/gemini-pro-1.5", label: "Gemini Pro 1.5", provider: "Google" },
]

const imageModels = [
  // OpenRouter Image Models (High Quality Image Generation)
  { value: "openai/dall-e-3", label: "DALL-E 3 (High Quality)", provider: "OpenAI" },
  { value: "openai/dall-e-2", label: "DALL-E 2 (Fast)", provider: "OpenAI" },
  { value: "stability-ai/stable-diffusion-xl", label: "Stable Diffusion XL", provider: "Stability AI" },
  { value: "stability-ai/stable-diffusion-2-1", label: "Stable Diffusion 2.1", provider: "Stability AI" },
  { value: "midjourney/midjourney", label: "Midjourney", provider: "Midjourney" },
]

const audioModels = [
  // OpenAI Audio Models
  { value: "tts-1", label: "TTS-1 (Fast)", provider: "OpenAI" },
  { value: "tts-1-hd", label: "TTS-1 HD (High Quality)", provider: "OpenAI" },
]

const videoModels = [
  // Placeholder for video models (limited availability)
  { value: "runway-gen2", label: "RunwayML Gen-2", provider: "RunwayML" },
  { value: "stable-video", label: "Stable Video Diffusion", provider: "Stability AI" },
]

const getModelsForNodeType = (nodeType: string) => {
  switch (nodeType) {
    case "text-input":
      return textModels
    case "image-generator":
    case "logo-generator":
      return imageModels
    case "audio-generator":
      return audioModels
    case "video-generator":
      return videoModels
    default:
      return textModels
  }
}

interface CustomFlowNodeProps {
  node: any
  zoom: number
  pan: { x: number; y: number }
  isSelected: boolean
  onSelect: () => void
  onStartConnection: (nodeId: string, x: number, y: number) => void
  onCompleteConnection: (nodeId: string, x: number, y: number) => void
  onUpdateNode: (id: string, updates: any) => void
}

export function CustomFlowNode({
  node,
  zoom,
  pan,
  isSelected,
  onSelect,
  onStartConnection,
  onCompleteConnection,
  onUpdateNode,
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

  const handleModelChange = useCallback(
    (modelId: string) => {
      onUpdateNode(node.id, {
        data: {
          ...node.data,
          config: {
            ...node.data.config,
            model: modelId,
          },
        },
      })
    },
    [node.id, node.data, onUpdateNode],
  )

  const handleContentChange = useCallback(
    (content: string) => {
      onUpdateNode(node.id, {
        data: {
          ...node.data,
          content,
        },
      })
    },
    [node.id, node.data, onUpdateNode],
  )

  const availableModels = getModelsForNodeType(node.type)
  const selectedModel = node.data.config?.model || availableModels[0]?.value
  const selectedModelInfo = availableModels.find((m) => m.value === selectedModel)

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
        min-w-[300px] bg-neutral-900 border border-neutral-700 text-white
        ${isSelected ? "ring-1 ring-blue-400" : ""}
        transition-all duration-100 hover:border-neutral-600 shadow-xl
      `}
      >
        {/* Input Handle */}
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 border border-blue-500 cursor-pointer hover:bg-blue-500 transition-all duration-100"
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
          {/* Model Selection for AI Generation Nodes */}
          {(node.type === "image-generator" ||
            node.type === "video-generator" ||
            node.type === "audio-generator" ||
            node.type === "logo-generator" ||
            node.type === "text-input") && (
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 font-medium">AI Model</label>
              <SearchableSelect
                options={availableModels}
                value={selectedModel}
                onChange={handleModelChange}
                placeholder="Select AI model..."
                className="w-full"
              />
              {selectedModelInfo && (
                <div className="text-xs text-neutral-500">
                  Selected: {selectedModelInfo.label} ({selectedModelInfo.provider})
                </div>
              )}
            </div>
          )}

          {node.type === "text-input" && (
            <div className="space-y-2">
              <textarea
                className="w-full h-20 bg-neutral-900 border border-neutral-600 text-white text-sm p-3 resize-none focus:border-neutral-500 focus:outline-none transition-colors"
                placeholder="Enter your prompt..."
                defaultValue={node.data.content}
                onChange={(e) => handleContentChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="text-xs text-neutral-500">
                Output: {node.data.content ? `${node.data.content.length} characters` : "No content"}
              </div>
            </div>
          )}

          {(node.type === "image-generator" || node.type === "video-generator" || node.type === "logo-generator") && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400">
                Input:{" "}
                {node.data.inputPrompt
                  ? node.data.inputPrompt.length > 50
                    ? node.data.inputPrompt.substring(0, 50) + "..."
                    : node.data.inputPrompt
                  : "Waiting for input connection..."}
              </div>

              <div className="w-full h-32 bg-neutral-800 border border-neutral-600 flex items-center justify-center overflow-hidden">
                {node.data.preview ? (
                  <img
                    src={node.data.preview || "/placeholder.svg"}
                    alt="Generated content"
                    className="max-w-full max-h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-500">
                    <Icon size={28} />
                    <span className="text-xs">
                      {node.data.inputPrompt ? "Ready to generate" : "Connect text input to generate"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Additional style parameters..."
                  className="w-full bg-neutral-900 border border-neutral-600 text-white text-sm px-3 py-2 focus:border-neutral-500 focus:outline-none transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onUpdateNode(node.id, {
                      data: { ...node.data, styleParams: e.target.value },
                    })
                  }
                />
                <select
                  className="w-full bg-neutral-900 border border-neutral-600 text-white text-sm px-3 py-2 focus:border-neutral-500 focus:outline-none transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onUpdateNode(node.id, {
                      data: { ...node.data, quality: e.target.value },
                    })
                  }
                >
                  <option value="standard">Quality: Standard</option>
                  <option value="hd">Quality: HD</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 border-0 transition-colors duration-100"
                  onClick={(e) => e.stopPropagation()}
                  disabled={!node.data.inputPrompt}
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

          {node.type === "audio-generator" && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400">
                Input: {node.data.inputPrompt ? node.data.inputPrompt.substring(0, 50) + "..." : "Waiting for input..."}
              </div>

              <div className="w-full h-20 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                {node.data.preview ? (
                  <audio controls className="w-full">
                    <source src={node.data.preview} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-500">
                    <Music size={24} />
                    <span className="text-xs">Connect input to generate</span>
                  </div>
                )}
              </div>

              <select
                className="w-full bg-neutral-900 border border-neutral-600 text-white text-sm px-3 py-2 focus:border-neutral-500 focus:outline-none transition-colors"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  onUpdateNode(node.id, {
                    data: { ...node.data, duration: e.target.value },
                  })
                }
              >
                <option value="30s">Duration: 30s</option>
                <option value="60s">Duration: 60s</option>
                <option value="120s">Duration: 120s</option>
              </select>

              <Button
                size="sm"
                className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-700 border-0 transition-colors duration-100"
                onClick={(e) => e.stopPropagation()}
                disabled={!node.data.inputPrompt}
              >
                <Play size={14} className="mr-2" />
                Generate Audio
              </Button>
            </div>
          )}
        </div>

        {/* Output Handle */}
        <div
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-red-600 border border-red-500 cursor-pointer hover:bg-red-500 transition-all duration-100"
          onClick={handleOutputClick}
        />
      </div>
    </div>
  )
}
