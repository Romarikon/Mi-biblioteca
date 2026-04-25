import { useState } from 'react'
import { getRandomQuote } from '../data/quotes'

export default function DailyQuote() {
  const [quote, setQuote] = useState(getRandomQuote)
  const [visible, setVisible] = useState(true)

  function shuffle() {
    setQuote(getRandomQuote())
  }

  if (!visible) return null

  return (
    <div className="daily-quote">
      <div className="daily-quote-content">
        <p className="daily-quote-text">{quote.text}</p>
        <span className="daily-quote-author">— {quote.author}</span>
      </div>
      <div className="daily-quote-actions">
        <button className="quote-shuffle" onClick={shuffle} title="Otra cita">↻</button>
        <button className="quote-close" onClick={() => setVisible(false)} title="Cerrar">✕</button>
      </div>
    </div>
  )
}
