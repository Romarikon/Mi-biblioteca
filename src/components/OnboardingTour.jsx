import { useState } from 'react'

const STEPS = [
  {
    icon: '📚',
    title: 'Bienvenida a tu biblioteca',
    text: 'Aquí guardas todos tus libros: los que quieres leer, los que tienes en casa y los que ya leíste. Todo sincronizado entre tu móvil y el navegador.',
  },
  {
    icon: '🔍',
    title: 'Añade libros en segundos',
    text: 'Pulsa "+ Añadir" y escribe el título. La app busca en Google Books y rellena sola la portada, el autor, la sinopsis y el género. Solo elige el resultado correcto.',
    highlight: '+ Añadir',
  },
  {
    icon: '↔️',
    title: 'Arrastra para organizar',
    text: 'Mueve los libros entre las tres columnas arrastrándolos: de "No lo tengo" a "Lo tengo" cuando lo compres, y a "Leídos" cuando lo termines.',
    visual: (
      <div className="tour-drag-demo">
        <div className="tour-col tour-col-want">
          <span>No lo tengo</span>
          <div className="tour-book-chip">📖 El nombre del viento</div>
        </div>
        <div className="tour-arrow">→</div>
        <div className="tour-col tour-col-have">
          <span>Lo tengo</span>
        </div>
        <div className="tour-arrow">→</div>
        <div className="tour-col tour-col-read">
          <span>Leídos</span>
        </div>
      </div>
    ),
  },
  {
    icon: '🗒️',
    title: 'Notas, post-its y citas',
    text: 'Haz clic en cualquier libro para abrir su detalle. Allí puedes escribir una reseña, pegar post-its de colores en páginas concretas y guardar tus citas favoritas.',
  },
  {
    icon: '🎯',
    title: 'Reto lector anual',
    text: 'Pulsa "Reto lector" en la cabecera y fija cuántos libros quieres leer este año. El anillo se llena solo cada vez que marcas un libro como leído.',
    visual: (
      <div className="tour-goal-demo">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#e2d9cc" strokeWidth="5" />
          <circle
            cx="32" cy="32" r="28" fill="none"
            stroke="#3b4999" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={175.9} strokeDashoffset={175.9 * 0.4}
            transform="rotate(-90 32 32)"
          />
          <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="800" fill="#3b4999">7</text>
        </svg>
        <div className="tour-goal-text">
          <strong>7 de 12</strong>
          <span>libros este año</span>
        </div>
      </div>
    ),
  },
]

export default function OnboardingTour({ onClose }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function finish() {
    localStorage.setItem('tour_done', '1')
    onClose()
  }

  return (
    <div className="tour-overlay" onClick={e => e.target === e.currentTarget && finish()}>
      <div className="tour-modal">

        <div className="tour-progress">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`tour-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className="tour-icon">{current.icon}</div>
        <h2 className="tour-title">{current.title}</h2>
        <p className="tour-text">{current.text}</p>

        {current.visual && (
          <div className="tour-visual">{current.visual}</div>
        )}

        <div className="tour-actions">
          <button className="tour-skip" onClick={finish}>
            {isLast ? 'Empezar' : 'Saltar'}
          </button>
          {!isLast && (
            <button className="tour-next" onClick={() => setStep(s => s + 1)}>
              Siguiente →
            </button>
          )}
          {isLast && (
            <button className="tour-next" onClick={finish}>
              ¡Comenzar! 🚀
            </button>
          )}
        </div>

        {step > 0 && (
          <button className="tour-back-btn" onClick={() => setStep(s => s - 1)}>
            ← Atrás
          </button>
        )}
      </div>
    </div>
  )
}
