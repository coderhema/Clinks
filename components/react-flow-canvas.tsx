"use client"

import type React from "react"

import { useCallback } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"

import { AINode } from "./ai-node"
import { useWorkflow } from "./workflow-provider"

const nodeTypes: NodeTypes = {
  aiNode: AINode,
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "aiNode",
    position: { x: 250, y: 100 },
    data: {
      type: "text-input",
      label: "Text Input",
      content: "Enter your prompt here...",
    },
  },
  {
    id: "2",
    type: "aiNode",
    position: { x: 500, y: 100 },
    data: {
      type: "image-gen",
      label: "Image Generator",
      content: "",
    },
  },
]

const initialEdges: Edge[] = []

export function ReactFlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { setSelectedNode } = useWorkflow()

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node)
    },
    [setSelectedNode],
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-black"
      >
        <Background
  variant={BackgroundVariant.Cross}
  gap={20}
  size={1.5}
  color="#374151" // dark gray
/>
        <Controls className="bg-gray-900 border-gray-700 [&>button]:bg-gray-800 [&>button]:border-gray-600 [&>button]:text-white [&>button:hover]:bg-gray-700" />
        <MiniMap
  className="bg-white border border-gray-300"
  nodeColor="#000000" // black nodes
  maskColor="rgba(255, 255, 255, 0.8)" // light mask over white
/>
      </ReactFlow>
    </div>
  )
}
