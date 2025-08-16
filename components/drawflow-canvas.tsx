"use client"

import { useEffect, useRef } from "react"
import { useWorkflow } from "./workflow-provider"

declare global {
  interface Window {
    Drawflow: any
  }
}

export function DrawflowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const drawflowRef = useRef<any>(null)
  const { addReactFlowNode, updateNodeData, updateConnections, deleteNode } = useWorkflow()

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "A") {
        e.preventDefault()
        selectAllNodes()
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteSelectedNodes()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      if (drawflowRef.current) {
        drawflowRef.current.clear()
      }
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const selectAllNodes = () => {
    if (!drawflowRef.current) return

    try {
      const nodes = document.querySelectorAll(".drawflow-node")
      if (!nodes || nodes.length === 0) {
        console.log("[v0] No nodes to select")
        return
      }

      nodes.forEach((node) => {
        if (node && node.classList) {
          node.classList.add("selected")
        }
      })
      console.log("[v0] Selected all nodes")
    } catch (error) {
      console.error("[v0] Error selecting nodes:", error)
    }
  }

  const deleteSelectedNodes = () => {
    if (!drawflowRef.current) return

    try {
      const selectedNodes = document.querySelectorAll(".drawflow-node.selected")

      if (selectedNodes.length === 0) {
        const allNodes = document.querySelectorAll(".drawflow-node")
        if (!allNodes || allNodes.length === 0) {
          console.log("[v0] No nodes to delete")
          return
        }

        const nodeIds: string[] = []
        allNodes.forEach((node) => {
          if (node && node.getAttribute) {
            const nodeId = node.getAttribute("data-node")
            if (nodeId) {
              nodeIds.push(nodeId)
            }
          }
        })

        nodeIds.forEach((nodeId) => {
          try {
            if (drawflowRef.current) {
              drawflowRef.current.removeNodeId(`node-${nodeId}`)
              deleteNode(nodeId)
            }
          } catch (err) {
            console.error("[v0] Error deleting node:", nodeId, err)
          }
        })
        console.log("[v0] Deleted all nodes:", nodeIds.length)
      } else {
        const selectedNodeIds: string[] = []
        selectedNodes.forEach((node) => {
          if (node && node.getAttribute) {
            const nodeId = node.getAttribute("data-node")
            if (nodeId) {
              selectedNodeIds.push(nodeId)
            }
          }
        })

        selectedNodeIds.forEach((nodeId) => {
          try {
            if (drawflowRef.current) {
              drawflowRef.current.removeNodeId(`node-${nodeId}`)
              deleteNode(nodeId)
            }
          } catch (err) {
            console.error("[v0] Error deleting selected node:", nodeId, err)
          }
        })
        console.log("[v0] Deleted selected nodes:", selectedNodeIds.length)
      }

      setTimeout(() => {
        if (drawflowRef.current) {
          syncConnectionsToWorkflow(drawflowRef.current)
        }
      }, 100)
    } catch (error) {
      console.error("[v0] Error in deleteSelectedNodes:", error)
    }
  }

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

    editor.on("connectionCreated", (info: any) => {
      console.log("[v0] Connection created:", info)
      syncConnectionsToWorkflow(editor)
    })

    editor.on("connectionRemoved", (info: any) => {
      console.log("[v0] Connection removed:", info)
      syncConnectionsToWorkflow(editor)
    })

    editor.on("nodeRemoved", (id: string) => {
      console.log("[v0] Node removed:", id)
      deleteNode(id)
      syncConnectionsToWorkflow(editor)
    })

    editor.on("nodeDataChanged", (id: string) => {
      console.log("[v0] Node data changed:", id)
      syncNodeDataToWorkflow(editor, id)
    })

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
    `
    document.head.appendChild(style)

    setupFastDragAndDrop(editor)
  }

  const syncConnectionsToWorkflow = (editor: any) => {
    try {
      if (!editor) return

      const drawflowData = editor.export()
      if (!drawflowData || !drawflowData.drawflow || !drawflowData.drawflow.Home || !drawflowData.drawflow.Home.data) {
        console.log("[v0] No drawflow data to sync")
        updateConnections([])
        return
      }

      const connections: Array<{ source: string; target: string; sourceHandle: string; targetHandle: string }> = []

      Object.values(drawflowData.drawflow.Home.data).forEach((node: any) => {
        if (node && node.outputs) {
          Object.entries(node.outputs).forEach(([outputKey, output]: [string, any]) => {
            if (output && output.connections) {
              Object.values(output.connections).forEach((connection: any) => {
                if (connection && connection.node) {
                  connections.push({
                    source: node.id.toString(),
                    target: connection.node,
                    sourceHandle: `output-${outputKey}`,
                    targetHandle: `input-${connection.output}`,
                  })
                }
              })
            }
          })
        }
      })

      console.log("[v0] Syncing connections:", connections)
      updateConnections(connections)
    } catch (error) {
      console.error("[v0] Error syncing connections:", error)
      updateConnections([])
    }
  }

  const syncNodeDataToWorkflow = (editor: any, nodeId: string) => {
    const nodeElement = document.querySelector(`[data-node="${nodeId}"]`)
    if (!nodeElement) return

    const nodeData: any = {}

    const textInputs = nodeElement.querySelectorAll('input[type="text"], textarea')
    textInputs.forEach((input: any, index) => {
      nodeData[`input_${index}`] = input.value
    })

    const selects = nodeElement.querySelectorAll("select")
    selects.forEach((select: any, index) => {
      nodeData[`model_${index}`] = select.value
    })

    if (nodeData.input_0) {
      nodeData.content = nodeData.input_0
    }

    console.log("[v0] Syncing node data:", nodeId, nodeData)
    updateNodeData(nodeId, nodeData)
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
          if (e.ctrlKey || e.metaKey) {
            nodeElement.classList.toggle("selected")
          } else {
            document.querySelectorAll(".drawflow-node.selected").forEach((node) => {
              node.classList.remove("selected")
            })
            nodeElement.classList.add("selected")
          }

          window.dispatchEvent(new CustomEvent("nodeSelected", { detail: { nodeId } }))
        }
      } else {
        document.querySelectorAll(".drawflow-node.selected").forEach((node) => {
          node.classList.remove("selected")
        })
      }
    })
  }

  const addNodeToCanvas = (editor: any, nodeData: any, x: number, y: number) => {
    const nodeId = `${nodeData.id}_${Date.now()}`

    const nodeHtml = createNodeHtml(nodeData, nodeId)

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

    addReactFlowNode(nodeId, nodeData.name, {
      x,
      y,
      type: nodeData.id,
      data: {
        label: nodeData.name,
        nodeType: nodeData.id,
        description: nodeData.description,
      },
    })

    setTimeout(() => {
      const nodeElement = document.querySelector(`[data-node="${nodeId}"]`)
      if (nodeElement) {
        const inputs = nodeElement.querySelectorAll("input, textarea, select")
        inputs.forEach((input: any) => {
          input.addEventListener("input", () => syncNodeDataToWorkflow(editor, nodeId))
          input.addEventListener("change", () => syncNodeDataToWorkflow(editor, nodeId))
        })
      }
    }, 100)
  }

  const createNodeHtml = (nodeData: any, nodeId: string) => {
    const getModelOptions = (nodeType: string) => {
      switch (nodeType) {
        case "text-generator":
          return `
            <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
            <option value="llama3-70b-8192">Llama 3 70B</option>
            <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
            <option value="gemma2-9b-it">Gemma 2 9B</option>
            <option value="openai/gpt-4o">GPT-4o (OpenRouter)</option>
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (OpenRouter)</option>
          `
        case "image-generator":
        case "logo-generator":
          return `
            <option value="openai/dall-e-3">DALL-E 3</option>
            <option value="openai/dall-e-2">DALL-E 2</option>
            <option value="stability-ai/sdxl">Stable Diffusion XL</option>
            <option value="midjourney/midjourney">Midjourney</option>
          `
        case "video-generator":
          return `
            <option value="openai/dall-e-3">DALL-E 3 (Image)</option>
            <option value="stability-ai/sdxl">Stable Diffusion XL</option>
            <option value="midjourney/midjourney">Midjourney</option>
          `
        case "audio-generator":
          return `
            <option value="tts-1">OpenAI TTS-1</option>
            <option value="tts-1-hd">OpenAI TTS-1 HD</option>
          `
        default:
          return `<option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>`
      }
    }

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
                        placeholder="Enter text..." data-input="text"></textarea>
            </div>
          </div>
        `

      case "text-generator":
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
              <div class="space-y-2">
                <label class="text-xs text-neutral-400 uppercase tracking-wider">Model</label>
                <select class="w-full bg-neutral-900 border border-neutral-600 p-2 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500" data-model="selection">
                  ${getModelOptions("text-generator")}
                </select>
              </div>
              <div class="w-full h-24 bg-neutral-900 border border-neutral-600 flex items-center justify-center text-xs text-neutral-400 hover:bg-neutral-800 transition-colors">
                <span class="input-preview">Waiting for input...</span>
              </div>
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
              <div class="space-y-2">
                <label class="text-xs text-neutral-400 uppercase tracking-wider">Model</label>
                <select class="w-full bg-neutral-900 border border-neutral-600 p-2 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500" data-model="selection">
                  ${getModelOptions(nodeData.id)}
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs text-neutral-400 uppercase tracking-wider">Quality</label>
                <select class="w-full bg-neutral-900 border border-neutral-600 p-2 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500" data-quality="selection">
                  <option value="standard">Standard</option>
                  <option value="hd">HD</option>
                </select>
              </div>
              <div class="w-full h-24 bg-neutral-900 border border-neutral-600 flex items-center justify-center text-xs text-neutral-400 hover:bg-neutral-800 transition-colors">
                <span class="input-preview">Waiting for input...</span>
              </div>
            </div>
          </div>
        `

      case "audio-generator":
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
              <div class="space-y-2">
                <label class="text-xs text-neutral-400 uppercase tracking-wider">Voice Model</label>
                <select class="w-full bg-neutral-900 border border-neutral-600 p-2 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500" data-model="selection">
                  ${getModelOptions("audio-generator")}
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs text-neutral-400 uppercase tracking-wider">Voice</label>
                <select class="w-full bg-neutral-900 border border-neutral-600 p-2 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500" data-voice="selection">
                  <option value="alloy">Alloy</option>
                  <option value="echo">Echo</option>
                  <option value="fable">Fable</option>
                  <option value="onyx">Onyx</option>
                  <option value="nova">Nova</option>
                  <option value="shimmer">Shimmer</option>
                </select>
              </div>
              <div class="w-full h-24 bg-neutral-900 border border-neutral-600 flex items-center justify-center text-xs text-neutral-400 hover:bg-neutral-800 transition-colors">
                <span class="input-preview">Waiting for input...</span>
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

  return (
    <div className="flex-1 relative overflow-hidden bg-black">
      <div className="w-full h-full overflow-auto drawflow-canvas">
        <div ref={canvasRef} className="min-w-full min-h-full" id="drawflow" />
      </div>
    </div>
  )
}
