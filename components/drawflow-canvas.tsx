"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    Drawflow: any
  }
}

export function DrawflowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const drawflowRef = useRef<any>(null)

  useEffect(() => {
    // Load Drawflow from CDN
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
    editor.zoom_value = 0.1
    editor.start()

    const style = document.createElement("style")
    style.textContent = `
      .drawflow {
        background: #000000 !important;
        background-image: 
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px) !important;
        background-size: 40px 40px !important;
        background-position: 0 0 !important;
        overflow: visible !important;
        width: 100000px !important;
        height: 100000px !important;
        position: relative !important;
      }
      
      .drawflow-canvas {
        width: 100% !important;
        height: 100% !important;
        overflow: auto !important;
        scroll-behavior: smooth !important;
        scrollbar-width: thin !important;
        scrollbar-color: #171717 transparent !important;
      }
      
      .drawflow-canvas::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
      }
      
      .drawflow-canvas::-webkit-scrollbar-track {
        background: transparent !important;
      }
      
      .drawflow-canvas::-webkit-scrollbar-thumb {
        background: #171717 !important;
        border-radius: 0 !important;
      }
      
      .drawflow-canvas::-webkit-scrollbar-thumb:hover {
        background: #262626 !important;
      }
      
      /* Enhanced node styling to match the provided design */
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
      }
      
      /* Instant drag response with no transition delays */
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
      
      /* Updated node header styling to match the design */
      .drawflow .drawflow-node .title-box {
        background: #2a2a2a !important;
        color: white !important;
        padding: 12px 16px !important;
        font-weight: 500 !important;
        border-radius: 0 !important;
        border-bottom: 1px solid #404040 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
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
      
      /* Red square connectors matching the design */
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
      
      /* Input and selector styling with neutral-900 background */
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
    `
    document.head.appendChild(style)

    setupFastDragAndDrop(editor)
    addSampleNodes(editor)
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
          // Trigger preview panel update
          window.dispatchEvent(new CustomEvent("nodeSelected", { detail: { nodeId } }))
        }
      }
    })
  }

  const addNodeToCanvas = (editor: any, nodeData: any, x: number, y: number) => {
    const nodeId = `${nodeData.id}_${Date.now()}`

    const nodeHtml = createNodeHtml(nodeData)

    // Determine inputs and outputs based on node type
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

    editor.addNode(nodeData.id, inputs, outputs, x, y, nodeData.id, {}, nodeHtml)
  }

  const createNodeHtml = (nodeData: any) => {
    switch (nodeData.id) {
      case "text-input":
        return `
          <div class="node-content">
            <div class="title-box">
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 bg-red-500"></div>
                <span class="font-semibold text-white">${nodeData.name}</span>
              </div>
              <div class="w-3 h-3 bg-red-500"></div>
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
                <div class="w-4 h-4 bg-red-500"></div>
                <span class="font-semibold text-white">${nodeData.name}</span>
              </div>
              <div class="w-3 h-3 bg-red-500"></div>
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
                <div class="w-4 h-4 bg-red-500"></div>
                <span class="font-semibold text-white">${nodeData.name}</span>
              </div>
              <div class="w-3 h-3 bg-red-500"></div>
            </div>
            <div class="p-4">
              <p class="text-neutral-400 text-sm">${nodeData.description}</p>
            </div>
          </div>
        `
    }
  }

  const addSampleNodes = (editor: any) => {
    // Clear any existing nodes first
    editor.clear()

    // Add a few sample nodes with better spacing
    const textInputHtml = createNodeHtml({
      id: "text-input",
      name: "Text Input",
      description: "Enter text prompts",
    })

    const imageGenHtml = createNodeHtml({
      id: "image-generator",
      name: "Image Generator",
      description: "Generate images from text",
    })

    editor.addNode("textinput", 0, 1, 150, 200, "textinput", {}, textInputHtml)
    editor.addNode("imagegen", 1, 1, 500, 200, "imagegen", {}, imageGenHtml)
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-black">
      <div className="w-full h-full overflow-auto drawflow-canvas">
        <div ref={canvasRef} className="min-w-full min-h-full" id="drawflow" />
      </div>
    </div>
  )
}
