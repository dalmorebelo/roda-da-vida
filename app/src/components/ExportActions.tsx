import { useState, type RefObject } from 'react'
import type { WheelArea } from '../types/wheel'
import {
  renderExportCanvas,
  canvasToBlob,
  type ExportSummaryData,
} from '../utils/exportRenderer'

interface ExportActionsProps {
  svgRef: RefObject<SVGSVGElement | null>
  areas: WheelArea[]
  averageScore: number
}

export function ExportActions({ svgRef, areas, averageScore }: ExportActionsProps) {
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getSummaryData = (): ExportSummaryData => ({
    areas,
    averageScore,
  })

  const handleExportPng = async () => {
    const svg = svgRef.current
    if (!svg) {
      setError('Gráfico indisponível.')
      return
    }
    setBusy('png')
    setError(null)
    try {
      const canvas = await renderExportCanvas(svg, getSummaryData())
      const blob = await canvasToBlob(canvas)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'roda-da-vida.png'
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao exportar PNG.')
    } finally {
      setBusy(null)
    }
  }

  const handleExportPdf = async () => {
    const svg = svgRef.current
    if (!svg) {
      setError('Gráfico indisponível.')
      return
    }
    setBusy('pdf')
    setError(null)
    try {
      const { default: jsPDF } = await import('jspdf')
      const canvas = await renderExportCanvas(svg, getSummaryData(), 3)

      const imgData = canvas.toDataURL('image/png', 1)
      const pdfW = 297
      const pdfH = 210
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const imgAspect = canvas.width / canvas.height
      let drawW = pdfW - 20
      let drawH = drawW / imgAspect

      if (drawH > pdfH - 20) {
        drawH = pdfH - 20
        drawW = drawH * imgAspect
      }

      const offsetX = (pdfW - drawW) / 2
      const offsetY = (pdfH - drawH) / 2

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawW, drawH)
      pdf.save('roda-da-vida.pdf')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao exportar PDF.')
    } finally {
      setBusy(null)
    }
  }

  const handleShare = async () => {
    const svg = svgRef.current
    if (!svg) {
      setError('Gráfico indisponível.')
      return
    }
    setBusy('png')
    setError(null)
    try {
      const canvas = await renderExportCanvas(svg, getSummaryData())
      const blob = await canvasToBlob(canvas)
      const file = new File([blob], 'roda-da-vida.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Minha Roda da Vida',
          text: 'Confira minha Roda da Vida Digital!',
        })
      } else {
        throw new Error('Seu navegador não suporta compartilhamento de arquivos. Use o botão Exportar PNG.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao compartilhar.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="actions-card" aria-labelledby="export-heading">
      <h2 id="export-heading">Exportação</h2>
      <p className="actions-hint">
        Baixe a roda com o resumo ou compartilhe diretamente.
      </p>
      {error ? (
        <p className="actions-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="export-buttons">
        <button
          type="button"
          onClick={handleExportPng}
          disabled={busy !== null}
          className="export-button"
        >
          {busy === 'png' ? 'Gerando…' : 'PNG'}
        </button>
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={busy !== null}
          className="export-button export-button--pdf"
        >
          {busy === 'pdf' ? 'Gerando…' : 'PDF'}
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={busy !== null}
          className="export-button export-button--whatsapp"
          title="Compartilhar no WhatsApp"
        >
          {busy === 'png' ? (
            '…'
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                style={{ verticalAlign: 'middle', marginRight: '6px' }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </>
          )}
        </button>
      </div>
    </section>
  )
}
