import {
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { WheelArea } from '../types/wheel'
import {
  clientToSvgPoint,
  fullSectorPath,
  pointToSectorAndScore,
} from '../utils/wheelGeometry'

interface WheelChartProps {
  areas: WheelArea[]
  onScoreChange?: (id: string, score: number) => void
}

export const WheelChart = forwardRef<SVGSVGElement, WheelChartProps>(
  function WheelChart({ areas, onScoreChange }, ref) {
    const size = 580
    const center = size / 2
    const maxRadius = 190
    const ringCount = 10
    const angleStep = (Math.PI * 2) / areas.length

    const draggingRef = useRef(false)
    const [announcement, setAnnouncement] = useState('')

    const polarToCartesian = (angle: number, radius: number) => ({
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    })

    const mergedRef = useCallback(
      (node: SVGSVGElement | null) => {
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const applyPointer = useCallback(
      (clientX: number, clientY: number, svg: SVGSVGElement) => {
        if (!onScoreChange) return
        const p = clientToSvgPoint(clientX, clientY, svg)
        if (!p) return
        const result = pointToSectorAndScore(
          p.x,
          p.y,
          center,
          center,
          maxRadius,
          areas.length,
        )
        if (!result) return
        const area = areas[result.index]
        if (!area) return
        onScoreChange(area.id, result.score)
      },
      [areas, center, maxRadius, onScoreChange],
    )

    const handlePointerDown = useCallback(
      (e: ReactPointerEvent<SVGSVGElement>) => {
        if (!onScoreChange || e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        draggingRef.current = true
        applyPointer(e.clientX, e.clientY, e.currentTarget)
      },
      [applyPointer, onScoreChange],
    )

    const handlePointerMove = useCallback(
      (e: ReactPointerEvent<SVGSVGElement>) => {
        if (!onScoreChange || !draggingRef.current) return
        applyPointer(e.clientX, e.clientY, e.currentTarget)
      },
      [applyPointer, onScoreChange],
    )

    const endDrag = useCallback(
      (e: ReactPointerEvent<SVGSVGElement>) => {
        if (!draggingRef.current) return
        draggingRef.current = false
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
        if (onScoreChange) {
          const p = clientToSvgPoint(e.clientX, e.clientY, e.currentTarget)
          if (p) {
            const result = pointToSectorAndScore(
              p.x,
              p.y,
              center,
              center,
              maxRadius,
              areas.length,
            )
            if (result) {
              const area = areas[result.index]
              if (area) {
                setAnnouncement(`${area.label}: ${result.score} de 10`)
              }
            }
          }
        }
      },
      [areas, center, maxRadius, onScoreChange],
    )

    return (
      <section
        className="wheel-card"
        aria-label="Gráfico da roda da vida: clique ou arraste na roda para marcar a nota de cada área, de zero a dez."
      >
        <span className="wheel-announcer" aria-live="polite" role="status">
          {announcement}
        </span>
        <svg
          ref={mergedRef}
          id="wheel-svg-export"
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-labelledby="wheel-svg-title"
          className="wheel-interactive-svg"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <title id="wheel-svg-title">
            Roda da vida com notas de zero a dez por área
          </title>

          {Array.from({ length: ringCount }, (_, index) => {
            const radius = ((index + 1) / ringCount) * maxRadius
            return (
              <circle
                key={radius}
                cx={center}
                cy={center}
                r={radius}
                className="wheel-grid-circle wheel-no-pointer"
              />
            )
          })}

          <circle
            cx={center}
            cy={center}
            r={maxRadius}
            className="wheel-outer-ring wheel-no-pointer"
            fill="none"
          />

          {areas.map((area, index) => {
            const startAngle = -Math.PI / 2 + index * angleStep
            const endAngle = startAngle + angleStep
            const radius = (area.score / 10) * maxRadius
            const largeArcFlag = angleStep > Math.PI ? 1 : 0

            if (radius <= 0.5) {
              return null
            }

            const start = polarToCartesian(startAngle, radius)
            const end = polarToCartesian(endAngle, radius)
            const path = `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`

            return (
              <path
                key={area.id}
                d={path}
                fill={area.color}
                className="wheel-slice wheel-no-pointer"
                stroke="var(--wheel-outline)"
                strokeWidth={1}
                strokeOpacity={0.35}
              >
                <title>{`${area.label}: ${area.score} de 10`}</title>
              </path>
            )
          })}

          {areas.map((area, index) => {
            const bisector = -Math.PI / 2 + index * angleStep + angleStep / 2
            const wedgeOuter = (area.score / 10) * maxRadius
            const scoreRadius =
              wedgeOuter > 1
                ? Math.max(20, wedgeOuter * 0.52)
                : maxRadius * 0.34
            const p = polarToCartesian(bisector, scoreRadius)

            return (
              <text
                key={`${area.id}-score`}
                x={p.x}
                y={p.y}
                className="wheel-slice-score wheel-no-pointer"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {area.score}
              </text>
            )
          })}

          {areas.map((area, index) => {
            const startAngle = -Math.PI / 2 + index * angleStep
            const divider = polarToCartesian(startAngle, maxRadius)
            return (
              <line
                key={`div-${area.id}`}
                x1={center}
                y1={center}
                x2={divider.x}
                y2={divider.y}
                className="wheel-divider wheel-no-pointer"
              />
            )
          })}

          <g className="wheel-hit-layer" aria-hidden="true">
            {areas.map((area, index) => {
              const startAngle = -Math.PI / 2 + index * angleStep
              const endAngle = startAngle + angleStep
              return (
                <path
                  key={`hit-${area.id}`}
                  d={fullSectorPath(
                    center,
                    center,
                    startAngle,
                    endAngle,
                    maxRadius,
                  )}
                  fill="transparent"
                  className="wheel-hit-slice"
                />
              )
            })}
          </g>

          {areas.map((area, index) => {
            const angle = -Math.PI / 2 + index * angleStep + angleStep / 2
            const labelRadius = maxRadius + 22
            const point = polarToCartesian(angle, labelRadius)

            const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
            let anchor: 'start' | 'middle' | 'end' = 'middle'
            if (normalizedAngle > Math.PI * 0.15 && normalizedAngle < Math.PI * 0.85) {
              anchor = 'start'
            } else if (normalizedAngle > Math.PI * 1.15 && normalizedAngle < Math.PI * 1.85) {
              anchor = 'end'
            }

            const lines = area.label.includes('&')
              ? area.label.split('&').map((s, i, arr) =>
                  i < arr.length - 1 ? `${s.trim()} &` : s.trim()
                )
              : area.label.length > 14
                ? (() => {
                    const words = area.label.split(' ')
                    const mid = Math.ceil(words.length / 2)
                    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
                  })()
                : [area.label]

            const lineHeight = 11
            const yOffset = -((lines.length - 1) * lineHeight) / 2

            return (
              <text
                key={`${area.id}-label`}
                x={point.x}
                y={point.y}
                className="wheel-label wheel-no-pointer"
                textAnchor={anchor}
                dominantBaseline="middle"
              >
                {lines.map((line, li) => (
                  <tspan
                    key={li}
                    x={point.x}
                    dy={li === 0 ? yOffset : lineHeight}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            )
          })}
        </svg>
      </section>
    )
  },
)
