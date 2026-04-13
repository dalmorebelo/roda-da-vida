import type { WheelArea } from '../types/wheel'

/** Copia estilos computados para o clone (variáveis CSS não valem em data URL). */
function inlineSvgComputedStyles(
  source: SVGSVGElement,
  target: SVGSVGElement,
): void {
  const walk = (orig: Element, dest: Element) => {
    if (orig instanceof SVGElement && dest instanceof SVGElement) {
      const cs = getComputedStyle(orig)
      const stroke = cs.stroke
      if (stroke && stroke !== 'none' && !/^rgba?\(0,\s*0,\s*0,\s*0\)$/.test(stroke)) {
        dest.setAttribute('stroke', stroke)
        if (cs.strokeWidth) dest.setAttribute('stroke-width', cs.strokeWidth)
        if (cs.strokeOpacity && cs.strokeOpacity !== '1') {
          dest.setAttribute('stroke-opacity', cs.strokeOpacity)
        }
      }
      const fill = cs.fill
      if (fill && fill !== 'none') {
        dest.setAttribute('fill', fill)
      }
      if (orig instanceof SVGTextElement || orig instanceof SVGTSpanElement) {
        const fontSize = cs.fontSize
        const fontWeight = cs.fontWeight
        const fontFamily = cs.fontFamily
        if (fontSize) dest.setAttribute('font-size', fontSize)
        if (fontWeight) dest.setAttribute('font-weight', fontWeight)
        if (fontFamily) dest.setAttribute('font-family', fontFamily)
      }
    }
    const n = Math.min(orig.children.length, dest.children.length)
    for (let i = 0; i < n; i++) {
      const childOrig = orig.children[i]
      const childDest = dest.children[i]
      if (childOrig && childDest) {
        walk(childOrig, childDest)
      }
    }
  }
  walk(source, target)
}

function svgToImage(svg: SVGSVGElement, scale: number): Promise<HTMLImageElement> {
  const vb = svg.viewBox
  const width = vb.baseVal.width || svg.clientWidth || 580
  const height = vb.baseVal.height || svg.clientHeight || 580

  const clone = svg.cloneNode(true) as SVGSVGElement
  inlineSvgComputedStyles(svg, clone)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width * scale))
  clone.setAttribute('height', String(height * scale))

  const serialized = new XMLSerializer().serializeToString(clone)
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Falha ao carregar SVG'))
    img.src = dataUrl
  })
}

export interface ExportSummaryData {
  areas: WheelArea[]
  averageScore: number
}

interface TextBlock {
  text: string
  x: number
  y: number
  font: string
  color: string
  maxWidth?: number
}

function buildSummaryBlocks(
  data: ExportSummaryData,
  startX: number,
  startY: number,
  panelWidth: number,
): TextBlock[] {
  const blocks: TextBlock[] = []
  const textColor = '#2d2a39'
  const softColor = '#5d5970'
  const padX = startX + 24
  const maxW = panelWidth - 48
  let y = startY + 32

  // Título: Resumo
  blocks.push({ text: 'Resumo', x: padX, y, font: 'bold 28px Inter, sans-serif', color: textColor })
  y += 40

  // Média geral Label
  blocks.push({ text: 'Média geral', x: padX, y, font: '16px Inter, sans-serif', color: softColor })
  y += 48

  // Média geral Value (Large)
  blocks.push({ text: data.averageScore.toFixed(1), x: padX, y, font: 'bold 48px Inter, sans-serif', color: textColor })
  y += 48

  const noRatingsYet = data.areas.length > 0 && data.areas.every((a) => a.score === 0)
  const byScoreDesc = [...data.areas].sort((a, b) => b.score - a.score)
  const strongest = byScoreDesc[0]
  const weakest = byScoreDesc[byScoreDesc.length - 1]

  if (noRatingsYet) {
    blocks.push({
      text: 'Ainda sem notas — marque na roda ou nos controles para ver áreas mais alta e mais baixa.',
      x: padX, y: y + 8, font: 'italic 14px Inter, sans-serif', color: softColor, maxWidth: maxW,
    })
    y += 100 // Pula o resto se não houver notas
  } else {
    if (strongest) {
      blocks.push({
        text: `Área mais alta: ${strongest.label} (${strongest.score})`,
        x: padX, y, font: '15px Inter, sans-serif', color: textColor, maxWidth: maxW,
      })
      y += 24
    }

    if (weakest) {
      blocks.push({
        text: `Área mais baixa: ${weakest.label} (${weakest.score})`,
        x: padX, y, font: '15px Inter, sans-serif', color: textColor, maxWidth: maxW,
      })
      y += 36
    }

    // Separador
    blocks.push({ text: '___SEP___', x: padX, y, font: '', color: '#dacfc6' })
    y += 16

    // Atenção (nota ≤ 4)
    blocks.push({ text: 'Atenção (nota ≤ 4)', x: padX, y, font: 'bold 15px Inter, sans-serif', color: softColor })
    y += 24

    const critical = data.areas.filter((a) => a.score <= 4)
    if (critical.length === 0) {
      blocks.push({ text: 'Nenhuma área nesta faixa.', x: padX + 4, y, font: '14px Inter, sans-serif', color: softColor })
      y += 24
    } else {
      for (const a of critical) {
        blocks.push({
          text: `• ${a.label} — ${a.score}`,
          x: padX + 12, y, font: '14px Inter, sans-serif', color: textColor, maxWidth: maxW,
        })
        y += 22
      }
    }

    y += 12

    // Pontos fortes (nota ≥ 8)
    blocks.push({ text: 'Pontos fortes (nota ≥ 8)', x: padX, y, font: 'bold 15px Inter, sans-serif', color: softColor })
    y += 24

    const strong = data.areas.filter((a) => a.score >= 8)
    if (strong.length === 0) {
      blocks.push({ text: 'Nenhuma área nesta faixa.', x: padX + 12, y, font: '14px Inter, sans-serif', color: softColor })
      y += 24
    } else {
      for (const a of strong) {
        blocks.push({
          text: `• ${a.label} — ${a.score}`,
          x: padX + 12, y, font: '14px Inter, sans-serif', color: textColor, maxWidth: maxW,
        })
        y += 22
      }
    }
  }

  return blocks
}

