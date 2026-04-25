import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <h1>📚 Mi Biblioteca</h1>
      <p className="auth-subtitle">Tu colección personal de libros</p>
      {sent ? (
        <p className="auth-sent">Revisa tu email — te mandé un <strong>enlace mágico</strong> para entrar.</p>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Entrar con email'}
          </button>
        </form>
      )}
    </div>
  )
}
