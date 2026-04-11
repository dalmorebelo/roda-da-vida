import { useMemo, useRef } from 'react'
import './App.css'
import { AreaControls } from './components/AreaControls'
import { ExportActions } from './components/ExportActions'
import { SummaryPanel } from './components/SummaryPanel'
import { WheelChart } from './components/WheelChart'
import { useWheelState } from './hooks/useWheelState'

function App() {
  const { areas, updateScore } = useWheelState()
  const wheelSvgRef = useRef<SVGSVGElement>(null)

  const averageScore = useMemo(() => {
    const total = areas.reduce((sum, area) => sum + area.score, 0)
    return Number((total / areas.length).toFixed(1))
  }, [areas])

  return (
    <main id="conteudo-principal" className="app-shell" tabIndex={-1}>
      <header className="app-header">
        <p className="eyebrow">Roda da Vida Digital</p>
        <h1>Amplie seu campo de visão</h1>
        <p className="description">
          Clique ou arraste na roda para marcar a nota pela distância ao centro
          (0 no meio, 10 na borda), ou use os controles abaixo. Os dados ficam
          salvos neste navegador.
        </p>
      </header>

      <section className="layout-grid" aria-label="Roda e resumo">
        <WheelChart
          ref={wheelSvgRef}
          areas={areas}
          onScoreChange={updateScore}
        />
        <div className="side-panel">
          <SummaryPanel averageScore={averageScore} areas={areas} />
          <ExportActions svgRef={wheelSvgRef} />
        </div>
      </section>

      <AreaControls areas={areas} onScoreChange={updateScore} />
    </main>
  )
}

export default App