/** Desenha um retângulo com bordas arredondadas no canvas. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Renderiza o canvas composto com roda + resumo. */
export async function renderExportCanvas(
  svg: SVGSVGElement,
  data: ExportSummaryData,
  scale = 2,
): Promise<HTMLCanvasElement> {
  const img = await svgToImage(svg, scale)

  const margin = Math.round(40 * scale)
  const wheelW = img.width
  const wheelH = img.height
  const summaryW = Math.round(420 * scale)
  const gap = Math.round(40 * scale)

  const canvasW = wheelW + summaryW + margin * 2 + gap
  const canvasH = Math.max(wheelH, Math.round(720 * scale)) + margin * 2

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas não suportado')

  // Fundo limpo
  const bg = '#fbf7f2'
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Wheel position
  const wheelX = margin
  const wheelY = Math.round((canvasH - wheelH) / 2)
  
  // Título Acima da Roda
  ctx.save()
  ctx.font = `bold ${Math.round(24 * scale)}px Inter, sans-serif`
  ctx.fillStyle = '#2d2a39'
  ctx.textAlign = 'center'
  ctx.fillText('Roda da Vida', wheelX + wheelW / 2, wheelY - Math.round(20 * scale))
  ctx.restore()

  ctx.drawImage(img, wheelX, wheelY, wheelW, wheelH)

  // Summary Card position
  const cardX = wheelX + wheelW + gap
  const cardY = margin
  const cardW = summaryW
  const cardH = canvasH - margin * 2

  // Draw Card Shadow and Background
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
  ctx.shadowBlur = Math.round(30 * scale)
  ctx.shadowOffsetY = Math.round(10 * scale)
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, cardX, cardY, cardW, cardH, Math.round(20 * scale))
  ctx.fill()
  
  // Card Border
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = '#e0d6ce'
  ctx.lineWidth = 1 * scale
  ctx.stroke()
  ctx.restore()

  const blocks = buildSummaryBlocks(data, cardX / scale, cardY / scale, summaryW / scale)

  for (const block of blocks) {
    if (block.text === '___SEP___') {
      ctx.fillStyle = block.color
      ctx.fillRect(
        Math.round(block.x * scale),
        Math.round(block.y * scale),
        Math.round((summaryW - 48 * scale)),
        1
      )
      continue
    }
    ctx.font = block.font.replace(/(\d+)px/g, (_, n) => `${Number(n) * scale}px`)
    ctx.fillStyle = block.color
    ctx.fillText(
      block.text,
      Math.round(block.x * scale),
      Math.round(block.y * scale),
      block.maxWidth ? Math.round(block.maxWidth * scale) : undefined
    )
  }

  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Falha ao gerar PNG'))
      },
      'image/png',
      1,
    )
  })
}
