export function BananaDecoration({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M75 20 C85 25, 90 40, 85 60 C80 80, 60 90, 40 85 C30 82, 25 75, 30 65 C35 55, 50 50, 65 45 C75 42, 78 35, 75 20"
          fill="#FFE135"
          stroke="#E6C82E"
          strokeWidth="2"
        />
        <path
          d="M72 25 C78 28, 82 38, 80 52 C77 68, 62 78, 48 75"
          fill="none"
          stroke="#FFD700"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
