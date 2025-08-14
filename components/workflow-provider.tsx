"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useNodeExecutionEngine } from "./node-execution-engine"

export interface WorkflowNode {
  id: string
  type: "text-input" | "image-input" | "image-gen" | "video-gen" | "audio-gen" | "output"
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
  executionResults: any[]
  getNodeStatus: (nodeId: string) => string
}

const WorkflowContext = createContext<WorkflowContextType | null>(null)

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: "demo-1",
      type: "text-input",
      position: { x: 100, y: 100 },
      data: { label: "Text Input", content: "A beautiful sunset over mountains" },
    },
    {
      id: "demo-2",
      type: "image-gen",
      position: { x: 400, y: 100 },
      data: { label: "Image Generator" },
    },
  ])
  const [connections, setConnections] = useState<WorkflowConnection[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)

  const { executeWorkflow: executeWithEngine, executionResults, isExecuting, getNodeStatus } = useNodeExecutionEngine()

  const addNode = useCallback((node: Omit<WorkflowNode, "id">) => {
    const newNode: WorkflowNode = {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setNodes((prev) => [...prev, newNode])
  }, [])

  const addReactFlowNode = useCallback((type: string, label: string, position = { x: 200, y: 200 }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as WorkflowNode["type"],
      position,
      data: { label },
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
    try {
      // Get settings from localStorage
      const savedSettings = localStorage.getItem("workflow-settings")
      const settings = savedSettings
        ? JSON.parse(savedSettings)
        : {
            apiProvider: "groq",
            temperature: 0.7,
            maxTokens: 500,
            apiKeys: {},
          }

      await executeWithEngine(nodes, connections, settings)

      // Update nodes with execution results
      executionResults.forEach((result) => {
        if (result.status === "completed" && result.result) {
          updateNode(result.nodeId, {
            data: {
              ...nodes.find((n) => n.id === result.nodeId)?.data,
              content: result.result.content,
              preview: result.result.preview,
            },
          })
        }
      })
    } catch (error) {
      console.error("Workflow execution failed:", error)
    }
  }, [nodes, connections, executeWithEngine, executionResults, updateNode])

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
        executionResults,
        getNodeStatus,
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
