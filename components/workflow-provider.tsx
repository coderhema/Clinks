"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export interface WorkflowNode {
  id: string
  type:
    | "text-input"
    | "image-input"
    | "image-gen"
    | "video-gen"
    | "audio-gen"
    | "output"
    | "image-generator"
    | "video-generator"
    | "audio-generator"
    | "logo-generator"
    | "text-generator"
  position: { x: number; y: number }
  data: {
    label: string
    config?: Record<string, any>
    preview?: string
    content?: string
  }
}

export interface WorkflowConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface WorkflowData {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  metadata: {
    name: string
    description?: string
    createdAt: string
    updatedAt: string
    version: string
  }
}

interface WorkflowContextType {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  addNode: (node: Omit<WorkflowNode, "id">) => void
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void
  deleteNode: (id: string) => void
  addConnection: (connection: Omit<WorkflowConnection, "id">) => void
  deleteConnection: (id: string) => void
  selectedNode: WorkflowNode | null
  setSelectedNode: (node: WorkflowNode | null) => void
  exportWorkflow: (name?: string) => WorkflowData
  importWorkflow: (workflowData: WorkflowData) => void
  clearWorkflow: () => void
  addReactFlowNode: (type: string, label: string, position?: { x: number; y: number }) => void
  executeWorkflow: () => Promise<void>
  isExecuting: boolean
  executionLogs: any[]
  clearLogs: () => void
  updateConnections: (
    connections: Array<{ source: string; target: string; sourceHandle: string; targetHandle: string }>,
  ) => void
  updateNodeData: (nodeId: string, data: any) => void
}

