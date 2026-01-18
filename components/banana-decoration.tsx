export function SparkleDecoration({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M50 15 L55 35 L75 35 L60 50 L65 70 L50 55 L35 70 L40 50 L25 35 L45 35 Z"
          fill="#FFD700"
          stroke="#FFC107"
          strokeWidth="2"
        />
        <circle cx="50" cy="45" r="4" fill="#FFF8DC" />
        <circle cx="40" cy="50" r="3" fill="#FFF8DC" />
        <circle cx="60" cy="50" r="3" fill="#FFF8DC" />
      </svg>
    </div>
  )
}
