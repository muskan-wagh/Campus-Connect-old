'use client'

import NotificationDropdown from './NotificationDropdown'
import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Header({ title, subtitle, user }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState({ clubs: [], events: [] })
    const [isSearching, setIsSearching] = useState(false)
    const supabase = createSupabaseClient()

    useEffect(() => {
        const search = async () => {
            if (searchQuery.trim().length < 2) {
                setResults({ clubs: [], events: [] })
                return
            }
            setIsSearching(true)
            try {
                const [clubRes, eventRes] = await Promise.all([
                    supabase.from('clubs').select('id, name').ilike('name', `%${searchQuery}%`).eq('is_approved', true).limit(5),
                    supabase.from('events').select('id, title').ilike('title', `%${searchQuery}%`).eq('is_admin_approved', true).eq('status', 'published').limit(5)
                ])
                setResults({
                    clubs: clubRes.data || [],
                    events: eventRes.data || []
                })
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsSearching(false)
            }
        }
        const timer = setTimeout(search, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    return (
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12 pb-10 md:pb-16 pt-4">
            <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <span className="font-serif italic text-xl text-primary opacity-30 tracking-tight">Index</span>
                    <span className="w-8 h-px bg-border"></span>
                    <span className="journal-label mb-0 text-muted-foreground">{title}</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-serif tracking-tight text-foreground mb-4 md:mb-6 leading-[0.9]">
                    {title}
                </h1>

                <p className="max-w-md text-[10px] uppercase tracking-[0.3em] font-medium text-muted-foreground leading-relaxed">
                    {subtitle}
                </p>
            </div>

            <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="relative group flex-grow md:flex-grow-0">
                    <div className="flex items-center gap-4 border-b border-border pb-2 transition-all focus-within:border-primary w-full">
                        {isSearching ? (
                            <div className="w-4 h-4 border border-primary border-t-transparent animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                        <input
                            type="text"
                            placeholder="Search Catalogue..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-[11px] uppercase tracking-widest font-bold text-foreground outline-none w-full md:w-48 placeholder:text-muted-foreground/30"
                        />
                    </div>

                    {/* Search Results Dropdown - Journal Styled */}
                    {searchQuery.trim().length >= 2 && (
                        <div className="absolute top-full mt-4 left-0 right-0 bg-card border border-border shadow-2xl z-[100] p-6 animate-in fade-in slide-in-from-top-1 duration-300 rounded-sm">
                            {results.clubs.length === 0 && results.events.length === 0 && !isSearching ? (
                                <div className="journal-label text-center grayscale py-4 text-muted-foreground">No Entries Found</div>
                            ) : (
                                <div className="space-y-8">
                                    {results.clubs.length > 0 && (
                                        <div>
                                            <div className="journal-label mb-4 opacity-50 text-muted-foreground">Memberships</div>
                                            <div className="space-y-3">
                                                {results.clubs.map(club => (
                                                    <Link key={club.id} href={`/dashboard/clubs/${club.id}`} className="block text-[11px] font-bold uppercase tracking-widest hover:text-primary transition-colors text-foreground">
                                                        {club.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {results.events.length > 0 && (
                                        <div>
                                            <div className="journal-label mb-4 opacity-50 text-muted-foreground">Transmissions</div>
                                            <div className="space-y-3">
                                                {results.events.map(event => (
                                                    <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block text-[11px] font-bold uppercase tracking-widest hover:text-primary transition-colors text-foreground">
                                                        {event.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <NotificationDropdown user={user} />
            </div>
        </header>
    )
}
