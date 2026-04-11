import { useCallback, useEffect, useState } from 'react'
import { initialWheelAreas } from '../data/wheelAreas'
import type { WheelArea } from '../types/wheel'

const STORAGE_KEY = 'roda-da-vida-v2'

function normalizeSaved(raw: unknown): WheelArea[] {
  if (!Array.isArray(raw)) return initialWheelAreas

  const byId = new Map<string, number>()
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const rec = item as { id?: unknown; score?: unknown }
    const id = typeof rec.id === 'string' ? rec.id : null
    const score = typeof rec.score === 'number' ? rec.score : Number.NaN
    if (
      id &&
      initialWheelAreas.some((a) => a.id === id) &&
      Number.isFinite(score) &&
      score >= 0 &&
      score <= 10
    ) {
      byId.set(id, Math.round(score))
    }
  }

  return initialWheelAreas.map((a) => ({
    ...a,
    score: byId.has(a.id) ? (byId.get(a.id) as number) : a.score,
  }))
}

export function useWheelState() {
  const [areas, setAreas] = useState<WheelArea[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return initialWheelAreas
      return normalizeSaved(JSON.parse(raw) as unknown)
    } catch {
      return initialWheelAreas
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(areas))
    } catch {
      // ignore quota / private mode
    }
  }, [areas])

  const updateScore = useCallback((id: string, score: number) => {
    const clamped = Math.min(10, Math.max(0, Math.round(score)))
    setAreas((prev) =>
      prev.map((area) => (area.id === id ? { ...area, score: clamped } : area)),
    )
  }, [])

  return { areas, updateScore }
}
