"use client"

import type React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { useWorkflow } from "./workflow-provider"
import { WorkflowNode } from "./workflow-node"
import { ConnectionLine } from "./connection-line"

export function WorkflowCanvas() {
  const { nodes, connections, addNode, deleteConnection } = useWorkflow()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [tempConnection, setTempConnection] = useState<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    nodeId: string
    handleType: string
  } | null>(null)

  useEffect(() => {
    const handleStartConnection = (e: CustomEvent) => {
      setTempConnection({
        from: e.detail.position,
        to: e.detail.position,
        nodeId: e.detail.nodeId,
        handleType: e.detail.handleType || "data",
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (tempConnection) {
        setTempConnection((prev) =>
          prev
            ? {
                ...prev,
                to: { x: e.clientX, y: e.clientY },
              }
            : null,
        )
      }
    }

    const handleEndConnection = () => {
      setTempConnection(null)
    }

    document.addEventListener("startConnection", handleStartConnection as EventListener)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("endConnection", handleEndConnection as EventListener)

    return () => {
      document.removeEventListener("startConnection", handleStartConnection as EventListener)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("endConnection", handleEndConnection as EventListener)
    }
  }, [tempConnection])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        // Double click to add a new node
        if (e.detail === 2) {
          const rect = canvasRef.current.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          addNode({
            type: "text-input",
            position: { x, y },
            data: { label: "Text Input" },
          })
        }
      }
    },
    [addNode],
  )

  const renderConnections = () => {
    return connections.map((connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) return null

      return (
        <ConnectionLine
          key={connection.id}
          connectionId={connection.id}
          from={{ x: sourceNode.position.x + 200, y: sourceNode.position.y + 40 }}
          to={{ x: targetNode.position.x, y: targetNode.position.y + 40 }}
          onDelete={deleteConnection}
          animated={false}
        />
      )
    })
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className="absolute inset-0 bg-black"
        onClick={handleCanvasClick}
        style={{
          backgroundImage: `
            radial-gradient(circle, #1f2937 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      >
        {/* Render connections */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {renderConnections()}

          {tempConnection && (
            <ConnectionLine from={tempConnection.from} to={tempConnection.to} temporary={true} animated={true} />
          )}
        </svg>

        {/* Render nodes */}
        {nodes.map((node) => (
          <WorkflowNode key={node.id} node={node} />
        ))}

        {/* Instructions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Double-click to add a node</p>
              <p className="text-sm">Or drag components from the left panel</p>
              <p className="text-xs mt-2">Drag from output (right) to input (left) to connect nodes</p>
              <p className="text-xs mt-1">Hover over connections to delete them</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
