import type { WheelArea } from '../types/wheel'

/** Ordem horária a partir do topo, alinhada à referência visual. */
export const initialWheelAreas: WheelArea[] = [
  { id: 'saude', label: 'Saúde & Condição Física', score: 0, color: '#9ec5e8' },
  {
    id: 'relacionamento',
    label: 'Relacionamento & Amigos',
    score: 0,
    color: '#fff3c4',
  },
  {
    id: 'romance',
    label: 'Romance & Relação Íntima',
    score: 0,
    color: '#f5c6d8',
  },
  { id: 'familia', label: 'Família', score: 0, color: '#c8e8b8' },
  { id: 'emocional', label: 'Emocional', score: 0, color: '#d4c4f0' },
  { id: 'espiritual', label: 'Espiritual', score: 0, color: '#ffd4a8' },
  { id: 'intelectual', label: 'Intelectual', score: 0, color: '#b8e8e0' },
  { id: 'profissional', label: 'Profissional', score: 0, color: '#ffb8a8' },
  { id: 'lazer', label: 'Lazer', score: 0, color: '#c8d4e8' },
  {
    id: 'financeiro',
    label: 'Financeiro',
    score: 0,
    color: '#d4f0a8',
  },
]
