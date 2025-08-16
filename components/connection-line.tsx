"use client"

interface ConnectionLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  temporary?: boolean
}

export function ConnectionLine({ from, to, temporary = false }: ConnectionLineProps) {
  // Calculate control points for a smooth curve
  const dx = to.x - from.x
  const dy = to.y - from.y
  const controlPoint1 = { x: from.x + dx * 0.5, y: from.y }
  const controlPoint2 = { x: to.x - dx * 0.5, y: to.y }

  const pathData = `M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${to.x} ${to.y}`

  const strokeColor = temporary ? "#ef4444" : "#6366f1"
  const strokeDashArray = temporary ? "3,3" : "5,5"

  return (
    <g>
      {/* Connection line */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth="2"
        fill="none"
        strokeDasharray={strokeDashArray}
        className={temporary ? "animate-pulse" : ""}
      />
      {/* Arrow head */}
      {!temporary && (
        <polygon points={`${to.x - 8},${to.y - 4} ${to.x},${to.y} ${to.x - 8},${to.y + 4}`} fill={strokeColor} />
      )}
    </g>
  )
}
