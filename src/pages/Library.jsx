import { useState, useEffect } from 'react'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, useDroppable, useDraggable,
  pointerWithin, rectIntersection
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../lib/supabase'
import BookCard from '../components/BookCard'
import BookForm from '../components/BookForm'
import StatsBar from '../components/StatsBar'
import DailyQuote from '../components/DailyQuote'
import ReadingGoal from '../components/ReadingGoal'
import OnboardingTour from '../components/OnboardingTour'
import { useDarkMode } from '../hooks/useDarkMode'

// ── Draggable wrapper ────────────────────────────────────────
function DraggableCard({ book, ...cardProps }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: book.id,
    data: { book },
  })

  return (
    <div
      ref={setNodeRef}
      className="draggable-item"
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s',
        position: 'relative',
        zIndex: isDragging ? 50 : 'auto',
      }}
    >
      <div className="drag-handle" {...listeners} {...attributes} title="Arrastrar">
        ⠿
      </div>
      <BookCard book={book} {...cardProps} />
    </div>
  )
}

// ── Droppable zone ───────────────────────────────────────────
function DroppableZone({ id, label, count, countClass, emptyText, books, accentClass, postitMap, quoteMap, ...cardProps }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <section
      ref={setNodeRef}
      className={`column droppable-zone ${isOver ? `zone-over ${accentClass}-over` : ''}`}
    >
      <div className={`zone-header ${accentClass}`}>
        <span className="zone-label">{label}</span>
        <span className={`count ${countClass}`}>{count}</span>
      </div>
      <div className="zone-body">
        {books.map(b => (
          <DraggableCard
            key={b.id}
            book={b}
            postitCount={postitMap[b.id] || 0}
            quoteCount={quoteMap[b.id] || 0}
            {...cardProps}
          />
        ))}
        {books.length === 0 && (
          <p className={`zone-empty ${isOver ? 'zone-empty-over' : ''}`}>{emptyText}</p>
        )}
      </div>
    </section>
  )
}

// ── Droppable read section ───────────────────────────────────
function DroppableReadZone({ books, postitMap, quoteMap, ...cardProps }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'read' })

  return (
    <section
      ref={setNodeRef}
      className={`read-section droppable-zone ${isOver ? 'zone-over zone-read-over' : ''}`}
    >
      <div className="zone-header zone-read">
        <span className="zone-label">Leídos</span>
        <span className="count count-read">{books.length}</span>
      </div>
      <div className={`read-grid zone-body ${isOver ? 'read-over' : ''}`}>
        {books.map(b => (
          <DraggableCard
            key={b.id}
            book={b}
            postitCount={postitMap[b.id] || 0}
            quoteCount={quoteMap[b.id] || 0}
            {...cardProps}
          />
        ))}
      </div>
      {books.length === 0 && (
        <p className={`zone-empty ${isOver ? 'zone-empty-over' : ''}`}>
          Arrastra aquí los libros que hayas terminado
        </p>
      )}
    </section>
  )
}

