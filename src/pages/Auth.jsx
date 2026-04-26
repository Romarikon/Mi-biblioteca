import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SAVED_EMAIL_KEY = 'mi-biblioteca-email'

export default function Auth() {
  const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [autoSent, setAutoSent] = useState(false)

  // Si hay email guardado, manda el link automáticamente al cargar
  useEffect(() => {
    if (savedEmail && !autoSent) {
      setAutoSent(true)
      supabase.auth.signInWithOtp({ email: savedEmail })
        .then(({ error }) => { if (!error) setSent(true) })
    }
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert(error.message)
    } else {
      localStorage.setItem(SAVED_EMAIL_KEY, email)
      setSent(true)
    }
    setLoading(false)
  }

  function changeAccount() {
    localStorage.removeItem(SAVED_EMAIL_KEY)
    setSent(false)
    setAutoSent(false)
  }

  // Pantalla cuando ya hay email guardado
  if (savedEmail) {
    return (
      <div className="auth-container">
        <h1>📚 Mi Biblioteca</h1>
        {sent ? (
          <>
            <p className="auth-sent">
              Te enviamos un enlace a <strong>{savedEmail}</strong>.<br />
              Haz clic en él para entrar.
            </p>
            <button
              style={{ marginTop: '1rem', background: 'none', border: 'none',
                fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={changeAccount}
            >
              No soy yo — cambiar cuenta
            </button>
          </>
        ) : (
          <p className="auth-sent">Enviando enlace a <strong>{savedEmail}</strong>...</p>
        )}
      </div>
    )
  }

  // Primera vez — pide el email
  return (
    <div className="auth-container">
      <h1>📚 Mi Biblioteca</h1>
      <p className="auth-subtitle">
        Escribe tu email una sola vez.<br />
        La próxima vez entrarás automáticamente.
      </p>
      {sent ? (
        <p className="auth-sent">
          Revisa tu email — te mandé un <strong>enlace</strong> para entrar.
          <br /><br />
          La próxima vez no necesitarás hacer esto.
        </p>
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
            {loading ? 'Enviando...' : 'Entrar'}
          </button>
        </form>
      )}
    </div>
  )
}
