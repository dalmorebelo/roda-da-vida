/** Converte coordenadas de tela para o sistema de coordenadas do SVG. */
export function clientToSvgPoint(
  clientX: number,
  clientY: number,
  svg: SVGSVGElement,
): { x: number; y: number } | null {
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const p = pt.matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

export function polarToCartesian(
  cx: number,
  cy: number,
  angle: number,
  r: number,
): { x: number; y: number } {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

/** Caminho de fatia completa do centro até o arco externo. */
export function fullSectorPath(
  cx: number,
  cy: number,
  startAngle: number,
  endAngle: number,
  outerRadius: number,
): string {
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0
  const start = polarToCartesian(cx, cy, startAngle, outerRadius)
  const end = polarToCartesian(cx, cy, endAngle, outerRadius)
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
}

/**
 * Ângulo em relação ao topo (sentido horário) → índice do setor [0, segmentCount).
 */
export function angleToSectorIndex(
  dx: number,
  dy: number,
  segmentCount: number,
): number {
  const angleStep = (Math.PI * 2) / segmentCount
  const angle = Math.atan2(dy, dx)
  let theta = angle + Math.PI / 2
  if (theta < 0) theta += Math.PI * 2
  if (theta >= Math.PI * 2) theta -= Math.PI * 2
  const index = Math.floor(theta / angleStep)
  return Math.min(segmentCount - 1, Math.max(0, index))
}

/** Distância ao centro → nota 0–10 (alinhada aos anéis). */
export function radiusToScore(r: number, maxRadius: number): number {
  const rClamped = Math.min(Math.max(r, 0), maxRadius)
  const raw = Math.round((rClamped / maxRadius) * 10)
  return Math.min(10, Math.max(0, raw))
}

export function pointToSectorAndScore(
  x: number,
  y: number,
  cx: number,
  cy: number,
  maxRadius: number,
  segmentCount: number,
): { index: number; score: number } | null {
  const dx = x - cx
  const dy = y - cy
  const r = Math.hypot(dx, dy)

  if (r > maxRadius + 0.5) {
    return null
  }

  const index = angleToSectorIndex(dx, dy, segmentCount)
  const score = radiusToScore(r, maxRadius)
  return { index, score }
}
