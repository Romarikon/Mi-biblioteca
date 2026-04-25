export default function StatsBar({ books }) {
  const currentYear = new Date().getFullYear()

  const read = books.filter(b => b.status === 'read')
  const thisYear = read.filter(b => b.finished_at && new Date(b.finished_at).getFullYear() === currentYear)
  const totalPages = read.reduce((sum, b) => sum + (b.pages || 0), 0)
  const avgRating = read.filter(b => b.rating > 0).length > 0
    ? (read.filter(b => b.rating > 0).reduce((s, b) => s + b.rating, 0) / read.filter(b => b.rating > 0).length).toFixed(1)
    : null

  const genreCount = {}
  read.forEach(b => { if (b.category) genreCount[b.category] = (genreCount[b.category] || 0) + 1 })
  const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0]

  if (books.length === 0) return null

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-value">{read.length}</span>
        <span className="stat-label">leídos</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value">{thisYear.length}</span>
        <span className="stat-label">este año</span>
      </div>
      {totalPages > 0 && <>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{totalPages.toLocaleString()}</span>
          <span className="stat-label">páginas</span>
        </div>
      </>}
      {avgRating && <>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">⭐ {avgRating}</span>
          <span className="stat-label">promedio</span>
        </div>
      </>}
      {topGenre && <>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{topGenre}</span>
          <span className="stat-label">género favorito</span>
        </div>
      </>}
    </div>
  )
}
