"use client"

import { useEffect } from "react"
import { DrawflowCanvas } from "@/components/drawflow-canvas"
import { NodeLibrary } from "@/components/node-library"
import { WorkflowRunner } from "@/components/workflow-runner"
import { WorkflowProvider } from "@/components/workflow-provider"

export default function Home() {
  useEffect(() => {
    const handleWorkflowExecution = () => {
      // Trigger the workflow runner's run button
      const runButton = document.querySelector("[data-workflow-run-button]") as HTMLButtonElement
      if (runButton) {
        runButton.click()
      }
    }

    // Listen for the custom event from drawflow canvas
    window.addEventListener("triggerWorkflowExecution", handleWorkflowExecution)

    return () => {
      window.removeEventListener("triggerWorkflowExecution", handleWorkflowExecution)
    }
  }, [])

  return (
    <WorkflowProvider>
      <div className="h-screen bg-black flex relative">
        <NodeLibrary />
        <DrawflowCanvas />
        <WorkflowRunner />
      </div>
    </WorkflowProvider>
  )
}
