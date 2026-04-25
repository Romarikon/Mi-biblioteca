import { useState } from 'react'
import { supabase } from '../lib/supabase'
import StarRating from './StarRating'

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes'

function cleanCover(url) {
  if (!url) return ''
  return url.replace('http://', 'https://').replace('&edge=curl', '').replace('zoom=1', 'zoom=2')
}

function extractBook(item) {
  const info = item.volumeInfo || {}
  return {
    title: info.title || '',
    author: (info.authors || []).join(', '),
    category: (info.categories || [''])[0].split('/')[0].trim(),
    synopsis: info.description || '',
    cover_url: cleanCover(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''),
    pages: info.pageCount || 0,
  }
}

export default function BookForm({ book, userId, onClose, onSave }) {
  const isEdit = !!book

  const [query, setQuery] = useState(book?.title || '')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(false)

  const [form, setForm] = useState({
    title: book?.title || '',
    author: book?.author || '',
    category: book?.category || '',
    synopsis: book?.synopsis || '',
    status: book?.status || 'want',
    cover_url: book?.cover_url || '',
    rating: book?.rating || 0,
    notes: book?.notes || '',
    pages: book?.pages || 0,
  })
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    try {
      const q = encodeURIComponent(query)
      const res = await fetch(`${GOOGLE_BOOKS_URL}?q=${q}&maxResults=20`)
      const data = await res.json()
      setResults((data.items || []).map(extractBook).filter(b => b.title))
    } catch {
      alert('Error buscando libros')
    }
    setSearching(false)
  }

  function selectResult(result) {
    setForm(prev => ({
      ...prev,
      title: result.title,
      author: result.author,
      category: result.category,
      synopsis: result.synopsis,
      cover_url: result.cover_url,
    }))
    setSelected(true)
    setResults([])
    setQuery(result.title)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, user_id: userId }
    if (isEdit) {
      await supabase.from('books').update(form).eq('id', book.id)
    } else {
      await supabase.from('books').insert(payload)
    }
    setSaving(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div className="modal-header-left">
            {isEdit && book.cover_url && (
              <img src={book.cover_url} alt={book.title} className="modal-header-cover" />
            )}
            <div>
              <h2>{isEdit ? 'Editar libro' : 'Añadir libro'}</h2>
              {isEdit && <p className="modal-header-subtitle">{book.title}</p>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} type="button">✕</button>
        </div>

        {/* Buscador solo al añadir, no al editar */}
        {!isEdit && (
          <div className="book-search-bar">
            <input
              className="book-search-input"
              placeholder="Busca por título para autorellenar..."
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(false) }}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <button className="btn-search" type="button" onClick={search} disabled={searching}>
              {searching ? '...' : 'Buscar'}
            </button>
          </div>
        )}

        {/* ── Resultados ── */}
        {results.length > 0 && (
          <ul className="search-results">
            {results.map((r, i) => (
              <li key={i} className="search-result-item" onClick={() => selectResult(r)}>
                {r.cover_url
                  ? <img src={r.cover_url} alt={r.title} className="result-cover" />
                  : <div className="result-cover-placeholder">📖</div>
                }
                <div className="result-info">
                  <span className="result-title">{r.title}</span>
                  <span className="result-author">{r.author}</span>
                  {r.category && <span className="result-category">{r.category}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ── Formulario de detalles ── */}
        <form onSubmit={handleSubmit} className="book-detail-form">

          {/* Preview portada + campos principales */}
          <div className="form-top">
            <div className="form-cover-col">
              {form.cover_url
                ? <img src={form.cover_url} alt="Portada" className="form-cover-preview" />
                : <div className="form-cover-empty">📚</div>
              }
              <input
                className="cover-url-input"
                placeholder="URL portada"
                value={form.cover_url}
                onChange={e => set('cover_url', e.target.value)}
              />
            </div>

            <div className="form-fields-col">
              <label>Título *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} required />

              <label>Autor</label>
              <input value={form.author} onChange={e => set('author', e.target.value)} />

              <label>Categoría</label>
              <input value={form.category} onChange={e => set('category', e.target.value)}
                placeholder="Ficción, Historia..." />

              <label>Estado</label>
              <div className="status-picker">
                {[
                  { value: 'want', label: 'Lo quiero' },
                  { value: 'have', label: 'Lo tengo' },
                  { value: 'read', label: 'Leído' },
                ].map(s => (
                  <button
                    key={s.value}
                    type="button"
                    className={`status-btn ${form.status === s.value ? 'active' : ''} status-${s.value}`}
                    onClick={() => set('status', s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <label>Páginas</label>
              <input type="number" min="0"
                value={form.pages || ''}
                onChange={e => set('pages', +e.target.value)}
                placeholder="Nº de páginas"
              />

              <label>Calificación</label>
              <StarRating rating={form.rating} onChange={r => set('rating', r)} />
            </div>
          </div>

          {/* Sinopsis */}
          {form.synopsis && (
            <div className="form-synopsis">
              <label>Sinopsis</label>
              <p className="synopsis-text">{form.synopsis}</p>
            </div>
          )}

          {/* Notas personales */}
          <div>
            <label>Mis notas</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Reflexiones, citas favoritas, por qué me interesa..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving || !form.title}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Añadir a mi biblioteca'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
