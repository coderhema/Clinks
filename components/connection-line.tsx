"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface ConnectionLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  temporary?: boolean
  connectionId?: string
  status?: "idle" | "active" | "error" | "success"
  onDelete?: (connectionId: string) => void
  animated?: boolean
}

export function ConnectionLine({
  from,
  to,
  temporary = false,
  connectionId,
  status = "idle",
  onDelete,
  animated = false,
}: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Calculate control points for a smooth bezier curve
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Adaptive control point distance based on connection length
  const controlDistance = Math.min(Math.max(distance * 0.3, 50), 200)

  const controlPoint1 = { x: from.x + controlDistance, y: from.y }
  const controlPoint2 = { x: to.x - controlDistance, y: to.y }

  const pathData = `M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${to.x} ${to.y}`

  // Dynamic styling based on status and state
  const getConnectionStyle = () => {
    if (temporary) {
      return {
        stroke: "#3b82f6",
        strokeWidth: "3",
        strokeDasharray: "8,4",
        opacity: 0.8,
      }
    }

    switch (status) {
      case "active":
        return {
          stroke: "#10b981",
          strokeWidth: isHovered ? "4" : "3",
          strokeDasharray: "none",
          opacity: 1,
        }
      case "error":
        return {
          stroke: "#ef4444",
          strokeWidth: isHovered ? "4" : "3",
          strokeDasharray: "none",
          opacity: 1,
        }
      case "success":
        return {
          stroke: "#22c55e",
          strokeWidth: isHovered ? "4" : "3",
          strokeDasharray: "none",
          opacity: 1,
        }
      default:
        return {
          stroke: isHovered ? "#8b5cf6" : "#6b7280",
          strokeWidth: isHovered ? "4" : "2",
          strokeDasharray: "none",
          opacity: isHovered ? 1 : 0.7,
        }
    }
  }

  const connectionStyle = getConnectionStyle()

  // Calculate midpoint for delete button
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2

  return (
    <g>
      {/* Connection shadow for depth */}
      {!temporary && (
        <path
          d={pathData}
          stroke="rgba(0, 0, 0, 0.3)"
          strokeWidth={connectionStyle.strokeWidth}
          fill="none"
          strokeDasharray={connectionStyle.strokeDasharray}
          transform="translate(2, 2)"
          className="pointer-events-none"
        />
      )}

      {/* Main connection line */}
      <path
        d={pathData}
        stroke={connectionStyle.stroke}
        strokeWidth={connectionStyle.strokeWidth}
        fill="none"
        strokeDasharray={connectionStyle.strokeDasharray}
        opacity={connectionStyle.opacity}
        className={`transition-all duration-200 cursor-pointer ${
          animated ? "animate-pulse" : ""
        } ${temporary ? "animate-pulse" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          filter: isHovered ? "drop-shadow(0 0 8px currentColor)" : "none",
        }}
      />

      {/* Animated flow indicator for active connections */}
      {status === "active" && !temporary && (
        <circle r="4" fill="#10b981" className="opacity-80">
          <animateMotion dur="2s" repeatCount="indefinite" path={pathData} />
        </circle>
      )}

      {/* Connection arrow */}
      {!temporary && (
        <g>
          <defs>
            <marker
              id={`arrowhead-${connectionId || "default"}`}
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,8 L12,4 z" fill={connectionStyle.stroke} className="transition-colors duration-200" />
            </marker>
          </defs>
          <path
            d={pathData}
            stroke="transparent"
            strokeWidth="1"
            fill="none"
            markerEnd={`url(#arrowhead-${connectionId || "default"})`}
            className="pointer-events-none"
          />
        </g>
      )}

      {/* Delete button on hover */}
      {!temporary && isHovered && onDelete && connectionId && (
        <g>
          <circle
            cx={midX}
            cy={midY}
            r="12"
            fill="#1f2937"
            stroke="#ef4444"
            strokeWidth="2"
            className="cursor-pointer hover:fill-red-900 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(connectionId)
            }}
          />
          <X x={midX - 6} y={midY - 6} width="12" height="12" className="pointer-events-none text-red-400" />
        </g>
      )}

      {/* Connection type label */}
      {!temporary && isHovered && (
        <g>
          <rect
            x={midX - 20}
            y={midY - 25}
            width="40"
            height="16"
            rx="8"
            fill="rgba(0, 0, 0, 0.8)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
          <text
            x={midX}
            y={midY - 15}
            textAnchor="middle"
            className="text-xs fill-white font-medium pointer-events-none"
          >
            Data
          </text>
        </g>
      )}
    </g>
  )
}
