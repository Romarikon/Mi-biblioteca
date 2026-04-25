export default function StarRating({ rating, onChange, readonly = false }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          className={`star ${star <= rating ? 'filled' : ''}`}
          onClick={() => !readonly && onChange && onChange(star === rating ? 0 : star)}
          disabled={readonly}
          type="button"
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
