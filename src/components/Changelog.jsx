export const APP_VERSION = '1.7'

const RELEASES = [
  {
    version: '1.7',
    date: 'Abril 2025',
    changes: [
      'Migración a Open Library API — sin límite de cuota diaria',
      'Sinopsis automática al seleccionar un libro',
      'Buscador visual de portadas — elige entre varias ediciones con un toque',
      'Logo SVG propio e historial de versiones',
      'Ordenación por nombre (A–Z) y fecha de lectura en cada sección',
      'Login automático — el email se guarda, solo haces clic en el link',
      'Sesión persistente entre visitas y en iPhone',
    ],
  },
  {
    version: '1.5',
    date: 'Abril 2025',
    changes: [
      'Tutorial de bienvenida para nuevos usuarios',
      'App instalable en iPhone como PWA (Añadir a pantalla de inicio)',
      'Icono y manifest configurados',
      'Deploy en Vercel con dominio público',
    ],
  },
  {
    version: '1.4',
    date: 'Abril 2025',
    changes: [
      'Rediseño completo del CSS — tipografía, colores, sombras y espaciado',
      '200+ citas de filosofía, ciencia, arte, humor y literatura',
      'Citas aleatorias en cada carga de página',
      'Drag & drop entre columnas — detección por posición del cursor',
      'Handle de arrastre visible al pasar el ratón',
    ],
  },
  {
    version: '1.3',
    date: 'Abril 2025',
    changes: [
      'Drag & drop entre columnas con @dnd-kit',
      'Modo oscuro con toggle y persistencia',
      'Reto lector anual con anillo SVG animado',
      'Cita literaria del día con botón de aleatoria',
      'Seguimiento de libros prestados (a quién y cuándo)',
    ],
  },
  {
    version: '1.2',
    date: 'Abril 2025',
    changes: [
      'Post-its de colores con referencia de página',
      'Guardado de citas favoritas por libro',
      'Pestaña de notas y reseña personal',
      'Zoom de portada al pasar el ratón',
      'Indicadores de actividad en las tarjetas (notas, citas, reseña)',
    ],
  },
  {
    version: '1.1',
    date: 'Abril 2025',
    changes: [
      'Autocompletado con Google Books — portada, autor, sinopsis y género',
      'Barra de estadísticas (total leído, páginas, valoración media)',
      'Barra de progreso de lectura por libro',
      'Página de detalle del libro',
      'Valoración con estrellas',
    ],
  },
  {
    version: '1.0',
    date: 'Abril 2025',
    changes: [
      'Biblioteca personal con tres secciones: Quiero, Tengo, Leído',
      'Autenticación con magic link por email',
      'Añadir, editar y borrar libros',
      'Sincronización en tiempo real con Supabase',
      'Búsqueda por título y autor',
    ],
  },
]

export default function Changelog({ onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal changelog-modal">
        <div className="modal-header">
          <h2>📋 Historial de versiones</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="changelog-list">
          {RELEASES.map((release, i) => (
            <div key={release.version} className="changelog-release">
              <div className="changelog-release-header">
                <span className="changelog-version">v{release.version}</span>
                {i === 0 && <span className="changelog-latest">Actual</span>}
                <span className="changelog-date">{release.date}</span>
              </div>
              <ul className="changelog-changes">
                {release.changes.map((change, j) => (
                  <li key={j}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
