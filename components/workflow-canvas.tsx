"use client"

import type React from "react"
import { useCallback, useMemo, useEffect, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react"
import { useWorkflow } from "./workflow-provider"
import { CustomNode } from "./custom-node"

const nodeTypes = {
  custom: CustomNode,
}

export function WorkflowCanvas() {
  const {
    nodes: workflowNodes,
    connections,
    addConnection,
    deleteConnection,
    updateNode,
    addNode,
    deleteNode,
  } = useWorkflow()
  const { screenToFlowPosition } = useReactFlow()
  const [draggedType, setDraggedType] = useState<string | null>(null)

  // Convert workflow nodes to React Flow nodes
  const reactFlowNodes = useMemo(() => {
    return workflowNodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: node.position,
      data: {
        ...node.data,
        nodeType: node.type,
        onUpdate: (updates: any) => updateNode(node.id, { data: { ...node.data, ...updates } }),
      },
    }))
  }, [workflowNodes, updateNode])

  // Convert workflow connections to React Flow edges
  const reactFlowEdges = useMemo(() => {
    return connections.map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      sourceHandle: conn.sourceHandle || "output",
      targetHandle: conn.targetHandle || "input",
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      animated: true,
    }))
  }, [connections])

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges)

  // Update React Flow state when workflow state changes
  useEffect(() => {
    setNodes(reactFlowNodes)
  }, [reactFlowNodes, setNodes])

  useEffect(() => {
    setEdges(reactFlowEdges)
  }, [reactFlowEdges, setEdges])

  const onNodesDelete = useCallback(
    (deletedNodes: any[]) => {
      deletedNodes.forEach((node) => {
        console.log("[v0] Deleting node from workflow:", node.id)
        deleteNode(node.id)
      })
    },
    [deleteNode],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addConnection({
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle || "output",
          targetHandle: params.targetHandle || "input",
        })
      }
    },
    [addConnection],
  )

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation()
      deleteConnection(edge.id)
    },
    [deleteConnection],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const nodeData = event.dataTransfer.getData("application/json")

      if (!nodeData) {
        console.log("[v0] No node data found in drop event")
        return
      }

      try {
        const parsedData = JSON.parse(nodeData)

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const randomOffset = {
          x: position.x + (Math.random() - 0.5) * 100,
          y: position.y + (Math.random() - 0.5) * 100,
        }

        console.log("[v0] Drop event - Adding node:", parsedData.name, "at position:", randomOffset)

        const nodeId = addNode({
          type: parsedData.id as any,
          position: randomOffset,
          data: {
            label: parsedData.name,
            config: { model: "llama-3.1-8b-instant" },
          },
        })

        console.log("[v0] Successfully added node with ID:", nodeId)
      } catch (error) {
        console.error("[v0] Failed to parse node data:", error)
      }
    },
    [screenToFlowPosition, addNode],
  )

  return (
    <div className="flex-1 relative" style={{ minHeight: "100%", contain: "layout style paint" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-black"
        proOptions={{ hideAttribution: true }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        preventScrolling={false}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Background variant={BackgroundVariant.Cross} gap={20} size={1.5} color="#374151" />
        <Controls className="bg-white border border-gray-300 [&>button]:bg-gray-100 [&>button]:border-gray-300 [&>button]:text-gray-900 [&>button:hover]:bg-gray-200" />
        <MiniMap
  className="bg-white border border-gray-300"
  nodeColor="#000000" // black nodes
  maskColor="rgba(255, 255, 255, 0.8)" // light mask over white
/>
      </ReactFlow>
    </div>
  )
}
