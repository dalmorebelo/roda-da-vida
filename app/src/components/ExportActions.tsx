import { useState, type RefObject } from 'react'

interface ExportActionsProps {
  svgRef: RefObject<SVGSVGElement | null>
}

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

function svgToPngBlob(svg: SVGSVGElement, scale = 2): Promise<Blob> {
  const vb = svg.viewBox
  const width = vb.baseVal.width || svg.clientWidth || 460
  const height = vb.baseVal.height || svg.clientHeight || 460

  const clone = svg.cloneNode(true) as SVGSVGElement
  inlineSvgComputedStyles(svg, clone)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))

  const serialized = new XMLSerializer().serializeToString(clone)
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas não suportado'))
        return
      }
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg')
        .trim() || '#fbf7f2'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Falha ao gerar PNG'))
        },
        'image/png',
        1,
      )
    }
    img.onerror = () => reject(new Error('Falha ao carregar SVG'))
    img.src = dataUrl
  })
}

export function ExportActions({ svgRef }: ExportActionsProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    const svg = svgRef.current
    if (!svg) {
      setError('Gráfico indisponível.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const blob = await svgToPngBlob(svg)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'roda-da-vida.png'
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao exportar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="actions-card" aria-labelledby="export-heading">
      <h2 id="export-heading">Exportação</h2>
      <p className="actions-hint">
        Baixe a roda atual como imagem PNG para guardar ou compartilhar.
      </p>
      {error ? (
        <p className="actions-error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleExport}
        disabled={busy}
        className="export-button"
      >
        {busy ? 'Gerando…' : 'Exportar roda em PNG'}
      </button>
    </section>
  )
}
