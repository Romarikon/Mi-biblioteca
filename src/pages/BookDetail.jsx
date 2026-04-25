import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import StarRating from '../components/StarRating'
import BookForm from '../components/BookForm'

const POSTIT_COLORS = [
  { id: 'yellow', label: '🟡', bg: '#fef9c3', border: '#fde047' },
  { id: 'pink',   label: '🩷', bg: '#fce7f3', border: '#f9a8d4' },
  { id: 'blue',   label: '🔵', bg: '#dbeafe', border: '#93c5fd' },
  { id: 'green',  label: '🟢', bg: '#dcfce7', border: '#86efac' },
  { id: 'purple', label: '🟣', bg: '#f3e8ff', border: '#c4b5fd' },
]

const STATUS_LABEL = { want: 'Lo quiero', have: 'Lo tengo', read: 'Leído' }
const STATUS_CLASS = { want: 'badge-want', have: 'badge-have', read: 'badge-read' }

function formatDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

// ── Post-its tab ────────────────────────────────────────────
function PostitsTab({ bookId, userId }) {
  const [postits, setPostits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ content: '', color: 'yellow', page_ref: '' })

  useEffect(() => {
    supabase.from('postits').select('*').eq('book_id', bookId)
      .order('created_at').then(({ data }) => { if (data) setPostits(data) })
  }, [bookId])

  async function add() {
    if (!form.content.trim()) return
    const { data } = await supabase
      .from('postits').insert({ ...form, book_id: bookId, user_id: userId })
      .select().single()
    if (data) { setPostits(p => [...p, data]); setForm({ content: '', color: 'yellow', page_ref: '' }); setShowForm(false) }
  }

  async function remove(id) {
    await supabase.from('postits').delete().eq('id', id)
    setPostits(p => p.filter(x => x.id !== id))
  }

  const colorCfg = (id) => POSTIT_COLORS.find(c => c.id === id) || POSTIT_COLORS[0]

  const rotations = [-2.5, 1.5, -1, 2, -1.8, 1, -0.5, 2.2]

  return (
    <div className="tab-section">
      <div className="tab-section-header">
        <p className="tab-hint">Notas rápidas, recordatorios, impresiones mientras lees</p>
        <button className="btn-primary-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Post-it'}
        </button>
      </div>

      {showForm && (
        <div className="postit-form">
          <div className="postit-color-picker">
            {POSTIT_COLORS.map(c => (
              <button
                key={c.id}
                className={`color-dot ${form.color === c.id ? 'active' : ''}`}
                style={{ background: c.bg, borderColor: c.border }}
                onClick={() => setForm(f => ({ ...f, color: c.id }))}
              />
            ))}
          </div>
          <textarea
            placeholder="Escribe tu nota..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={3}
            autoFocus
          />
          <div className="postit-form-footer">
            <input
              placeholder="Pág. (opcional)"
              value={form.page_ref}
              onChange={e => setForm(f => ({ ...f, page_ref: e.target.value }))}
              className="page-ref-input"
            />
            <button className="btn-primary-sm" onClick={add}>Añadir</button>
          </div>
        </div>
      )}

      {postits.length === 0 && !showForm && (
        <p className="empty-hint">Aún no hay post-its. Añade una nota rápida mientras lees.</p>
      )}

      <div className="postits-grid">
        {postits.map((p, i) => {
          const c = colorCfg(p.color)
          const rot = rotations[i % rotations.length]
          return (
            <div
              key={p.id}
              className="postit"
              style={{ background: c.bg, borderColor: c.border, '--rot': `${rot}deg` }}
            >
              <button className="postit-delete" onClick={() => remove(p.id)}>✕</button>
              <p className="postit-content">{p.content}</p>
              {p.page_ref && <span className="postit-page">pág. {p.page_ref}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Quotes tab ───────────────────────────────────────────────
function QuotesTab({ bookId, userId }) {
  const [quotes, setQuotes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ text: '', page_ref: '' })

  useEffect(() => {
    supabase.from('quotes').select('*').eq('book_id', bookId)
      .order('created_at').then(({ data }) => { if (data) setQuotes(data) })
  }, [bookId])

  async function add() {
    if (!form.text.trim()) return
    const { data } = await supabase
      .from('quotes').insert({ ...form, book_id: bookId, user_id: userId })
      .select().single()
    if (data) { setQuotes(q => [...q, data]); setForm({ text: '', page_ref: '' }); setShowForm(false) }
  }

  async function remove(id) {
    await supabase.from('quotes').delete().eq('id', id)
    setQuotes(q => q.filter(x => x.id !== id))
  }

  return (
    <div className="tab-section">
      <div className="tab-section-header">
        <p className="tab-hint">Frases que te marcaron, párrafos para recordar</p>
        <button className="btn-primary-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Cita'}
        </button>
      </div>

      {showForm && (
        <div className="quote-form">
          <textarea
            placeholder="Escribe la cita o pasaje..."
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            rows={4}
            autoFocus
          />
          <div className="postit-form-footer">
            <input
              placeholder="Pág. (opcional)"
              value={form.page_ref}
              onChange={e => setForm(f => ({ ...f, page_ref: e.target.value }))}
              className="page-ref-input"
            />
            <button className="btn-primary-sm" onClick={add}>Guardar cita</button>
          </div>
        </div>
      )}

      {quotes.length === 0 && !showForm && (
        <p className="empty-hint">Guarda aquí las frases que te impacten mientras lees.</p>
      )}

      <div className="quotes-list">
        {quotes.map(q => (
          <div key={q.id} className="quote-item">
            <span className="quote-mark">"</span>
            <div className="quote-body">
              <p className="quote-text">{q.text}</p>
              {q.page_ref && <span className="quote-page">— pág. {q.page_ref}</span>}
            </div>
            <button className="quote-delete" onClick={() => remove(q.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Notes tab ────────────────────────────────────────────────
function NotesTab({ book, onUpdate }) {
  const [notes, setNotes] = useState(book.notes || '')
  const [saved, setSaved] = useState(true)

  async function save() {
    await supabase.from('books').update({ notes }).eq('id', book.id)
    onUpdate(notes)
    setSaved(true)
  }

  return (
    <div className="tab-section">
      <div className="tab-section-header">
        <p className="tab-hint">Tu reseña personal, reflexiones, lo que te dejó el libro</p>
        {!saved && <button className="btn-primary-sm" onClick={save}>Guardar</button>}
        {saved && <span className="saved-label">✓ Guardado</span>}
      </div>
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        placeholder="¿Qué te pareció? ¿Qué aprendiste? ¿Lo recomendarías?..."
        rows={12}
      />
    </div>
  )
}

// ── Lent section ────────────────────────────────────────────
function LentSection({ book, onUpdate }) {
  const [form, setForm] = useState({ lent_to: book.lent_to || '', lent_at: book.lent_at || '' })
  const [editing, setEditing] = useState(false)

  const isLent = !!book.lent_to

  async function save() {
    await supabase.from('books').update(form).eq('id', book.id)
    onUpdate(form)
    setEditing(false)
  }

  async function clear() {
    const cleared = { lent_to: '', lent_at: null }
    await supabase.from('books').update(cleared).eq('id', book.id)
    onUpdate(cleared)
    setEditing(false)
  }

  if (!isLent && !editing) {
    return (
      <button className="btn-add-progress" style={{ marginTop: '0.5rem' }} onClick={() => setEditing(true)}>
        📤 Registrar préstamo
      </button>
    )
  }

  if (editing || isLent) {
    return (
      <div className="lent-section">
        <p className="lent-section-title">📤 Préstamo</p>
        <div className="lent-fields">
          <div className="lent-field">
            <label>Prestado a</label>
            <input value={form.lent_to} onChange={e => setForm(f => ({ ...f, lent_to: e.target.value }))}
              placeholder="Nombre" />
          </div>
          <div className="lent-field">
            <label>Desde</label>
            <input type="date" value={form.lent_at || ''}
              onChange={e => setForm(f => ({ ...f, lent_at: e.target.value }))} />
          </div>
        </div>
        <div className="lent-actions">
          {isLent && <button className="btn-lent-clear" onClick={clear}>Devuelto ✓</button>}
          <button className="btn-lent-save" onClick={save}>Guardar</button>
        </div>
      </div>
    )
  }
}

// ── Main BookDetail ──────────────────────────────────────────
export default function BookDetail({ book: initialBook, session, onBack, onBookUpdate }) {
  const [book, setBook] = useState(initialBook)
  const [activeTab, setActiveTab] = useState('postits')
  const [showEdit, setShowEdit] = useState(false)
  const [editingProgress, setEditingProgress] = useState(false)
  const [progressForm, setProgressForm] = useState({
    current_page: initialBook.current_page || 0,
    pages: initialBook.pages || 0,
    started_at: initialBook.started_at || '',
    finished_at: initialBook.finished_at || '',
  })

  async function updateBook(fields) {
    const updated = { ...book, ...fields }
    await supabase.from('books').update(fields).eq('id', book.id)
    setBook(updated)
    onBookUpdate(updated)
  }

  async function saveProgress() {
    const fields = { ...progressForm }
    if (fields.current_page > 0 && !fields.started_at) {
      fields.started_at = new Date().toISOString().split('T')[0]
    }
    if (fields.pages > 0 && fields.current_page >= fields.pages && !fields.finished_at) {
      fields.finished_at = new Date().toISOString().split('T')[0]
      fields.status = 'read'
    }
    await updateBook(fields)
    setProgressForm(fields)
    setEditingProgress(false)
  }

  const progress = book.pages > 0
    ? Math.min(100, Math.round(((book.current_page || 0) / book.pages) * 100))
    : 0

  return (
    <div className="detail-page">
      {/* Top bar */}
      <div className="detail-topbar">
        <button className="btn-back" onClick={onBack}>← Biblioteca</button>
        <div className="detail-topbar-right">
          <span className={`status-badge ${STATUS_CLASS[book.status]}`}>
            {STATUS_LABEL[book.status]}
          </span>
          <button className="btn-edit-detail" onClick={() => setShowEdit(true)}>
            Editar libro
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-cover-wrap">
          {book.cover_url
            ? <img src={book.cover_url} alt={book.title} className="detail-cover" />
            : <div className="detail-cover-placeholder">📖</div>
          }
        </div>

        <div className="detail-hero-info">
          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">{book.author}</p>
          {book.category && <span className="detail-category-badge">{book.category}</span>}

          <div style={{ margin: '0.75rem 0' }}>
            <StarRating rating={book.rating} onChange={r => updateBook({ rating: r })} />
          </div>

          {/* Progress */}
          <div className="progress-section">
            {!editingProgress ? (
              <>
                {book.pages > 0 ? (
                  <div className="progress-display" onClick={() => setEditingProgress(true)}>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="progress-labels">
                      <span>pág. {book.current_page || 0} de {book.pages}</span>
                      <span className="progress-pct">{progress}%</span>
                    </div>
                  </div>
                ) : (
                  <button className="btn-add-progress" onClick={() => setEditingProgress(true)}>
                    📖 Registrar progreso de lectura
                  </button>
                )}
              </>
            ) : (
              <div className="progress-edit">
                <div className="progress-edit-row">
                  <div className="progress-edit-field">
                    <label>Página actual</label>
                    <input type="number" min="0"
                      value={progressForm.current_page}
                      onChange={e => setProgressForm(p => ({ ...p, current_page: +e.target.value }))}
                    />
                  </div>
                  <div className="progress-edit-field">
                    <label>Total páginas</label>
                    <input type="number" min="0"
                      value={progressForm.pages}
                      onChange={e => setProgressForm(p => ({ ...p, pages: +e.target.value }))}
                    />
                  </div>
                  <div className="progress-edit-field">
                    <label>Inicio</label>
                    <input type="date"
                      value={progressForm.started_at}
                      onChange={e => setProgressForm(p => ({ ...p, started_at: e.target.value }))}
                    />
                  </div>
                  <div className="progress-edit-field">
                    <label>Fin</label>
                    <input type="date"
                      value={progressForm.finished_at}
                      onChange={e => setProgressForm(p => ({ ...p, finished_at: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="progress-edit-actions">
                  <button className="btn-ghost-xs" onClick={() => setEditingProgress(false)}>Cancelar</button>
                  <button className="btn-primary-sm" onClick={saveProgress}>Guardar</button>
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          {(book.started_at || book.finished_at) && (
            <div className="detail-dates">
              {book.started_at && (
                <span className="date-chip">📅 {formatDate(book.started_at)}</span>
              )}
              {book.finished_at && (
                <span className="date-chip">✅ {formatDate(book.finished_at)}</span>
              )}
              {book.started_at && book.finished_at && (
                <span className="date-chip">⏱ {daysBetween(book.started_at, book.finished_at)} días</span>
              )}
            </div>
          )}

          <LentSection
            book={book}
            onUpdate={fields => updateBook(fields)}
          />
        </div>
      </div>

      {/* Synopsis */}
      {book.synopsis && (
        <div className="detail-synopsis">
          <p>{book.synopsis}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="detail-tabs">
        {[
          { id: 'postits', label: 'Post-its' },
          { id: 'quotes',  label: 'Citas' },
          { id: 'notes',   label: 'Notas' },
        ].map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="detail-body">
        {activeTab === 'postits' && (
          <PostitsTab bookId={book.id} userId={session.user.id} />
        )}
        {activeTab === 'quotes' && (
          <QuotesTab bookId={book.id} userId={session.user.id} />
        )}
        {activeTab === 'notes' && (
          <NotesTab book={book} onUpdate={notes => updateBook({ notes })} />
        )}
      </div>

      {showEdit && (
        <BookForm
          book={book}
          userId={session.user.id}
          onClose={() => setShowEdit(false)}
          onSave={async () => {
            const { data } = await supabase.from('books').select('*').eq('id', book.id).single()
            if (data) { setBook(data); onBookUpdate(data) }
            setShowEdit(false)
          }}
        />
      )}
    </div>
  )
}
