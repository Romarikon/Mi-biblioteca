import { useState } from 'react'
import { supabase } from '../lib/supabase'
import StarRating from './StarRating'

const OL_SEARCH = 'https://openlibrary.org/search.json'
const OL_COVER  = (id, size = 'M') => `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`

function extractBook(doc) {
  return {
    title:     doc.title || '',
    author:    (doc.author_name || []).join(', '),
    category:  (doc.subject || [''])[0]?.split('--')[0].trim() || '',
    synopsis:  '',
    cover_url: doc.cover_i ? OL_COVER(doc.cover_i, 'L') : '',
    pages:     doc.number_of_pages_median || 0,
    _key:      doc.key || '',
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
  const [coverResults, setCoverResults] = useState([])
  const [searchingCovers, setSearchingCovers] = useState(false)

  async function searchCovers() {
    if (!form.title.trim()) return
    setSearchingCovers(true)
    setCoverResults([])
    try {
      const q = encodeURIComponent(`${form.title} ${form.author}`.trim())
      const res = await fetch(`${OL_SEARCH}?q=${q}&limit=15&fields=cover_i`)
      const data = await res.json()
      const covers = (data.docs || [])
        .filter(d => d.cover_i)
        .map(d => OL_COVER(d.cover_i, 'M'))
        .filter((url, i, arr) => arr.indexOf(url) === i)
      setCoverResults(covers)
    } catch {}
    setSearchingCovers(false)
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    try {
      const q = encodeURIComponent(query)
      const res = await fetch(`${OL_SEARCH}?q=${q}&limit=20&fields=title,author_name,cover_i,number_of_pages_median,subject,key`)
      const data = await res.json()
      setResults((data.docs || []).map(extractBook).filter(b => b.title))
    } catch {
      alert('Error buscando libros')
    }
    setSearching(false)
  }

  async function selectResult(result) {
    setForm(prev => ({
      ...prev,
      title:     result.title,
      author:    result.author,
      category:  result.category,
      synopsis:  '',
      cover_url: result.cover_url,
      pages:     result.pages || prev.pages,
    }))
    setSelected(true)
    setResults([])
    setQuery(result.title)

    if (result._key) {
      try {
        const res = await fetch(`https://openlibrary.org${result._key}.json`)
        const data = await res.json()
        const synopsis = typeof data.description === 'string'
          ? data.description
          : data.description?.value || ''
        if (synopsis) setForm(prev => ({ ...prev, synopsis }))
      } catch {}
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const now = new Date().toISOString()
    if (isEdit) {
      const fields = { ...form }
      if (fields.status === 'read' && !book.finished_at) fields.finished_at = now
      if (fields.status !== 'read') fields.finished_at = null
      if (fields.status === 'read' && fields.pages > 0) fields.current_page = fields.pages
      await supabase.from('books').update(fields).eq('id', book.id)
    } else {
      const payload = { ...form, user_id: userId }
      if (payload.status === 'read') payload.finished_at = now
      if (payload.status === 'read' && payload.pages > 0) payload.current_page = payload.pages
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
              <button
                type="button"
                className="btn-cover-search"
                onClick={searchCovers}
                disabled={searchingCovers || !form.title}
                title="Buscar portada automáticamente"
              >
                {searchingCovers ? '...' : '🔍 Buscar'}
              </button>

              <input
                type="url"
                className="cover-url-input"
                placeholder="O pega una URL..."
                value={form.cover_url}
                onChange={e => { set('cover_url', e.target.value); setCoverResults([]) }}
              />

              {coverResults.length > 0 && (
                <div className="cover-picker">
                  {coverResults.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="opción"
                      className={`cover-option ${form.cover_url === url ? 'selected' : ''}`}
                      onClick={() => { set('cover_url', url); setCoverResults([]) }}
                    />
                  ))}
                </div>
              )}
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
