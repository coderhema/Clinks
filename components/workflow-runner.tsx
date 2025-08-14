"use client"

import { useState, useEffect } from "react"
import { useWorkflow } from "./workflow-provider"
import { Button } from "./ui/button"
import {
  Play,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Download,
  AlertTriangle,
} from "lucide-react"

interface ExecutionLog {
  id: string
  timestamp: number
  nodeId: string
  nodeName: string
  status: "running" | "completed" | "error"
  duration?: number
  error?: string
  result?: any
}

export function WorkflowRunner() {
  const {
    nodes,
    connections,
    executeWorkflow,
    isExecuting,
    executionResults,
    getNodeStatus,
    clearWorkflow,
    addNode,
    addConnection,
  } = useWorkflow()

  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedResult, setSelectedResult] = useState<any>(null)

  // Update execution logs when execution results change
  useEffect(() => {
    const newLogs: ExecutionLog[] = executionResults.map((result) => {
      const node = nodes.find((n) => n.id === result.nodeId)
      return {
        id: result.nodeId,
        timestamp: result.startTime || Date.now(),
        nodeId: result.nodeId,
        nodeName: node?.data.label || "Unknown Node",
        status: result.status === "completed" ? "completed" : result.status === "error" ? "error" : "running",
        duration: result.endTime && result.startTime ? result.endTime - result.startTime : undefined,
        error: result.error,
        result: result.result,
      }
    })
    setExecutionLogs(newLogs)
  }, [executionResults, nodes])

  const handleRunWorkflow = async () => {
    if (nodes.length === 0) {
      alert("Add some nodes to your workflow first!")
      return
    }

    const drawflowContainer = document.getElementById("drawflow")
    if (drawflowContainer && window.drawflowInstance) {
      const drawflowData = window.drawflowInstance.export()

      // Convert drawflow data to workflow provider format
      const convertedNodes: any[] = []
      const convertedConnections: any[] = []

      if (drawflowData.drawflow?.Home?.data) {
        Object.entries(drawflowData.drawflow.Home.data).forEach(([nodeId, nodeInfo]: [string, any]) => {
          // Extract content from node HTML or data
          let content = nodeInfo.data?.content || ""

          // Try to extract content from textarea in the node HTML
          if (nodeInfo.html) {
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = nodeInfo.html
            const textarea = tempDiv.querySelector("textarea")
            if (textarea && textarea.value) {
              content = textarea.value
            }
          }

          // Also check the actual DOM element for current textarea value
          const nodeElement = document.querySelector(`[data-node="${nodeId}"]`)
          if (nodeElement) {
            const textarea = nodeElement.querySelector("textarea")
            if (textarea && textarea.value) {
              content = textarea.value
            }
          }

          convertedNodes.push({
            id: nodeId,
            type: nodeInfo.data?.id || "text-input",
            position: { x: nodeInfo.pos_x || 0, y: nodeInfo.pos_y || 0 },
            data: {
              label: nodeInfo.data?.name || "Node",
              content: content,
              ...nodeInfo.data,
            },
          })

          // Convert connections
          if (nodeInfo.outputs) {
            Object.entries(nodeInfo.outputs).forEach(([outputKey, outputData]: [string, any]) => {
              if (outputData.connections) {
                outputData.connections.forEach((conn: any) => {
                  convertedConnections.push({
                    id: `conn-${nodeId}-${conn.node}`,
                    source: nodeId,
                    target: conn.node,
                    sourceHandle: outputKey,
                    targetHandle: conn.input,
                  })
                })
              }
            })
          }
        })
      }

      // Update the workflow provider with converted data
      if (convertedNodes.length > 0) {
        // Clear existing nodes and add converted ones
        clearWorkflow()
        convertedNodes.forEach((node) => {
          addNode(node)
        })
        convertedConnections.forEach((conn) => {
          addConnection(conn)
        })
      }
    }

    setExecutionLogs([])
    setShowResults(false)
    await executeWorkflow()
    setShowResults(true)
  }

  const handleStopExecution = () => {
    // In a real implementation, this would cancel the execution
    console.log("Stopping execution...")
  }

  const handleRetryExecution = async () => {
    await handleRunWorkflow()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "border-blue-400 bg-blue-400/10"
      case "completed":
        return "border-green-400 bg-green-400/10"
      case "error":
        return "border-red-400 bg-red-400/10"
      case "pending":
        return "border-gray-400 bg-gray-400/10"
      default:
        return "border-gray-400 bg-gray-400/10"
    }
  }

  const completedNodes = executionLogs.filter((log) => log.status === "completed").length
  const errorNodes = executionLogs.filter((log) => log.status === "error").length
  const totalNodes = nodes.length

  return (
    <div className="w-80 bg-black border-l border-white/10 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-3">
          
          Workflow Runner
        </h2>

        {/* Control Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={handleRunWorkflow}
            disabled={isExecuting}
            className={`flex-1 transition-all duration-300 hover:scale-105 shadow-2xl font-semibold px-6 py-2.5 hover:shadow-white/20 rounded-none text-white border border-dashed ${
              isExecuting
                ? "bg-green-600 border-green-600 hover:bg-green-700"
                : "bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
            }`}
            data-workflow-run-button
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            {isExecuting ? "Running..." : "Run Workflow"}
          </Button>

          {isExecuting && (
            <Button
              onClick={handleStopExecution}
              className="bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-200"
            >
              <Square className="w-4 h-4" />
            </Button>
          )}

          {!isExecuting && executionLogs.length > 0 && (
            <Button
              onClick={handleRetryExecution}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200 rounded-none"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Progress Summary */}
        {totalNodes > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Progress</span>
              <span>
                {completedNodes}/{totalNodes} nodes
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full">
              <div
                className="bg-green-500 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${(completedNodes / totalNodes) * 100}%` }}
              />
            </div>
            {errorNodes > 0 && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {errorNodes} node{errorNodes > 1 ? "s" : ""} failed
              </div>
            )}
          </div>
        )}
      </div>

      {/* Execution Logs */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-white font-semibold mb-3">Execution Log</h3>

          {executionLogs.length === 0 && !isExecuting && (
            <div className="text-center text-gray-400 py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No execution history</p>
              <p className="text-sm">Run your workflow to see progress</p>
            </div>
          )}

          <div className="space-y-2">
            {executionLogs.map((log) => (
              <div
                key={log.id}
                className={`border p-3 transition-all duration-200 rounded-none ${getStatusColor(log.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="text-white text-sm font-medium">{log.nodeName}</span>
                  </div>
                  {log.duration && <span className="text-xs text-gray-400">{log.duration}ms</span>}
                </div>

                {log.error && <div className="text-red-300 text-xs bg-red-900/20 p-2 rounded mt-2">{log.error}</div>}

                {log.result && log.status === "completed" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedResult(log.result)}
                      className="bg-white/10 hover:bg-white/20 text-white border-0 text-xs rounded-full"
                    >
                      
                      View
                    </Button>
                    {log.result.preview && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = log.result.preview
                          link.download = `${log.nodeName}-result`
                          link.click()
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white border-0 text-xs rounded-full"
                      >
                        
                        Save
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Panel */}
      {selectedResult && (
        <div className="border-t border-white/10 p-4 bg-neutral-900">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">Result Preview</h4>
            <Button
              size="sm"
              onClick={() => setSelectedResult(null)}
              className="bg-transparent hover:bg-white/10 text-white border-0 p-1"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Type</label>
              <p className="text-white text-sm">{selectedResult.type}</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Content</label>
              <div className="bg-black border border-white/20 p-3 rounded text-white text-sm max-h-32 overflow-y-auto">
                {selectedResult.content}
              </div>
            </div>

            {selectedResult.preview && selectedResult.type.includes("image") && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Preview</label>
                <img
                  src={selectedResult.preview || "/placeholder.svg"}
                  alt="Generated content"
                  className="w-full h-32 object-cover border border-white/20 rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="border-t border-white/10 p-4 bg-neutral-900">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-green-400 font-bold text-lg">{completedNodes}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-red-400 font-bold text-lg">{errorNodes}</div>
            <div className="text-xs text-gray-400">Errors</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold text-lg">{totalNodes}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}
