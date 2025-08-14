"use client"

import { useEffect, useRef, useState } from "react"
import {
  Play,
  Save,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize,
  Settings,
  Plus,
  Type,
  ImageIcon,
  Palette,
  Video,
  Music,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsModal } from "./settings-modal"

declare global {
  interface Window {
    Drawflow: any
    drawflowInstance: any
  }
}

export function DrawflowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawflowRef = useRef<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.js"
    script.onload = () => {
      const css = document.createElement("link")
      css.rel = "stylesheet"
      css.href = "https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.css"
      document.head.appendChild(css)

      initializeDrawflow()
    }
    document.head.appendChild(script)

    return () => {
      if (drawflowRef.current) {
        drawflowRef.current.clear()
      }
    }
  }, [])

  const initializeDrawflow = () => {
    if (!canvasRef.current || !window.Drawflow) return

    const editor = new window.Drawflow(canvasRef.current)
    drawflowRef.current = editor

    editor.reroute = true
    editor.reroute_fix_curvature = true
    editor.force_first_input = false
    editor.zoom_max = 5
    editor.zoom_min = 0.1
    editor.zoom_value = 1
    editor.start()

    // Add zoom event listener
    editor.on("zoom", (zoom: number) => {
      setZoomLevel(Math.round(zoom * 100))
    })

    const style = document.createElement("style")
    style.textContent = `
      .drawflow-container {
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
        overflow: auto !important;
        background: #000000 !important;
      }
      
      .drawflow-container::-webkit-scrollbar {
        width: 12px !important;
        height: 12px !important;
      }
      
      .drawflow-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05) !important;
      }
      
      .drawflow-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2) !important;
        border-radius: 6px !important;
      }
      
      .drawflow-container::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3) !important;
      }
      
      .drawflow-container::-webkit-scrollbar-corner {
        background: #000000 !important;
      }

      .drawflow {
        background: #000000 !important;
        background-image: 
          linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px) !important;
        background-size: calc(40px * var(--zoom-level, 1)) calc(40px * var(--zoom-level, 1)) !important;
        background-position: 0 0 !important;
        width: 50000px !important;
        height: 50000px !important;
        position: relative !important;
        transform-origin: 0 0 !important;
      }
      
      .drawflow .drawflow-node {
        background: #1a1a1a !important;
        border: 1px solid #404040 !important;
        border-radius: 0 !important;
        color: white !important;
        min-width: 280px !important;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6) !important;
        transition: none !important;
        will-change: transform !important;
        cursor: move !important;
        transform-origin: center !important;
        position: absolute !important;
      }
      
      .drawflow .drawflow-node.drag {
        transition: none !important;
        transform: scale(1.02) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8) !important;
        z-index: 1000 !important;
      }
      
      .drawflow .drawflow-node:hover {
        border-color: #606060 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8) !important;
      }
      
      .drawflow .drawflow-node.selected {
        border-color: #ffffff !important;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.8) !important;
      }
      
      .drawflow .connection .main-path {
        stroke: #808080 !important;
        stroke-width: 2px !important;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4)) !important;
        transition: all 0.1s ease !important;
      }
      
      .drawflow .connection .main-path:hover {
        stroke: #ffffff !important;
        stroke-width: 3px !important;
      }
      
      .drawflow .connection.selected .main-path {
        stroke: #ffffff !important;
        stroke-width: 3px !important;
      }
      
      .drawflow .drawflow-node .input, 
      .drawflow .drawflow-node .output {
        background: #ef4444 !important;
        border: 2px solid #dc2626 !important;
        width: 14px !important;
        height: 14px !important;
        border-radius: 0 !important;
        transition: all 0.1s ease !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4) !important;
        will-change: transform !important;
        cursor: crosshair !important;
      }
      
      .drawflow .drawflow-node .input:hover {
        background: #fca5a5 !important;
        border-color: #ef4444 !important;
        transform: scale(1.3) !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4) !important;
      }
      
      .drawflow .drawflow-node .output:hover {
        background: #fca5a5 !important;
        border-color: #ef4444 !important;
        transform: scale(1.3) !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4) !important;
      }
      
      .drawflow .drawflow-node .input.connected {
        background: #dc2626 !important;
        border-color: #b91c1c !important;
      }
      
      .drawflow .drawflow-node .output.connected {
        background: #dc2626 !important;
        border-color: #b91c1c !important;
      }
      
      .node-content input,
      .node-content select,
      .node-content textarea {
        background: #171717 !important;
        border: 1px solid #404040 !important;
        color: white !important;
        border-radius: 0 !important;
        transition: all 0.1s ease !important;
      }
      
      .node-content input:focus,
      .node-content select:focus,
      .node-content textarea:focus {
        outline: none !important;
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
      }

      /* Infinite scroll enhancement */
      .drawflow-container {
        scroll-behavior: smooth !important;
      }

      /* Node icon styles */
      .node-icon {
        color: white !important;
        width: 16px !important;
        height: 16px !important;
        flex-shrink: 0 !important;
      }

      /* Zoom counter */
      .zoom-counter {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        background: rgba(0, 0, 0, 0.8) !important;
        border: 1px solid #404040 !important;
        color: white !important;
        padding: 8px 12px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        z-index: 30 !important;
        pointer-events: none !important;
        border-radius: 4px !important;
        backdrop-filter: blur(4px) !important;
      }
    `
    document.head.appendChild(style)

    // Set up infinite scrolling
    setupInfiniteScroll()
    setupFastDragAndDrop(editor)
    addSampleNodes(editor)

    // Center the canvas initially
    setTimeout(() => {
      centerCanvas()
    }, 100)
  }

  const setupInfiniteScroll = () => {
    if (!containerRef.current || !canvasRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current

    // Initially center the view
    const centerX = (canvas.scrollWidth - container.clientWidth) / 2
    const centerY = (canvas.scrollHeight - container.clientHeight) / 2

    container.scrollTo({
      left: centerX,
      top: centerY,
      behavior: "auto",
    })

    // Add scroll event listener for infinite expansion (optional enhancement)
    container.addEventListener("scroll", () => {
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = container

      // Optional: Dynamically expand canvas if user gets close to edges
      // This creates a truly "infinite" feel
      const buffer = 5000 // pixels from edge to trigger expansion

      if (
        scrollLeft < buffer ||
        scrollTop < buffer ||
        scrollLeft > scrollWidth - clientWidth - buffer ||
        scrollTop > scrollHeight - clientHeight - buffer
      ) {
        // Could implement dynamic canvas expansion here if needed
        // For now, the large fixed size (50000x50000) should be sufficient
      }
    })
  }

  const setupFastDragAndDrop = (editor: any) => {
    if (!canvasRef.current) return

    canvasRef.current.addEventListener(
      "dragover",
      (e) => {
        e.preventDefault()
        e.dataTransfer!.dropEffect = "copy"
      },
      { passive: false },
    )

    canvasRef.current.addEventListener(
      "drop",
      (e) => {
        e.preventDefault()

        try {
          const nodeData = JSON.parse(e.dataTransfer!.getData("application/json"))
          const rect = canvasRef.current!.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          const canvasX = (x - editor.canvas_x) / editor.zoom
          const canvasY = (y - editor.canvas_y) / editor.zoom

          addNodeToCanvas(editor, nodeData, canvasX, canvasY)
        } catch (error) {
          console.error("Error adding node:", error)
        }
      },
      { passive: false },
    )

    canvasRef.current.addEventListener("click", (e) => {
      const nodeElement = (e.target as Element).closest(".drawflow-node")
      if (nodeElement) {
        const nodeId = nodeElement.getAttribute("data-node")
        if (nodeId) {
          window.dispatchEvent(new CustomEvent("nodeSelected", { detail: { nodeId } }))
        }
      }
    })
  }

  const addNodeToCanvas = (editor: any, nodeData: any, x: number, y: number) => {
    const nodeId = `${nodeData.id}_${Date.now()}`

    const nodeHtml = createNodeHtml(nodeData)

    let inputs = 0
    let outputs = 1

    if (nodeData.id === "text-input") {
      inputs = 0
      outputs = 1
    } else if (nodeData.id === "output") {
      inputs = 1
      outputs = 0
    } else {
      inputs = 1
      outputs = 1
    }

    const initialData = {
      ...nodeData,
      content: nodeData.content || "",
      nodeId: nodeId,
    }

    editor.addNode(nodeId, inputs, outputs, x, y, nodeId, initialData, nodeHtml)

    setTimeout(() => {
      const nodeElement = document.querySelector(`[data-node="${nodeId}"]`)
      if (nodeElement) {
        setupNodeInputHandlers(nodeElement, nodeId, editor)

        const iconContainer = nodeElement.querySelector(".node-icon-container")
        if (iconContainer) {
          // Create icon element that exactly matches the library styling
          const iconElement = document.createElement("div")
          iconElement.className = "inline-flex items-center"
          iconElement.style.cssText = "width: 16px; height: 16px; flex-shrink: 0;"

          // Create SVG with exact same styling as library (h-4 w-4 text-white)
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          svg.setAttribute("width", "16")
          svg.setAttribute("height", "16")
          svg.setAttribute("viewBox", "0 0 24 24")
          svg.setAttribute("fill", "none")
          svg.setAttribute("stroke", "currentColor")
          svg.setAttribute("stroke-width", "2")
          svg.setAttribute("stroke-linecap", "round")
          svg.setAttribute("stroke-linejoin", "round")
          svg.style.cssText = "color: white; width: 16px; height: 16px;"

          switch (nodeData.id) {
            case "text-input":
              // Type icon from Lucide
              svg.innerHTML =
                '<polyline points="4,7 4,4 20,4 20,7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="16" x2="12" y2="20"></line>'
              break
            case "image-input":
              // ImageIcon from Lucide
              svg.innerHTML =
                '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>'
              break
            case "image-generator":
              // Palette icon from Lucide
              svg.innerHTML =
                '<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>'
              break
            case "video-generator":
              // Video icon from Lucide
              svg.innerHTML =
                '<path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>'
              break
            case "logo-generator":
              // Palette icon from Lucide
              svg.innerHTML =
                '<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>'
              break
            case "audio-generator":
              // Music icon from Lucide
              svg.innerHTML =
                '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>'
              break
            case "output":
              // Upload icon from Lucide
              svg.innerHTML =
                '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>'
              break
            default:
              // Plus icon from Lucide
              svg.innerHTML = '<path d="M5 12h14"></path><path d="M12 5v14"></path>'
          }

          iconElement.appendChild(svg)
          iconContainer.replaceWith(iconElement)
        }
      }
    }, 50)
  }

  const setupNodeInputHandlers = (nodeElement: Element, nodeId: string, editor: any) => {
    // Handle textarea input for text-input nodes
    const textarea = nodeElement.querySelector("textarea")
    if (textarea) {
      textarea.addEventListener("input", (e) => {
        const target = e.target as HTMLTextAreaElement
        const nodeData = editor.getNodeFromId(nodeId)
        if (nodeData) {
          // Update the node's data with the new content
          nodeData.data = {
            ...nodeData.data,
            content: target.value,
          }
          editor.updateNodeDataFromId(nodeId, nodeData.data)
        }
      })

      // Set initial value if exists
      const nodeData = editor.getNodeFromId(nodeId)
      if (nodeData?.data?.content) {
        textarea.value = nodeData.data.content
      }
    }

    // Handle select inputs for generator nodes
    const select = nodeElement.querySelector("select")
    if (select) {
      select.addEventListener("change", (e) => {
        const target = e.target as HTMLSelectElement
        const nodeData = editor.getNodeFromId(nodeId)
        if (nodeData) {
          nodeData.data = {
            ...nodeData.data,
            selectedModel: target.value,
          }
          editor.updateNodeDataFromId(nodeId, nodeData.data)
        }
      })
    }
  }

  const getNodeIcon = (nodeId: string) => {
    switch (nodeId) {
      case "text-input":
        return Type
      case "image-input":
        return ImageIcon
      case "image-generator":
        return ImageIcon
      case "video-generator":
        return Video
      case "logo-generator":
        return Palette
      case "audio-generator":
        return Music
      case "upload":
        return Upload
      case "output":
        return ChevronRight
      default:
        return Plus
    }
  }

  const createNodeHtml = (nodeData: any) => {
    switch (nodeData.id) {
      case "text-input":
        return `
          <div class="node-content">
            <div class="title-box">
              <div class="flex items-center gap-3">
                <div class="node-icon-container"></div>
                <span class="text-white text-sm font-medium">${nodeData.name}</span>
              </div>
            </div>
            <div class="p-4">
              <p class="text-neutral-400 text-sm mb-3">A simple text input field</p>
              <textarea class="w-full h-20 bg-neutral-900 border border-neutral-600 p-3 text-sm text-white resize-none" 
                        placeholder="Enter text..."></textarea>
            </div>
          </div>
        `

      case "image-generator":
      case "video-generator":
      case "logo-generator":
        return `
          <div class="node-content">
            <div class="title-box">
              <div class="flex items-center gap-3">
                <div class="node-icon-container"></div>
                <span class="text-white text-sm font-medium">${nodeData.name}</span>
              </div>
            </div>
            <div class="p-4 space-y-3">
              <p class="text-neutral-400 text-sm">${nodeData.description}</p>
              <select class="w-full bg-neutral-900 border border-neutral-600 p-2 text-sm text-white">
                <option>Model Option 1</option>
                <option>Model Option 2</option>
                <option>Model Option 3</option>
              </select>
              <div class="w-full h-24 bg-neutral-900 border border-neutral-600 flex items-center justify-center text-xs text-neutral-400 hover:bg-neutral-800 transition-colors">
                Preview Area
              </div>
            </div>
          </div>
        `

      default:
        return `
          <div class="node-content">
            <div class="title-box">
              <div class="flex items-center gap-3">
                <div class="node-icon-container"></div>
                <span class="text-white text-sm font-medium">${nodeData.name}</span>
              </div>
            </div>
            <div class="p-4">
              <p class="text-neutral-400 text-sm">${nodeData.description}</p>
            </div>
          </div>
        `
    }
  }

  const addSampleNodes = (editor: any) => {
    editor.clear()

    const textInputData = {
      id: "text-input",
      name: "Text Input",
      description: "Enter text prompts",
    }

    const imageGenData = {
      id: "image-generator",
      name: "Image Generator",
      description: "Generate images from text",
    }

    // Position nodes near the center of the large canvas
    const centerX = 25000 // Half of 50000
    const centerY = 25000 // Half of 50000

    addNodeToCanvas(editor, textInputData, centerX - 200, centerY)
    addNodeToCanvas(editor, imageGenData, centerX + 200, centerY)
  }

  const centerCanvas = () => {
    if (!containerRef.current || !canvasRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current

    const centerX = (canvas.scrollWidth - container.clientWidth) / 2
    const centerY = (canvas.scrollHeight - container.clientHeight) / 2

    container.scrollTo({
      left: centerX,
      top: centerY,
      behavior: "smooth",
    })
  }

  const handleRun = () => {
    if (drawflowRef.current) {
      const workflowData = drawflowRef.current.export()
      console.log("Running workflow with data:", workflowData)

      window.drawflowInstance = drawflowRef.current

      const runEvent = new CustomEvent("triggerWorkflowExecution", {
        detail: { workflowData },
      })
      window.dispatchEvent(runEvent)
    }
  }

  const handleSave = () => {
    if (drawflowRef.current) {
      const data = drawflowRef.current.export()
      console.log("Saving workflow:", data)
    }
  }

  const handleExport = () => {
    if (drawflowRef.current) {
      const data = drawflowRef.current.export()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "workflow.json"
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && drawflowRef.current) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            drawflowRef.current.import(data)
          } catch (error) {
            console.error("Error importing workflow:", error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleZoomIn = () => {
    if (drawflowRef.current) {
      drawflowRef.current.zoom_in()
      updateGridScale()
    }
  }

  const handleZoomOut = () => {
    if (drawflowRef.current) {
      drawflowRef.current.zoom_out()
      updateGridScale()
    }
  }

  const updateGridScale = () => {
    if (drawflowRef.current && canvasRef.current) {
      const zoom = drawflowRef.current.zoom
      const drawflowElement = canvasRef.current.querySelector(".drawflow")
      if (drawflowElement) {
        ;(drawflowElement as HTMLElement).style.setProperty("--zoom-level", zoom.toString())
        // Update background size to scale with zoom
        const newSize = 40 * zoom
        ;(drawflowElement as HTMLElement).style.backgroundSize = `${newSize}px ${newSize}px`
      }
    }
  }

  const handleReset = () => {
    if (drawflowRef.current) {
      drawflowRef.current.zoom_reset()
      centerCanvas()
      updateGridScale()
    }
  }

  return (
    <>
      <div className="flex-1 relative overflow-hidden bg-black">
        <div className="absolute top-6 left-6 z-20 flex gap-3">
          <Button
            variant="primary"
            onClick={handleRun}
            className="hover:bg-neutral-800 transition-all duration-300 hover:scale-105 shadow-2xl font-semibold px-6 py-2.5 hover:shadow-white/20 rounded-none text-white border border-dashed border-neutral-800 bg-neutral-900"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Run Workflow
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            className="bg-black hover:bg-neutral-900 hover:border-white/40 text-white transition-all duration-300 hover:scale-105 shadow-2xl font-medium px-5 py-2.5 rounded-none border border-neutral-800 border-solid"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button
            onClick={handleImport}
            variant="primary"
            className="bg-black hover:bg-neutral-900 hover:border-white/40 text-white transition-all duration-300 hover:scale-105 shadow-2xl font-medium px-5 py-2.5 rounded-none border border-neutral-800 border-solid"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          <Button
            onClick={() => setShowSettings(true)}
            variant="primary"
            className="bg-black hover:bg-neutral-900 hover:border-white/40 text-white transition-all duration-300 hover:scale-105 shadow-2xl font-medium px-5 py-2.5 rounded-none border border-neutral-800 border-solid"
          >
            <Settings className="w-4 h-4 mr-2 transition-transform hover:rotate-90" />
            Settings
          </Button>
        </div>

        <div className="absolute top-6 right-6 z-20 flex flex-col gap-[0]">
          <Button
            onClick={handleZoomIn}
            size="sm"
            variant="outline"
            className="bg-black hover:bg-neutral-900 border-white/20 hover:border-white/40 text-white transition-all duration-300 hover:scale-110 shadow-2xl p-0 rounded-none w-10 h-10"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomOut}
            size="sm"
            variant="outline"
            className="bg-black hover:bg-neutral-900 border-white/20 hover:border-white/40 text-white transition-all duration-300 hover:scale-110 shadow-2xl w-10 h-10 p-0 rounded-none"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleReset}
            size="sm"
            variant="outline"
            className="bg-black hover:bg-neutral-900 border-white/20 hover:border-white/40 text-white transition-all duration-300 hover:scale-110 shadow-2xl w-10 h-10 p-0 rounded-none"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        <div ref={containerRef} className="drawflow-container w-full h-full">
          <div ref={canvasRef} className="min-w-full min-h-full" id="drawflow" />
        </div>

        <div className="zoom-counter">{zoomLevel}%</div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
