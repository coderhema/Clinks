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
    generatedType?: string
    result?: any
    isExecuting?: boolean
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
  addNode: (node: Omit<WorkflowNode, "id">) => string
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void
  deleteNode: (id: string) => void
  addConnection: (connection: Omit<WorkflowConnection, "id">) => void
  deleteConnection: (id: string) => void
  selectedNode: WorkflowNode | null
  setSelectedNode: (node: WorkflowNode | null) => void
  exportWorkflow: (name?: string) => WorkflowData
  importWorkflow: (workflowData: WorkflowData) => void
  clearWorkflow: () => void
  addReactFlowNode: (type: string, label: string, position?: { x: number; y: number }) => string
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
    return newNode.id
  }, [])

  const addReactFlowNode = useCallback(
    (type: string, label: string, position = { x: 200, y: 200 }) => {
      return addNode({
        type: type as WorkflowNode["type"],
        position,
        data: {
          label,
          config: { model: "llama-3.1-8b-instant" },
        },
      })
    },
    [addNode],
  )

  const updateNode = useCallback((id: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === id) {
          const updatedNode = {
            ...node,
            ...updates,
            // Always preserve the original position unless explicitly updating it
            position: updates.position || node.position,
            data: {
              ...node.data,
              ...updates.data,
              config: {
                ...node.data.config,
                ...updates.data?.config,
              },
            },
          }

          if (updatedNode.position && (isNaN(updatedNode.position.x) || isNaN(updatedNode.position.y))) {
            console.warn(`[v0] Invalid position detected for node ${id}, preserving original position`)
            updatedNode.position = node.position
          }

          return updatedNode
        }
        return node
      }),
    )
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
      const executionOrder = getExecutionOrder(nodes, connections)
      const nodeResults = new Map<string, any>()

      for (const nodeId of executionOrder) {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) continue

        const startLog = {
          nodeId,
          timestamp: new Date().toISOString(),
          type: node.type,
          status: "running",
          model: `${node.data.config?.model || "llama-3.1-8b-instant"}`,
          input: node.data.content || "No input",
        }
        setExecutionLogs((prev) => [...prev, startLog])

        const result = await executeNode(node, nodeResults, connections)
        if (result) {
          nodeResults.set(nodeId, result)
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
      if (process.env.NODE_ENV === "development") {
        console.error("Workflow execution failed:", error)
      }
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
          } else if (sourceResult && sourceResult.content) {
            prompt = sourceResult.content
          } else if (sourceResult && sourceResult.text) {
            prompt = sourceResult.text
          } else if (sourceResult && sourceResult.result) {
            prompt = sourceResult.result
          }

          console.log(`[v0] Node ${node.id} received input: "${String(prompt).substring(0, 100)}..."`)
        }
      }

      if (node.type === "text-input") {
        const textContent = node.data.content || prompt
        console.log(`[v0] Text input node ${node.id} content: "${textContent}"`)

        if (!textContent || String(textContent).trim() === "") {
          const errorLog = {
            nodeId: node.id,
            timestamp: new Date().toISOString(),
            status: "failed",
            error: "No text content provided - enter text in the input field",
            nodeData: node.data,
          }
          setExecutionLogs((prev) => [...prev, errorLog])
          return null
        }

        const successLog = {
          nodeId: node.id,
          timestamp: new Date().toISOString(),
          status: "completed",
          result: textContent,
          inputTokens: String(textContent).split(" ").length,
        }
        setExecutionLogs((prev) => [...prev, successLog])

        updateNode(node.id, {
          data: {
            ...node.data,
            content: textContent,
            result: textContent,
            preview: String(textContent).substring(0, 100) + (String(textContent).length > 100 ? "..." : ""),
          },
        })

        return textContent
      }

      if (node.type === "image-input") {
        const imageContent = node.data.content || ""
        if (!imageContent) {
          const errorLog = {
            nodeId: node.id,
            timestamp: new Date().toISOString(),
            status: "failed",
            error: "No image uploaded - please upload a PNG or JPG file",
          }
          setExecutionLogs((prev) => [...prev, errorLog])
          return null
        }

        const successLog = {
          nodeId: node.id,
          timestamp: new Date().toISOString(),
          status: "completed",
          result: "Image uploaded successfully",
          imageUrl: imageContent,
        }
        setExecutionLogs((prev) => [...prev, successLog])

        return imageContent
      }

      if (node.type === "output") {
        if (!inputData) {
          const errorLog = {
            nodeId: node.id,
            timestamp: new Date().toISOString(),
            status: "failed",
            error: "No input connected to output node",
          }
          setExecutionLogs((prev) => [...prev, errorLog])
          return null
        }

        const successLog = {
          nodeId: node.id,
          timestamp: new Date().toISOString(),
          status: "completed",
          result: `Output ready for export`,
          outputType: typeof inputData,
          contentLength: typeof inputData === "string" ? inputData.length : "N/A",
        }
        setExecutionLogs((prev) => [...prev, successLog])

        updateNode(node.id, {
          data: {
            ...node.data,
            content: inputData,
            result: inputData,
            preview: `Ready to export: ${typeof inputData}`,
          },
        })

        return inputData
      }

      if (!prompt || String(prompt).trim() === "") {
        const errorLog = {
          nodeId: node.id,
          timestamp: new Date().toISOString(),
          status: "failed",
          error: inputConnections.length > 0 ? "No input received from connected node" : "No input prompt provided",
          model: `${node.data.config?.model || "No model selected"}`,
          nodeContent: node.data.content,
          inputConnections: inputConnections.length,
        }
        setExecutionLogs((prev) => [...prev, errorLog])
        return null
      }

      let generationType = ""
      switch (node.type) {
        case "image-generator":
        case "logo-generator":
          generationType = "image"
          break
        case "video-generator":
          generationType = "video"
          break
        case "audio-generator":
          generationType = "audio"
          break
        case "text-generator":
          generationType = "text"
          break
        default:
          generationType = "text"
      }

      console.log(
        `[v0] Generating ${generationType} for node ${node.id} with prompt: "${String(prompt).substring(0, 50)}..."`,
      )

      updateNode(node.id, {
        data: {
          ...node.data,
          isExecuting: true,
        },
      })

      const nodeConfig = node.data.config || {}

      // Validate config before use - ensure all values are proper strings or have defaults
      const validateConfigValue = (value: any, defaultValue: string): string => {
        if (value === null || value === undefined || value === "") {
          return defaultValue
        }
        return String(value)
      }

      // Set safe defaults for all config values based on generation type
      let defaultModel = "llama-3.1-8b-instant"
      const defaultVoice = "Aaliyah-PlayAI"

      if (generationType === "audio") {
        defaultModel = "playai-tts"
        // Validate TTS model is present and valid
        if (!nodeConfig.model || typeof nodeConfig.model !== "string" || nodeConfig.model.trim() === "") {
          console.log(`[v0] Audio node missing model, using default: ${defaultModel}`)
        }
      }

      const requestConfig = {
        model: validateConfigValue(nodeConfig.model, defaultModel),
        maxTokens: nodeConfig.maxTokens || 500,
        temperature: nodeConfig.temperature || 0.7,
        provider: validateConfigValue(nodeConfig.provider, "groq"),
        voice: validateConfigValue(nodeConfig.voice, defaultVoice),
        ...nodeConfig,
      }

      // Additional validation for audio generation
      if (generationType === "audio") {
        if (!requestConfig.model || requestConfig.model === "") {
          throw new Error("TTS model is missing or invalid")
        }
        if (!requestConfig.voice || requestConfig.voice === "") {
          requestConfig.voice = defaultVoice
        }
        console.log(`[v0] Audio config validated - Model: ${requestConfig.model}, Voice: ${requestConfig.voice}`)
      }

      console.log(`[v0] Request config:`, requestConfig)

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: generationType,
          prompt: String(prompt),
          nodeId: node.id,
          inputData,
          config: requestConfig,
        }),
      })

      const result = await response.json()
      console.log(`[v0] API response for node ${node.id}:`, result)

      if (result.log) {
        setExecutionLogs((prev) => [...prev, result.log])
      }

      const processedResult = result.result
      let previewText = "Generated content"

      if (processedResult) {
        if (typeof processedResult === "string") {
          previewText = processedResult.substring(0, 100) + (processedResult.length > 100 ? "..." : "")
        } else if (processedResult && typeof processedResult === "object") {
          // Handle audio/video/image objects
          if (processedResult.audioUrl) {
            previewText = `Audio generated (${processedResult.voice || "default voice"})`
          } else if (processedResult.type === "image" || processedResult.type === "video") {
            previewText = `${processedResult.type} generated successfully`
          } else {
            previewText = "Generated content (object)"
          }
        }
      }

      updateNode(node.id, {
        data: {
          ...node.data,
          isExecuting: false,
          result: processedResult,
          content: processedResult,
          preview: previewText,
        },
      })

      if (response.ok && processedResult) {
        console.log(`[v0] Node ${node.id} generated successfully: ${typeof processedResult}`)
        return processedResult
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (error) {
      console.error(`Failed to execute node ${node.id}:`, error)

      updateNode(node.id, {
        data: {
          ...node.data,
          isExecuting: false,
        },
      })

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

      const dependencies = connections.filter((conn) => conn.target === nodeId).map((conn) => conn.source)

      dependencies.forEach(visit)

      visiting.delete(nodeId)
      visited.add(nodeId)
      order.push(nodeId)
    }

    const sourceNodes = nodes.filter((node) => !connections.some((conn) => conn.target === node.id))

    const startNodes = sourceNodes.length > 0 ? sourceNodes : nodes

    startNodes.forEach((node) => visit(node.id))

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
