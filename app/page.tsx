"use client"

import { ReactFlowProvider } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { NodeLibrary } from "@/components/node-library"
import { PreviewPanel } from "@/components/preview-panel"
import { WorkflowProvider } from "@/components/workflow-provider"
import { WorkflowToolbar } from "@/components/workflow-toolbar"
import { WorkflowCanvas } from "@/components/workflow-canvas"

export default function Home() {
  return (
    <WorkflowProvider>
      <ReactFlowProvider>
        <div className="h-screen bg-black flex relative">
          <NodeLibrary />
          <WorkflowCanvas />
          <PreviewPanel />
          <WorkflowToolbar />
        </div>
      </ReactFlowProvider>
    </WorkflowProvider>
  )
}
