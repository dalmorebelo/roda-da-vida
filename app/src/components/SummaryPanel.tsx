import type { WheelArea } from '../types/wheel'

interface SummaryPanelProps {
  averageScore: number
  areas: WheelArea[]
}

export function SummaryPanel({ averageScore, areas }: SummaryPanelProps) {
  const noRatingsYet = areas.length > 0 && areas.every((a) => a.score === 0)
  const byScoreDesc = [...areas].sort((a, b) => b.score - a.score)
  const strongest = byScoreDesc[0]
  const weakest = byScoreDesc.length > 0 ? byScoreDesc[byScoreDesc.length - 1] : undefined
  const critical = areas.filter((a) => a.score <= 4)
  const strong = areas.filter((a) => a.score >= 8)

  return (
    <section className="summary-card" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Resumo</h2>
      <p className="average-label">Média geral</p>
      <p className="average-value" aria-live="polite">
        {averageScore.toFixed(1)}
      </p>
      {noRatingsYet ? (
        <p className="summary-line">
          <span className="band-empty">
            Ainda sem notas — marque na roda ou nos controles para ver áreas mais alta e mais
            baixa.
          </span>
        </p>
      ) : (
        <>
          <p className="summary-line">
            <strong>Área mais alta:</strong>{' '}
            {strongest ? (
              <>
                {strongest.label} ({strongest.score})
              </>
            ) : (
              <span className="band-empty">Nenhuma área disponível.</span>
            )}
          </p>
          <p className="summary-line">
            <strong>Área mais baixa:</strong>{' '}
            {weakest ? (
              <>
                {weakest.label} ({weakest.score})
              </>
            ) : (
              <span className="band-empty">Nenhuma área disponível.</span>
            )}
          </p>
        </>
      )}

      <div className="summary-bands" role="group" aria-label="Faixas de atenção">
        <p className="band-title">Atenção (nota ≤ 4)</p>
        {noRatingsYet ? (
          <p className="band-empty">
            As áreas com nota baixa aparecerão aqui depois de começar a avaliar.
          </p>
        ) : critical.length === 0 ? (
          <p className="band-empty">Nenhuma área nesta faixa.</p>
        ) : (
          <ul className="band-list">
            {critical.map((a) => (
              <li key={a.id}>
                {a.label} — {a.score}
              </li>
            ))}
          </ul>
        )}

        <p className="band-title">Pontos fortes (nota ≥ 8)</p>
        {noRatingsYet ? (
          <p className="band-empty">
            As áreas com nota alta aparecerão aqui depois de atribuir notas.
          </p>
        ) : strong.length === 0 ? (
          <p className="band-empty">Nenhuma área nesta faixa.</p>
        ) : (
          <ul className="band-list">
            {strong.map((a) => (
              <li key={a.id}>
                {a.label} — {a.score}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
