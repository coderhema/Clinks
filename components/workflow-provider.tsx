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
}

const WorkflowContext = createContext<WorkflowContextType | null>(null)

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: "demo-1",
      type: "text-input",
      position: { x: 100, y: 100 },
      data: {
        label: "Text Input",
        content: "A beautiful sunset over mountains",
        config: { model: "llama-3.1-8b-instant" },
      },
    },
    {
      id: "demo-2",
      type: "image-gen",
      position: { x: 400, y: 100 },
      data: {
        label: "Image Generator",
        config: { model: "llama-3.1-8b-instant" },
      },
    },
  ])
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

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)
    setExecutionLogs([]) // Clear previous logs

    try {
      // Sort nodes by execution order (based on connections)
      const executionOrder = getExecutionOrder(nodes, connections)

      for (const nodeId of executionOrder) {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) continue

        const startLog = {
          nodeId,
          timestamp: new Date().toISOString(),
          type: node.type,
          status: "running",
          model: node.data.config?.model || "llama-3.1-8b-instant",
        }
        setExecutionLogs((prev) => [...prev, startLog])

        // Execute node based on type
        await executeNode(node)
      }
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

  const executeNode = async (node: WorkflowNode) => {
    try {
      let prompt = node.data.content || ""

      // Get input from connected nodes
      const inputConnections = connections.filter((conn) => conn.target === node.id)
      for (const conn of inputConnections) {
        const sourceNode = nodes.find((n) => n.id === conn.source)
        if (sourceNode?.data.content) {
          prompt = sourceNode.data.content
        }
      }

      let generationType = ""
      switch (node.type) {
        case "image-generator":
          generationType = "image-prompt"
          break
        case "video-generator":
          generationType = "video-prompt"
          break
        case "audio-generator":
          generationType = "audio-prompt"
          break
        case "logo-generator":
          generationType = "image-prompt"
          break
        case "text-input":
          generationType = "text"
          break
        default:
          return
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(node.data.config?.provider === "openrouter" && {
            "x-openrouter-key": localStorage.getItem("openrouter-api-key") || "",
          }),
        },
        body: JSON.stringify({
          type: generationType,
          prompt,
          nodeId: node.id,
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

      // Update node with result
      updateNode(node.id, {
        data: {
          ...node.data,
          content: result.result,
          preview: result.mockImage || result.mockVideo || result.mockAudio || result.result,
        },
      })
    } catch (error) {
      console.error(`Failed to execute node ${node.id}:`, error)
      setExecutionLogs((prev) => [
        ...prev,
        {
          nodeId: node.id,
          timestamp: new Date().toISOString(),
          status: "failed",
          error: error.message,
        },
      ])
    }
  }

  const getExecutionOrder = (nodes: WorkflowNode[], connections: WorkflowConnection[]): string[] => {
    // Simple topological sort for execution order
    const visited = new Set<string>()
    const order: string[] = []

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)

      // Visit dependencies first
      const dependencies = connections.filter((conn) => conn.target === nodeId).map((conn) => conn.source)

      dependencies.forEach(visit)
      order.push(nodeId)
    }

    nodes.forEach((node) => visit(node.id))
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
