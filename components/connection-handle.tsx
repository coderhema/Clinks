"use client"

import React, { useRef } from "react"
import { useWorkflow } from "./workflow-provider"

interface ConnectionHandleProps {
  nodeId: string
  type: "input" | "output"
  position: "left" | "right"
  className?: string
}

export function ConnectionHandleComponent({ nodeId, type, position, className }: ConnectionHandleProps) {
  const { addConnection } = useWorkflow()
  const handleRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const getHandlePosition = () => {
    if (!handleRef.current) return { x: 0, y: 0 }
    const rect = handleRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (type === "output") {
      setIsDragging(true)
      const position = getHandlePosition()

      // Start connection visualization
      document.dispatchEvent(
        new CustomEvent("startConnection", {
          detail: { nodeId, type, position },
        }),
      )

      // Add visual feedback
      if (handleRef.current) {
        handleRef.current.style.transform = "scale(1.2)"
        handleRef.current.style.backgroundColor = "#10b981"
        handleRef.current.style.borderColor = "#10b981"
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isDragging && type === "input") {
      // Find the source node from the drag operation
      const sourceNodeId = document.querySelector('[data-dragging="true"]')?.getAttribute("data-node-id")

      if (sourceNodeId && sourceNodeId !== nodeId) {
        addConnection({
          source: sourceNodeId,
          target: nodeId,
        })
      }
    }

    setIsDragging(false)
    document.dispatchEvent(new CustomEvent("endConnection"))

    // Reset visual feedback
    if (handleRef.current) {
      handleRef.current.style.transform = ""
      handleRef.current.style.backgroundColor = ""
      handleRef.current.style.borderColor = ""
    }
  }

  const handleMouseEnter = () => {
    if (type === "input" && document.querySelector('[data-dragging="true"]')) {
      // Visual feedback for valid connection target
      if (handleRef.current) {
        handleRef.current.style.backgroundColor = "#10b981"
        handleRef.current.style.borderColor = "#10b981"
        handleRef.current.style.transform = "scale(1.2)"
      }
    }
  }

  const handleMouseLeave = () => {
    if (!isDragging && handleRef.current) {
      handleRef.current.style.backgroundColor = ""
      handleRef.current.style.borderColor = ""
      handleRef.current.style.transform = ""
    }
  }

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        document.dispatchEvent(new CustomEvent("endConnection"))

        // Reset visual feedback
        if (handleRef.current) {
          handleRef.current.style.transform = ""
          handleRef.current.style.backgroundColor = ""
          handleRef.current.style.borderColor = ""
        }
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Set dragging attribute for connection detection
        if (handleRef.current) {
          handleRef.current.setAttribute("data-dragging", "true")
          handleRef.current.setAttribute("data-node-id", nodeId)
        }
      }
    }

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp)
      document.addEventListener("mousemove", handleGlobalMouseMove)
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [isDragging, nodeId])

  return (
    <div
      ref={handleRef}
      className={className}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={type === "output" ? "Drag to connect to another node" : "Drop connection here"}
    />
  )
}
