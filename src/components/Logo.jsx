export default function Logo({ className = "text-slate-950", showText = true }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showText && (
                <span className="text-2xl font-serif tracking-tight">
                    Campus Connect<span className="text-slate-400">.</span>
                </span>
            )}
        </div>
    )
}
