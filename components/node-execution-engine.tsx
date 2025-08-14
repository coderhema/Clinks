"use client"

import { useState, useCallback } from "react"
import type { WorkflowNode, WorkflowConnection } from "./workflow-provider"

export interface NodeExecutionResult {
  nodeId: string
  status: "pending" | "running" | "completed" | "error"
  result?: any
  error?: string
  startTime?: number
  endTime?: number
}

export interface ExecutionContext {
  settings: any
  nodeResults: Map<string, NodeExecutionResult>
  connections: WorkflowConnection[]
}

export class NodeExecutionEngine {
  private executionResults = new Map<string, NodeExecutionResult>()
  private executionListeners: ((results: NodeExecutionResult[]) => void)[] = []

  constructor() {}

  addExecutionListener(listener: (results: NodeExecutionResult[]) => void) {
    this.executionListeners.push(listener)
  }

  removeExecutionListener(listener: (results: NodeExecutionResult[]) => void) {
    this.executionListeners = this.executionListeners.filter((l) => l !== listener)
  }

  private notifyListeners() {
    const results = Array.from(this.executionResults.values())
    this.executionListeners.forEach((listener) => listener(results))
  }

  private updateNodeResult(nodeId: string, update: Partial<NodeExecutionResult>) {
    const existing = this.executionResults.get(nodeId) || {
      nodeId,
      status: "pending" as const,
    }

    this.executionResults.set(nodeId, { ...existing, ...update })
    this.notifyListeners()
  }

  async executeWorkflow(
    nodes: WorkflowNode[],
    connections: WorkflowConnection[],
    settings: any,
  ): Promise<NodeExecutionResult[]> {
    // Reset execution results
    this.executionResults.clear()

    // Initialize all nodes as pending
    nodes.forEach((node) => {
      this.updateNodeResult(node.id, { status: "pending" })
    })

    const context: ExecutionContext = {
      settings,
      nodeResults: this.executionResults,
      connections,
    }

    try {
      const executionOrder = this.getExecutionOrder(nodes, connections)

      for (const nodeId of executionOrder) {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) continue

        await this.executeNode(node, context)
      }

      return Array.from(this.executionResults.values())
    } catch (error) {
      console.error("Workflow execution failed:", error)
      throw error
    }
  }

  private async executeNode(node: WorkflowNode, context: ExecutionContext): Promise<void> {
    this.updateNodeResult(node.id, {
      status: "running",
      startTime: Date.now(),
    })

    try {
      let result: any

      switch (node.type) {
        case "text-input":
          result = await this.executeTextInputNode(node, context)
          break
        case "image-input":
          result = await this.executeImageInputNode(node, context)
          break
        case "image-gen":
          result = await this.executeImageGenNode(node, context)
          break
        case "video-gen":
          result = await this.executeVideoGenNode(node, context)
          break
        case "audio-gen":
          result = await this.executeAudioGenNode(node, context)
          break
        case "output":
          result = await this.executeOutputNode(node, context)
          break
        default:
          throw new Error(`Unknown node type: ${node.type}`)
      }

      this.updateNodeResult(node.id, {
        status: "completed",
        result,
        endTime: Date.now(),
      })
    } catch (error) {
      this.updateNodeResult(node.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        endTime: Date.now(),
      })
      throw error
    }
  }

  private async executeTextInputNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    // Text input nodes just pass through their content
    return {
      type: "text",
      content: node.data.content || "",
      preview: node.data.content || "",
    }
  }

  private async executeImageInputNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    // Image input nodes pass through their image data
    return {
      type: "image",
      content: node.data.content || "",
      preview: node.data.preview || "",
    }
  }

  private async executeImageGenNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const inputData = this.getNodeInputData(node.id, context)
    const prompt = inputData?.content || node.data.content || ""

    if (!prompt) {
      throw new Error("No prompt provided for image generation")
    }

    return await this.callGenerationAPI("image-prompt", prompt, context)
  }

  private async executeVideoGenNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const inputData = this.getNodeInputData(node.id, context)
    const prompt = inputData?.content || node.data.content || ""

    if (!prompt) {
      throw new Error("No prompt provided for video generation")
    }

    return await this.callGenerationAPI("video-prompt", prompt, context)
  }

  private async executeAudioGenNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const inputData = this.getNodeInputData(node.id, context)
    const prompt = inputData?.content || node.data.content || ""

    if (!prompt) {
      throw new Error("No prompt provided for audio generation")
    }

    return await this.callGenerationAPI("audio-prompt", prompt, context)
  }

  private async executeOutputNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const inputData = this.getNodeInputData(node.id, context)

    return {
      type: "output",
      content: inputData?.content || "",
      preview: inputData?.preview || "",
      finalResult: true,
    }
  }

  private getNodeInputData(nodeId: string, context: ExecutionContext): any {
    // Find connections that target this node
    const inputConnections = context.connections.filter((conn) => conn.target === nodeId)

    if (inputConnections.length === 0) return null

    // For now, just use the first input connection
    const sourceConnection = inputConnections[0]
    const sourceResult = context.nodeResults.get(sourceConnection.source)

    return sourceResult?.result
  }

  private async callGenerationAPI(type: string, prompt: string, context: ExecutionContext): Promise<any> {
    const config = {
      provider: context.settings.apiProvider || "groq",
      temperature: context.settings.temperature || 0.7,
      maxTokens: context.settings.maxTokens || 500,
      apiKey: context.settings.apiKeys?.[context.settings.apiProvider],
    }

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        prompt,
        config,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Generation failed")
    }

    const result = await response.json()

    return {
      type: result.type,
      content: result.result,
      preview: result.mockImage || result.mockVideo || result.mockAudio || result.result,
    }
  }

  private getExecutionOrder(nodes: WorkflowNode[], connections: WorkflowConnection[]): string[] {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return
      if (visiting.has(nodeId)) {
        throw new Error("Circular dependency detected in workflow")
      }

      visiting.add(nodeId)

      // Visit dependencies first
      const dependencies = connections.filter((conn) => conn.target === nodeId).map((conn) => conn.source)

      dependencies.forEach(visit)

      visiting.delete(nodeId)
      visited.add(nodeId)
      order.push(nodeId)
    }

    nodes.forEach((node) => visit(node.id))
    return order
  }
}

// Hook for using the execution engine
export function useNodeExecutionEngine() {
  const [executionResults, setExecutionResults] = useState<NodeExecutionResult[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [engine] = useState(() => new NodeExecutionEngine())

  const executeWorkflow = useCallback(
    async (nodes: WorkflowNode[], connections: WorkflowConnection[], settings: any) => {
      setIsExecuting(true)
      try {
        const results = await engine.executeWorkflow(nodes, connections, settings)
        setExecutionResults(results)
        return results
      } finally {
        setIsExecuting(false)
      }
    },
    [engine],
  )

  // Subscribe to execution updates
  useState(() => {
    const listener = (results: NodeExecutionResult[]) => {
      setExecutionResults([...results])
    }
    engine.addExecutionListener(listener)
    return () => engine.removeExecutionListener(listener)
  })

  return {
    executeWorkflow,
    executionResults,
    isExecuting,
    getNodeStatus: (nodeId: string) => executionResults.find((r) => r.nodeId === nodeId)?.status || "pending",
  }
}
