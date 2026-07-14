export function formatDate(dateString, options = {}) {
    const date = new Date(dateString)
    const defaults = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
    return date.toLocaleDateString('en-US', { ...defaults, ...options })
}

export function getTimeAgo(timestamp) {
    const date = new Date(timestamp)
    const seconds = Math.floor((Date.now() - date) / 1000)

    const intervals = [
        { label: 'y', seconds: 31536000 },
        { label: 'mo', seconds: 2592000 },
        { label: 'd', seconds: 86400 },
        { label: 'h', seconds: 3600 },
        { label: 'm', seconds: 60 },
    ]

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds)
        if (count >= 1) return `${count}${interval.label} ago`
    }
    return 'just now'
}
