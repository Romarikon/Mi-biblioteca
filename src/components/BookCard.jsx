import StarRating from './StarRating'

const STATUS_CONFIG = {
  want: { next: 'have', label: 'Lo tengo ya', cls: 'status-want' },
  have: { next: 'read', label: 'Marcar leído', cls: 'status-have' },
  read: { next: 'have', label: 'Quitar leído', cls: 'status-read' },
}

export default function BookCard({ book, onStatusChange, onRatingChange, onDelete, onOpen, postitCount = 0, quoteCount = 0 }) {
  const cfg = STATUS_CONFIG[book.status]
  const progress = book.pages > 0
    ? Math.min(100, Math.round(((book.current_page || 0) / book.pages) * 100))
    : null

  const hasNotes = !!book.notes?.trim()

  return (
    <div className="book-card" onClick={() => onOpen(book)}>

      <div className="cover-zoom-wrap">
        {book.cover_url
          ? <img className="book-cover" src={book.cover_url} alt={book.title} />
          : <div className="book-cover-placeholder">📖</div>
        }
      </div>

      <div className="book-info">
        {book.category && <p className="book-category">{book.category}</p>}
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>

        <StarRating rating={book.rating} onChange={r => onRatingChange(book.id, r)} />

        {progress !== null && (
          <div className="card-progress">
            <div className="card-progress-track">
              <div className="card-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="card-progress-label">{progress}%</span>
          </div>
        )}

        {/* Badge prestado */}
        {book.lent_to && (
          <span className="lent-badge">📤 Prestado a {book.lent_to}</span>
        )}

        {/* Indicadores de actividad */}
        {(postitCount > 0 || quoteCount > 0 || hasNotes) && (
          <div className="book-activity">
            {postitCount > 0 && (
              <span className="activity-badge badge-postit">
                {postitCount} {postitCount === 1 ? 'nota' : 'notas'}
              </span>
            )}
            {quoteCount > 0 && (
              <span className="activity-badge badge-quote">
                {quoteCount} {quoteCount === 1 ? 'cita' : 'citas'}
              </span>
            )}
            {hasNotes && (
              <span className="activity-badge badge-notes">reseña</span>
            )}
          </div>
        )}

        <div className="book-actions" onClick={e => e.stopPropagation()}>
          <button className={`btn-status-card ${cfg.cls}`} onClick={() => onStatusChange(book.id, cfg.next)}>
            {cfg.label}
          </button>
          <button className="btn-icon danger" title="Borrar"
            onClick={() => { if (confirm('¿Borrar este libro?')) onDelete(book.id) }}>
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}
