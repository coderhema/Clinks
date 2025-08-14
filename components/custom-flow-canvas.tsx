"use client"

import type React from "react"

import { useRef, useState, useCallback } from "react"
import { useWorkflow } from "./workflow-provider"
import { CustomFlowNode } from "./custom-flow-node"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { Button } from "./ui/button"

interface Connection {
  id: string
  sourceId: string
  targetId: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
}

export function CustomFlowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [connections, setConnections] = useState<Connection[]>([])
  const [dragConnection, setDragConnection] = useState<{
    sourceId: string
    sourceX: number
    sourceY: number
    currentX: number
    currentY: number
  } | null>(null)

  const { nodes, addReactFlowNode, selectedNode, setSelectedNode } = useWorkflow()

  // Handle canvas panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        setIsPanning(true)
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        setSelectedNode(null)
      }
    },
    [pan, setSelectedNode],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
      if (dragConnection) {
        setDragConnection((prev) =>
          prev
            ? {
                ...prev,
                currentX: e.clientX,
                currentY: e.clientY,
              }
            : null,
        )
      }
    },
    [isPanning, dragStart, dragConnection],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setDragConnection(null)
  }, [])

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)))
  }, [])

  // Handle double-click to add node
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - pan.x) / zoom
        const y = (e.clientY - rect.top - pan.y) / zoom

        addReactFlowNode("text-input", "New Node", { x, y })
      }
    },
    [pan, zoom, addReactFlowNode],
  )

  // Connection handling
  const startConnection = useCallback((nodeId: string, x: number, y: number) => {
    setDragConnection({
      sourceId: nodeId,
      sourceX: x,
      sourceY: y,
      currentX: x,
      currentY: y,
    })
  }, [])

  const completeConnection = useCallback(
    (targetId: string, targetX: number, targetY: number) => {
      if (dragConnection && dragConnection.sourceId !== targetId) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          sourceId: dragConnection.sourceId,
          targetId,
          sourceX: dragConnection.sourceX,
          sourceY: dragConnection.sourceY,
          targetX,
          targetY,
        }
        setConnections((prev) => [...prev, newConnection])
      }
      setDragConnection(null)
    },
    [dragConnection],
  )

  return (
    <div className="flex-1 relative overflow-hidden bg-black">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          backgroundImage: `
            radial-gradient(circle, #333 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(#333 1px, transparent 1px),
              linear-gradient(90deg, #333 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />

        {/* Connections */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map((conn) => (
            <line
              key={conn.id}
              x1={conn.sourceX * zoom + pan.x}
              y1={conn.sourceY * zoom + pan.y}
              x2={conn.targetX * zoom + pan.x}
              y2={conn.targetY * zoom + pan.y}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ))}
          {dragConnection && (
            <line
              x1={dragConnection.sourceX * zoom + pan.x}
              y1={dragConnection.sourceY * zoom + pan.y}
              x2={dragConnection.currentX}
              y2={dragConnection.currentY}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
          )}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <CustomFlowNode
            key={node.id}
            node={node}
            zoom={zoom}
            pan={pan}
            isSelected={selectedNode?.id === node.id}
            onSelect={() => setSelectedNode(node)}
            onStartConnection={startConnection}
            onCompleteConnection={completeConnection}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
        <Button
          size="sm"
          variant="outline"
          className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
          onClick={() => handleZoom(0.1)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
          onClick={() => handleZoom(-0.1)}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white text-sm z-10">
        Double-click to add nodes • Drag from green handles to blue handles to connect • Mouse wheel to zoom
      </div>
    </div>
  )
}
