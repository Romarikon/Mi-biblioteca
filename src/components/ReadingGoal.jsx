import { useState } from 'react'

const STORAGE_KEY = 'reading_goal'

function getGoal() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
}

export default function ReadingGoal({ booksReadThisYear }) {
  const [goal, setGoal] = useState(getGoal)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(goal || '')

  const progress = goal > 0 ? Math.min(booksReadThisYear / goal, 1) : 0
  const pct = Math.round(progress * 100)

  const R = 28
  const circ = 2 * Math.PI * R
  const dash = circ - progress * circ

  function save() {
    const n = parseInt(input, 10)
    if (n > 0) {
      localStorage.setItem(STORAGE_KEY, n)
      setGoal(n)
    }
    setEditing(false)
  }

  if (!goal && !editing) {
    return (
      <button className="goal-set-btn" onClick={() => setEditing(true)}>
        + Reto lector
      </button>
    )
  }

  if (editing) {
    return (
      <div className="goal-edit">
        <input
          type="number" min="1" max="365"
          placeholder="Libros este año"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
        />
        <button onClick={save}>Guardar</button>
        <button onClick={() => setEditing(false)}>✕</button>
      </div>
    )
  }

  return (
    <button className="goal-ring-btn" onClick={() => setEditing(true)} title={`${booksReadThisYear} de ${goal} libros leídos`}>
      <svg width="52" height="52" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={R} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={R} fill="none"
          stroke={pct >= 100 ? 'var(--have)' : 'var(--accent)'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="700"
          fill={pct >= 100 ? 'var(--have)' : 'var(--accent)'}>
          {booksReadThisYear}
        </text>
      </svg>
      <div className="goal-ring-label">
        <span className="goal-ring-top">de {goal}</span>
        <span className="goal-ring-sub">libros</span>
      </div>
    </button>
  )
}