const WorkflowContext = createContext<WorkflowContextType | null>(null)

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<WorkflowConnection[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionLogs, setExecutionLogs] = useState<any[]>([])

  const addNode = useCallback((node: Omit<WorkflowNode, "id">) => {
    const newNode: WorkflowNode = {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: {
        ...node.data,
        config: {
          model: "llama-3.1-8b-instant", // Default model
          ...node.data.config,
        },
      },
    }
    setNodes((prev) => [...prev, newNode])
  }, [])

  const addReactFlowNode = useCallback((type: string, label: string, position = { x: 200, y: 200 }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as WorkflowNode["type"],
      position,
      data: {
        label,
        config: { model: "llama-3.1-8b-instant" }, // Default model
      },
    }
    setNodes((prev) => [...prev, newNode])
  }, [])

  const updateNode = useCallback((id: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, ...updates } : node)))
  }, [])

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id))
    setConnections((prev) => prev.filter((conn) => conn.source !== id && conn.target !== id))
  }, [])

  const addConnection = useCallback((connection: Omit<WorkflowConnection, "id">) => {
    const newConnection: WorkflowConnection = {
      ...connection,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setConnections((prev) => [...prev, newConnection])
  }, [])

  const deleteConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id))
  }, [])

  const updateConnections = useCallback(
    (drawflowConnections: Array<{ source: string; target: string; sourceHandle: string; targetHandle: string }>) => {
      const newConnections: WorkflowConnection[] = drawflowConnections.map((conn, index) => ({
        id: `conn-${Date.now()}-${index}`,
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
      }))
      setConnections(newConnections)
    },
    [],
  )

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              content: data.content || data.input_0 || node.data.content,
              config: {
                ...node.data.config,
                model: data.model_0 || node.data.config?.model,
              },
            },
          }
        }
        return node
      }),
    )
  }, [])

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)
    setExecutionLogs([])

    try {
      // Extract current data from visual nodes before execution
      const visualNodes = document.querySelectorAll(".drawflow-node")
      const nodeDataMap = new Map<string, any>()

      visualNodes.forEach((nodeElement) => {
        const nodeId = nodeElement.getAttribute("data-node")
        if (!nodeId) return

        const nodeData: any = { inputs: [], models: [] }

        // Extract text inputs and textareas
        const textInputs = nodeElement.querySelectorAll('input[type="text"], textarea')
        textInputs.forEach((input: any) => {
          if (input.value && input.value.trim()) {
            nodeData.inputs.push(input.value.trim())
          }
        })

        // Extract model selections
        const selects = nodeElement.querySelectorAll("select")
        selects.forEach((select: any) => {
          if (select.value) {
            nodeData.models.push(select.value)
          }
        })

        // Set primary content and model
        nodeData.content = nodeData.inputs[0] || ""
        nodeData.model = nodeData.models[0] || "llama-3.1-8b-instant"

        nodeDataMap.set(nodeId, nodeData)
      })

      // Update nodes with extracted visual data
      setNodes((prev) =>
        prev.map((node) => {
          const visualData = nodeDataMap.get(node.id)
          if (visualData) {
            return {
              ...node,
              data: {
                ...node.data,
                content: visualData.content || node.data.content,
                config: {
                  ...node.data.config,
                  model: visualData.model || node.data.config?.model,
                },
              },
            }
          }
          return node
        }),
      )

      // Execute workflow with updated data
      const executionOrder = getExecutionOrder(nodes, connections)
      const nodeResults = new Map<string, any>()

      for (const nodeId of executionOrder) {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) continue

        // Use visual data if available
        const visualData = nodeDataMap.get(nodeId)
        const nodeWithVisualData = visualData
          ? {
              ...node,
              data: {
                ...node.data,
                content: visualData.content || node.data.content,
                config: {
                  ...node.data.config,
                  model: visualData.model || node.data.config?.model,
                },
              },
            }
          : node

        const startLog = {
          nodeId,
          timestamp: new Date().toISOString(),
          type: nodeWithVisualData.type,
          status: "running",
          model: nodeWithVisualData.data.config?.model || "llama-3.1-8b-instant",
          input: nodeWithVisualData.data.content || "No input",
        }
        setExecutionLogs((prev) => [...prev, startLog])

        const result = await executeNode(nodeWithVisualData, nodeResults, connections)
        if (result) {
          nodeResults.set(nodeId, result)

          // Update visual preview in real-time
          const previewElement = document.querySelector(`[data-node="${nodeId}"] .input-preview`)
          if (previewElement) {
            if (typeof result === "string") {
              previewElement.textContent = `Generated: ${result.substring(0, 40)}${result.length > 40 ? "..." : ""}`
            } else {
              previewElement.textContent = "Generated successfully"
            }
          }
        }
      }

      const completionLog = {
        nodeId: "workflow",
        timestamp: new Date().toISOString(),
        status: "completed",
        message: `Workflow completed successfully. Processed ${executionOrder.length} nodes.`,
      }
      setExecutionLogs((prev) => [...prev, completionLog])
    } catch (error) {
      console.error("Workflow execution failed:", error)
      setExecutionLogs((prev) => [
        ...prev,
        {
          nodeId: "workflow",
          timestamp: new Date().toISOString(),
          status: "failed",
          error: error.message,
        },
      ])
    } finally {
      setIsExecuting(false)
    }
  }, [nodes, connections])

  const executeNode = async (node: WorkflowNode, nodeResults: Map<string, any>, connections: WorkflowConnection[]) => {
    try {
      let inputData: any = null
      let prompt = node.data.content || ""

      const inputConnections = connections.filter((conn) => conn.target === node.id)

      if (inputConnections.length > 0) {
        const sourceConnection = inputConnections[0]
        const sourceResult = nodeResults.get(sourceConnection.source)

        if (sourceResult) {
          inputData = sourceResult
          if (typeof sourceResult === "string") {
            prompt = sourceResult
          } else if (sourceResult.content) {
            prompt = sourceResult.content
          } else if (sourceResult.text) {
            prompt = sourceResult.text
          }

          // Update visual preview with connected input
          const previewElement = document.querySelector(`[data-node="${node.id}"] .input-preview`)
          if (previewElement) {
            previewElement.textContent = `Input: ${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}`
          }
        }
      }

      if (node.type === "text-input") {
        const textContent = node.data.content || prompt
        if (!textContent || textContent.trim() === "") {
          const errorLog = {
            nodeId: node.id,
            timestamp: new Date().toISOString(),
            status: "failed",
            error: "No text content provided",
          }
          setExecutionLogs((prev) => [...prev, errorLog])
          return null
        }

        const successLog = {
          nodeId: node.id,
          timestamp: new Date().toISOString(),
          status: "completed",
          result: textContent,
          inputTokens: textContent.split(" ").length,
        }
        setExecutionLogs((prev) => [...prev, successLog])

        updateNode(node.id, {
          data: {
            ...node.data,
            content: textContent,
            preview: textContent.substring(0, 100) + (textContent.length > 100 ? "..." : ""),
          },
        })

        return textContent
      }

      if (!prompt || prompt.trim() === "") {
        const errorLog = {
          nodeId: node.id,
          timestamp: new Date().toISOString(),
          status: "failed",
          error: inputConnections.length > 0 ? "No input received from connected node" : "No input prompt provided",
          model: node.data.config?.model || "No model selected",
        }
        setExecutionLogs((prev) => [...prev, errorLog])
        return null
      }

      let generationType = ""
      switch (node.type) {
        case "image-generator":
        case "logo-generator":
          generationType = "image-prompt"
          break
        case "video-generator":
          generationType = "video-prompt"
          break
        case "audio-generator":
          generationType = "audio-prompt"
          break
        case "text-generator":
          generationType = "text"
          break
        default:
          generationType = "text"
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: generationType,
          prompt,
          nodeId: node.id,
          inputData,
          config: {
            model: node.data.config?.model || "llama-3.1-8b-instant",
            maxTokens: node.data.config?.maxTokens || 500,
            temperature: node.data.config?.temperature || 0.7,
            provider: node.data.config?.provider || "groq",
            ...node.data.config,
          },
        }),
      })

      const result = await response.json()

      if (result.log) {
        setExecutionLogs((prev) => [...prev, result.log])
      }

      if (response.ok && result.result) {
        updateNode(node.id, {
          data: {
            ...node.data,
            content: result.result,
            preview: result.result,
          },
        })

        return result.result
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (error) {
      console.error(`Failed to execute node ${node.id}:`, error)
      setExecutionLogs((prev) => [
        ...prev,
        {
          nodeId: node.id,
          timestamp: new Date().toISOString(),
          status: "failed",
          error: error.message,
          model: node.data.config?.model || "Unknown model",
        },
      ])
      return null
    }
  }

  const getExecutionOrder = (nodes: WorkflowNode[], connections: WorkflowConnection[]): string[] => {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (nodeId: string) => {
      if (visiting.has(nodeId)) {
        throw new Error(`Circular dependency detected involving node ${nodeId}`)
      }
      if (visited.has(nodeId)) return

      visiting.add(nodeId)

      // Visit all dependencies (input nodes) first
      const dependencies = connections.filter((conn) => conn.target === nodeId).map((conn) => conn.source)

      dependencies.forEach(visit)

      visiting.delete(nodeId)
      visited.add(nodeId)
      order.push(nodeId)
    }

    // Start with nodes that have no inputs (source nodes)
    const sourceNodes = nodes.filter((node) => !connections.some((conn) => conn.target === node.id))

    // If no source nodes, start with all nodes
    const startNodes = sourceNodes.length > 0 ? sourceNodes : nodes

    startNodes.forEach((node) => visit(node.id))

    // Visit any remaining unvisited nodes
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        visit(node.id)
      }
    })

    return order
  }

  const exportWorkflow = useCallback(
    (name = "Untitled Workflow"): WorkflowData => {
      const now = new Date().toISOString()
      return {
        nodes,
        connections,
        metadata: {
          name,
          description: `AI workflow with ${nodes.length} nodes and ${connections.length} connections`,
          createdAt: now,
          updatedAt: now,
          version: "1.0.0",
        },
      }
    },
    [nodes, connections],
  )

  const importWorkflow = useCallback((workflowData: WorkflowData) => {
    setNodes(workflowData.nodes)
    setConnections(workflowData.connections)
    setSelectedNode(null)
  }, [])

  const clearWorkflow = useCallback(() => {
    setNodes([])
    setConnections([])
    setSelectedNode(null)
  }, [])

  const clearLogs = useCallback(() => {
    setExecutionLogs([])
  }, [])

  return (
    <WorkflowContext.Provider
      value={{
        nodes,
        connections,
        addNode,
        updateNode,
        deleteNode,
        addConnection,
        deleteConnection,
        selectedNode,
        setSelectedNode,
        exportWorkflow,
        importWorkflow,
        clearWorkflow,
        addReactFlowNode,
        executeWorkflow,
        isExecuting,
        executionLogs,
        clearLogs,
        updateConnections,
        updateNodeData,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}
