"use client"

import { DrawflowCanvas } from "@/components/drawflow-canvas"
import { NodeLibrary } from "@/components/node-library"
import { PreviewPanel } from "@/components/preview-panel"
import { WorkflowProvider } from "@/components/workflow-provider"
import { WorkflowToolbar } from "@/components/workflow-toolbar"

export default function Home() {
  return (
    <WorkflowProvider>
      <div className="h-screen bg-black flex relative">
        <NodeLibrary />
        <DrawflowCanvas />
        <PreviewPanel />
        <WorkflowToolbar />
      </div>
    </WorkflowProvider>
  )
}
