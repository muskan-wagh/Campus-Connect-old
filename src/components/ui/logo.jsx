import Link from 'next/link'

const sizes = {
  sm: { box: 'h-7 w-7', text: 'text-xs', brand: 'text-sm' },
  md: { box: 'h-8 w-8', text: 'text-sm', brand: 'text-base' },
  lg: { box: 'h-10 w-10', text: 'text-base', brand: 'text-lg' },
}

export function Logo({ href = '/', size = 'md', showText = true }) {
  const s = sizes[size]
  return (
    <Link href={href} className="flex items-center gap-2 shrink-0">
      <div className={`${s.box} rounded-lg bg-foreground flex items-center justify-center`}>
        <span className={`${s.text} text-background font-bold`}>CC</span>
      </div>
      {showText && (
        <span className={`${s.brand} font-semibold tracking-tight`}>
          Campus<span className="text-muted-foreground">Connect</span>
        </span>
      )}
    </Link>
  )
}
