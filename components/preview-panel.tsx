"use client"
import { useWorkflow } from "./workflow-provider"
import { Button } from "./ui/button"
import { X, Download, Share, Maximize2, ChevronRight, Clock, CheckCircle, XCircle, Zap } from "lucide-react"
import { useState } from "react"

function getPreviewContent(node: any, executionLogs: any[]) {
  if (!node) return <p className="text-gray-500">No node selected</p>

  const nodeLogs = executionLogs.filter((log) => log.nodeId === node.id)
  const latestLog = nodeLogs[nodeLogs.length - 1]

  return (
    <div className="space-y-4">
      {/* Node Content */}
      <div className="space-y-2">
        <h4 className="text-white text-sm font-semibold">Content</h4>
        <div className="bg-neutral-900 p-3 rounded text-sm text-gray-300">
          {node.data.content || node.data.preview || "No content generated yet - run the workflow to generate content"}
        </div>
      </div>

      {/* Model Configuration */}
      <div className="space-y-2">
        <h4 className="text-white text-sm font-semibold">Configuration</h4>
        <div className="bg-neutral-900 p-3 rounded text-xs text-gray-400 space-y-1">
          <div>
            Model: <span className="text-white">{node.data.config?.model || "llama-3.1-8b-instant"}</span>
          </div>
          <div>
            Provider: <span className="text-white">{node.data.config?.provider || "groq"}</span>
          </div>
          <div>
            Temperature: <span className="text-white">{node.data.config?.temperature || 0.7}</span>
          </div>
          <div>
            Max Tokens: <span className="text-white">{node.data.config?.maxTokens || 500}</span>
          </div>
        </div>
      </div>

      {/* Execution Status */}
      {latestLog && (
        <div className="space-y-2">
          <h4 className="text-white text-sm font-semibold">Execution Status</h4>
          <div className="bg-neutral-900 p-3 rounded text-xs space-y-2">
            <div className="flex items-center gap-2">
              {latestLog.status === "completed" && <CheckCircle className="h-3 w-3 text-green-500" />}
              {latestLog.status === "failed" && <XCircle className="h-3 w-3 text-red-500" />}
              {latestLog.status === "running" && <Clock className="h-3 w-3 text-yellow-500 animate-spin" />}
              <span
                className={`font-medium ${
                  latestLog.status === "completed"
                    ? "text-green-400"
                    : latestLog.status === "failed"
                      ? "text-red-400"
                      : "text-yellow-400"
                }`}
              >
                {latestLog.status.toUpperCase()}
              </span>
            </div>

            {latestLog.executionTime && (
              <div className="text-gray-400">
                Execution time: <span className="text-white">{latestLog.executionTime}ms</span>
              </div>
            )}

            {latestLog.usage && (
              <div className="text-gray-400">
                Tokens: <span className="text-white">{latestLog.usage.totalTokens}</span> (
                {latestLog.usage.promptTokens} prompt + {latestLog.usage.completionTokens} completion)
              </div>
            )}

            {latestLog.error && <div className="text-red-400 text-xs">Error: {latestLog.error}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export function PreviewPanel() {
  const { selectedNode, nodes, setSelectedNode, executionLogs, isExecuting, clearLogs } = useWorkflow()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<"preview" | "logs">("preview")

  const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode) : null

  if (isCollapsed) {
    return (
      <div className="w-12 bg-black border-l border-white/20 flex flex-col">
        <Button
          onClick={() => setIsCollapsed(false)}
          variant="ghost"
          className="h-12 w-12 p-0 text-gray-500 hover:text-white hover:bg-gray-900 transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-80 bg-black border-l border-white/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Workflow Panel</h2>
          <div className="flex gap-1">
            {isExecuting && <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500 hover:text-white hover:bg-gray-900 transition-all duration-200 hover:scale-110"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500 hover:text-white hover:bg-gray-900 transition-all duration-200 hover:scale-110"
              onClick={() => setSelectedNode(null)}
            >
              <X className="h-3 w-3 transition-transform hover:rotate-90" />
            </Button>
          </div>
        </div>

        <div className="flex gap-1 mt-3">
          <Button
            size="sm"
            variant={activeTab === "preview" ? "default" : "ghost"}
            className="text-xs px-3 py-1 h-7 text-white"
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </Button>
          <Button
            size="sm"
            variant={activeTab === "logs" ? "default" : "ghost"}
            className="text-xs px-3 py-1 h-7 text-white"
            onClick={() => setActiveTab("logs")}
          >
            Logs ({executionLogs.length})
          </Button>
          {executionLogs.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs px-2 py-1 h-7 text-red-400 hover:text-red-300"
              onClick={clearLogs}
            >
              Clear
            </Button>
          )}
        </div>

        {selectedNodeData && <p className="text-gray-500 text-sm mt-2">{selectedNodeData.data.label}</p>}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "preview" ? (
          selectedNodeData ? (
            getPreviewContent(selectedNodeData, executionLogs)
          ) : (
            <p className="text-gray-500 text-sm text-center">Select a node to see its preview</p>
          )
        ) : (
          <div className="space-y-3">
            {executionLogs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">No execution logs yet - run the workflow to see logs</p>
            ) : (
              executionLogs
                .slice()
                .reverse()
                .map((log, index) => (
                  <div
                    key={index}
                    className="bg-neutral-900 p-3 rounded text-xs space-y-2 animate-in slide-in-from-top-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.status === "completed" && <CheckCircle className="h-3 w-3 text-green-500" />}
                        {log.status === "failed" && <XCircle className="h-3 w-3 text-red-500" />}
                        {log.status === "running" && <Clock className="h-3 w-3 text-yellow-500" />}
                        <span className="text-white font-medium">{log.type}</span>
                      </div>
                      <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="text-gray-400">
                      Node: <span className="text-white">{log.nodeId}</span>
                    </div>

                    <div className="text-gray-400">
                      Model: <span className="text-white">{log.model}</span> ({log.provider})
                    </div>

                    {log.prompt && (
                      <div className="text-gray-400">
                        Prompt: <span className="text-gray-300">"{log.prompt}"</span>
                      </div>
                    )}

                    {log.executionTime && (
                      <div className="text-gray-400">
                        Time: <span className="text-white">{log.executionTime}ms</span>
                      </div>
                    )}

                    {log.usage && (
                      <div className="text-gray-400">
                        Tokens: <span className="text-white">{log.usage.totalTokens}</span>
                      </div>
                    )}

                    {log.error && <div className="text-red-400">Error: {log.error}</div>}
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/20">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            className="flex-1 text-xs bg-neutral-900 hover:bg-neutral-700 hover:border-gray-700 transition-all duration-200 hover:scale-105-105 border-dashed rounded-none text-white border border-neutral-500"
          >
            <Download className="h-3 w-3 mr-1 transition-transform hover:scale-110" />
            Export
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="flex-1 text-xs bg-neutral-900 hover:bg-neutral-700 hover:border-gray-700 transition-all duration-200 hover:scale-105-105 border-dashed rounded-none text-white border border-neutral-500"
          >
            <Share className="h-3 w-3 mr-1 transition-transform hover:scale-110" />
            Share
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="flex-1 text-xs bg-neutral-900 hover:bg-neutral-700 hover:border-gray-700 transition-all duration-200 hover:scale-105-105 border-dashed rounded-none text-white border border-neutral-500"
          >
            <Maximize2 className="h-3 w-3 transition-transform hover:scale-110" />
          </Button>
        </div>
      </div>
    </div>
  )
}