// ── Main Library ─────────────────────────────────────────────
export default function Library({ session, onOpenBook }) {
  const [books, setBooks] = useState([])
  const [postitMap, setPostitMap] = useState({})
  const [quoteMap, setQuoteMap] = useState({})
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [activeBook, setActiveBook] = useState(null)
  const [dark, setDark] = useDarkMode()
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('tour_done'))
  const [sortOthers, setSortOthers] = useState('default') // 'default' | 'alpha'
  const [sortRead, setSortRead] = useState('default')     // 'default' | 'alpha' | 'date'

  const currentYear = new Date().getFullYear()
  const booksReadThisYear = books.filter(b => {
    if (b.status !== 'read') return false
    if (!b.finished_at) return true
    return new Date(b.finished_at).getFullYear() === currentYear
  }).length

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  useEffect(() => { fetchBooks(); fetchCounts() }, [])

  async function fetchBooks() {
    const { data, error } = await supabase
      .from('books').select('*').order('created_at', { ascending: false })
    if (!error) setBooks(data)
  }

  async function fetchCounts() {
    const [{ data: postits }, { data: quotes }] = await Promise.all([
      supabase.from('postits').select('book_id'),
      supabase.from('quotes').select('book_id'),
    ])
    const pm = {}
    postits?.forEach(p => { pm[p.book_id] = (pm[p.book_id] || 0) + 1 })
    setPostitMap(pm)
    const qm = {}
    quotes?.forEach(q => { qm[q.book_id] = (qm[q.book_id] || 0) + 1 })
    setQuoteMap(qm)
  }

  async function updateStatus(id, status) {
    const finished_at = status === 'read' ? new Date().toISOString() : null
    await supabase.from('books').update({ status, finished_at }).eq('id', id)
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status, finished_at } : b))
  }

  async function updateRating(id, rating) {
    await supabase.from('books').update({ rating }).eq('id', id)
    setBooks(prev => prev.map(b => b.id === id ? { ...b, rating } : b))
  }

  async function deleteBook(id) {
    await supabase.from('books').delete().eq('id', id)
    setBooks(prev => prev.filter(b => b.id !== id))
  }

  function handleDragStart({ active }) {
    const book = books.find(b => b.id === active.id)
    setActiveBook(book || null)
  }

  async function handleDragEnd({ active, over }) {
    setActiveBook(null)
    if (!over) return
    const newStatus = over.id // 'want' | 'have' | 'read'
    const book = books.find(b => b.id === active.id)
    if (!book || book.status === newStatus) return
    await updateStatus(active.id, newStatus)
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  function applySort(arr, sort) {
    if (sort === 'alpha') return [...arr].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'date')  return [...arr].sort((a, b) => {
      if (!a.finished_at) return 1
      if (!b.finished_at) return -1
      return new Date(b.finished_at) - new Date(a.finished_at)
    })
    return arr
  }

  const want = applySort(filtered.filter(b => b.status === 'want'), sortOthers)
  const have = applySort(filtered.filter(b => b.status === 'have'), sortOthers)
  const read = applySort(filtered.filter(b => b.status === 'read'), sortRead)

  const cardProps = (b) => ({
    onStatusChange: updateStatus,
    onRatingChange: updateRating,
    onDelete: deleteBook,
    onOpen: onOpenBook,
    postitCount: postitMap[b.id] || 0,
    quoteCount: quoteMap[b.id] || 0,
  })

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="library">
        <header className="library-header">
          <div className="header-left">
            <h1>📚 Mi Biblioteca</h1>
            <ReadingGoal booksReadThisYear={booksReadThisYear} />
          </div>
          <div className="header-actions">
            <input
              className="search"
              placeholder="Buscar título o autor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Añadir
            </button>
            <button className="dark-toggle" onClick={() => setDark(d => !d)}>
              {dark ? '☀ Claro' : '◑ Oscuro'}
            </button>
            <button className="btn-ghost" onClick={() => supabase.auth.signOut()}>Salir</button>
          </div>
        </header>

        <DailyQuote />
        <StatsBar books={books} />

        <div className="sort-bar">
          <span className="sort-label">Ordenar:</span>
          <button className={`sort-btn ${sortOthers === 'default' ? 'active' : ''}`} onClick={() => setSortOthers('default')}>Reciente</button>
          <button className={`sort-btn ${sortOthers === 'alpha'   ? 'active' : ''}`} onClick={() => setSortOthers('alpha')}>A–Z</button>
        </div>

        <div className="columns">
          <DroppableZone
            id="want"
            label="No lo tengo"
            count={want.length}
            countClass="count-want"
            accentClass="zone-want"
            emptyText="Arrastra aquí los libros que quieras leer"
            books={want}
            onStatusChange={updateStatus}
            onRatingChange={updateRating}
            onDelete={deleteBook}
            onOpen={onOpenBook}
            postitMap={postitMap}
            quoteMap={quoteMap}
          />
          <DroppableZone
            id="have"
            label="Lo tengo"
            count={have.length}
            countClass="count-have"
            accentClass="zone-have"
            emptyText="Arrastra aquí los libros de tu estantería"
            books={have}
            onStatusChange={updateStatus}
            onRatingChange={updateRating}
            onDelete={deleteBook}
            onOpen={onOpenBook}
            postitMap={postitMap}
            quoteMap={quoteMap}
          />
        </div>

        <div className="sort-bar">
          <span className="sort-label">Leídos:</span>
          <button className={`sort-btn ${sortRead === 'default' ? 'active' : ''}`} onClick={() => setSortRead('default')}>Reciente</button>
          <button className={`sort-btn ${sortRead === 'alpha'   ? 'active' : ''}`} onClick={() => setSortRead('alpha')}>A–Z</button>
          <button className={`sort-btn ${sortRead === 'date'    ? 'active' : ''}`} onClick={() => setSortRead('date')}>Fecha lectura</button>
        </div>

        <DroppableReadZone
          books={read}
          onStatusChange={updateStatus}
          onRatingChange={updateRating}
          onDelete={deleteBook}
          onOpen={onOpenBook}
          postitMap={postitMap}
          quoteMap={quoteMap}
        />

        {showForm && (
          <BookForm
            userId={session.user.id}
            onClose={() => setShowForm(false)}
            onSave={() => { fetchBooks(); setShowForm(false) }}
          />
        )}
      </div>

      {/* Preview flotante mientras arrastras */}
      <DragOverlay dropAnimation={null}>
        {activeBook && (
          <div className="drag-overlay-card">
            {activeBook.cover_url
              ? <img src={activeBook.cover_url} alt={activeBook.title} />
              : <span>📖</span>
            }
            <div>
              <p className="drag-overlay-title">{activeBook.title}</p>
              <p className="drag-overlay-author">{activeBook.author}</p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>

    {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
    </>
  )
}
