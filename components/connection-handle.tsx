"use client"

import React, { useRef, useState } from "react"
import { useWorkflow } from "./workflow-provider"

interface ConnectionHandleProps {
  nodeId: string
  type: "input" | "output"
  position: "left" | "right"
  className?: string
  handleType?: "data" | "control" | "trigger"
  label?: string
}

export function ConnectionHandleComponent({
  nodeId,
  type,
  position,
  className,
  handleType = "data",
  label,
}: ConnectionHandleProps) {
  const { addConnection, connections, nodes } = useWorkflow()
  const handleRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isValidTarget, setIsValidTarget] = useState(false)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null)

  const getHandlePosition = () => {
    if (!handleRef.current) return { x: 0, y: 0 }
    const rect = handleRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  const isValidConnection = (sourceNodeId: string, targetNodeId: string) => {
    if (sourceNodeId === targetNodeId) return false

    // Check if connection already exists
    const existingConnection = connections.find((conn) => conn.source === sourceNodeId && conn.target === targetNodeId)
    if (existingConnection) return false

    // Check for circular dependencies
    const wouldCreateCycle = (source: string, target: string, visited = new Set<string>()): boolean => {
      if (visited.has(target)) return true
      visited.add(target)

      const outgoingConnections = connections.filter((conn) => conn.source === target)
      return outgoingConnections.some((conn) => wouldCreateCycle(source, conn.target, new Set(visited)))
    }

    return !wouldCreateCycle(sourceNodeId, targetNodeId)
  }

  const getHandleStyle = () => {
    const baseStyle = "transition-all duration-200 border-2 cursor-crosshair"

    if (isDragging) {
      return `${baseStyle} scale-125 shadow-lg border-blue-400 bg-blue-400`
    }

    if (isValidTarget) {
      return `${baseStyle} scale-110 border-green-400 bg-green-400 shadow-green-400/50 shadow-lg`
    }

    switch (handleType) {
      case "control":
        return `${baseStyle} border-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/40`
      case "trigger":
        return `${baseStyle} border-purple-500 bg-purple-500/20 hover:bg-purple-500/40`
      default:
        return `${baseStyle} border-gray-500 bg-gray-700 hover:border-gray-300 hover:bg-gray-600`
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (type === "output") {
      setIsDragging(true)
      const position = getHandlePosition()
      setDragPreview(position)

      document.dispatchEvent(
        new CustomEvent("startConnection", {
          detail: { nodeId, type, position, handleType },
        }),
      )

      // Add visual feedback
      if (handleRef.current) {
        handleRef.current.style.transform = "scale(1.3)"
        handleRef.current.style.boxShadow = "0 0 20px currentColor"
      }

      const validTargets = document.querySelectorAll(`[data-node-type="input"]`)
      validTargets.forEach((target) => {
        const targetNodeId = target.getAttribute("data-node-id")
        if (targetNodeId && isValidConnection(nodeId, targetNodeId)) {
          target.classList.add("valid-connection-target")
        }
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isDragging && type === "input") {
      const sourceNodeId = document.querySelector('[data-dragging="true"]')?.getAttribute("data-node-id")

      if (sourceNodeId && sourceNodeId !== nodeId && isValidConnection(sourceNodeId, nodeId)) {
        addConnection({
          source: sourceNodeId,
          target: nodeId,
        })

        if (handleRef.current) {
          handleRef.current.style.animation = "pulse 0.5s ease-in-out"
          setTimeout(() => {
            if (handleRef.current) {
              handleRef.current.style.animation = ""
            }
          }, 500)
        }
      }
    }

    cleanup()
  }

  const handleMouseEnter = () => {
    if (type === "input" && document.querySelector('[data-dragging="true"]')) {
      const sourceNodeId = document.querySelector('[data-dragging="true"]')?.getAttribute("data-node-id")
      if (sourceNodeId && isValidConnection(sourceNodeId, nodeId)) {
        setIsValidTarget(true)
      }
    }
  }

  const handleMouseLeave = () => {
    setIsValidTarget(false)
  }

  const cleanup = () => {
    setIsDragging(false)
    setIsValidTarget(false)
    setDragPreview(null)
    document.dispatchEvent(new CustomEvent("endConnection"))

    // Reset visual feedback
    if (handleRef.current) {
      handleRef.current.style.transform = ""
      handleRef.current.style.boxShadow = ""
    }

    // Remove target highlighting
    document.querySelectorAll(".valid-connection-target").forEach((target) => {
      target.classList.remove("valid-connection-target")
    })
  }

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        cleanup()
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDragPreview({ x: e.clientX, y: e.clientY })

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
    <div className="relative">
      <div
        ref={handleRef}
        className={`w-3 h-3 rounded-full ${getHandleStyle()} ${className}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-node-type={type}
        data-node-id={nodeId}
        data-handle-type={handleType}
        title={type === "output" ? `Drag to connect ${handleType} output` : `Drop ${handleType} connection here`}
      />

      {label && (
        <div
          className={`absolute text-xs text-gray-400 whitespace-nowrap pointer-events-none ${
            position === "left" ? "right-4 top-1/2 -translate-y-1/2" : "left-4 top-1/2 -translate-y-1/2"
          }`}
        >
          {label}
        </div>
      )}

      <div
        className={`absolute w-1 h-1 rounded-full ${
          handleType === "control" ? "bg-yellow-400" : handleType === "trigger" ? "bg-purple-400" : "bg-blue-400"
        } ${position === "left" ? "-left-1" : "-right-1"} top-1/2 -translate-y-1/2`}
      />
    </div>
  )
}

const style = document.createElement("style")
style.textContent = `
  .valid-connection-target {
    animation: pulse-glow 1s ease-in-out infinite alternate;
    border-color: #10b981 !important;
    background-color: rgba(16, 185, 129, 0.3) !important;
  }
  
  @keyframes pulse-glow {
    from {
      box-shadow: 0 0 5px #10b981;
    }
    to {
      box-shadow: 0 0 15px #10b981, 0 0 25px #10b981;
    }
  }
`
document.head.appendChild(style)
