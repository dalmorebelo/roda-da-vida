import type { WheelArea } from '../types/wheel'

interface AreaControlsProps {
  areas: WheelArea[]
  onScoreChange: (id: string, score: number) => void
}

export function AreaControls({ areas, onScoreChange }: AreaControlsProps) {
  return (
    <section className="controls-card" aria-labelledby="controls-heading">
      <h2 id="controls-heading">Notas por área</h2>
      <p className="controls-intro">
        Ajuste fino por aqui ou use as teclas ← → com o foco no controle
        deslizante. A roda acima também aceita clique e arraste.
      </p>
      <div className="controls-grid">
        {areas.map((area) => (
          <label key={area.id} className="control-item">
            <span className="control-label" id={`label-${area.id}`}>
              {area.label}
            </span>
            <div className="control-inputs">
              <input
                id={`score-${area.id}`}
                type="range"
                min={0}
                max={10}
                step={1}
                value={area.score}
                aria-labelledby={`label-${area.id}`}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={area.score}
                aria-valuetext={`${area.score} de 10`}
                onChange={(event) =>
                  onScoreChange(area.id, Number(event.target.value))
                }
              />
              <output
                className="control-score"
                htmlFor={`score-${area.id}`}
                aria-live="polite"
              >
                {area.score}
              </output>
            </div>
          </label>
        ))}
      </div>
    </section>
  )
}
