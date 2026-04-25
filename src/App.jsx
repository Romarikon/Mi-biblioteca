import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Library from './pages/Library'
import Auth from './pages/Auth'
import BookDetail from './pages/BookDetail'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState(null)
  const [libraryKey, setLibraryKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  // Pushea estado al historial cuando se abre un libro
  useEffect(() => {
    if (selectedBook) {
      window.history.pushState({ view: 'detail' }, '')
    }
  }, [selectedBook?.id])

  // Intercepta el botón atrás del navegador
  useEffect(() => {
    const handlePop = () => {
      if (selectedBook) {
        setSelectedBook(null)
        setLibraryKey(k => k + 1)
      }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [selectedBook])

  function goBack() {
    setSelectedBook(null)
    setLibraryKey(k => k + 1)
    window.history.back()
  }

  if (loading) return <div className="loading">Cargando...</div>
  if (!session) return <Auth />
  if (selectedBook) return (
    <BookDetail
      book={selectedBook}
      session={session}
      onBack={goBack}
      onBookUpdate={setSelectedBook}
    />
  )
  return <Library key={libraryKey} session={session} onOpenBook={setSelectedBook} />
}
