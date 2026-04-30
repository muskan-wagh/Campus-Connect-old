'use client'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NotificationDropdown({ user }) {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createSupabaseClient()
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (user) {
            fetchNotifications()

            // Subscribe to real-time notifications
            const channel = supabase
                .channel(`notifications:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setNotifications(prev => [payload.new, ...prev])
                            setUnreadCount(prev => prev + 1)
                        } else if (payload.eventType === 'UPDATE') {
                            setNotifications(prev =>
                                prev.map(n => n.id === payload.new.id ? payload.new : n)
                            )
                            updateUnreadCount()
                        } else if (payload.eventType === 'DELETE') {
                            setNotifications(prev => prev.filter(n => n.id === payload.old.id))
                            updateUnreadCount()
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user])

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (!error) {
            setNotifications(data)
            updateUnreadCount(data)
        }
    }

    const updateUnreadCount = (data = null) => {
        if (data) {
            setUnreadCount(data.filter(n => !n.is_read).length)
        } else {
            // Re-calc from state? Or just fetch again? 
            // Better to re-calc from state
            setNotifications(prev => {
                setUnreadCount(prev.filter(n => !n.is_read).length)
                return prev
            })
        }
    }

    const markAsRead = async (id) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    const getTimeAgo = (timestamp) => {
        const date = new Date(timestamp)
        const seconds = Math.floor((new Date() - date) / 1000)

        let interval = seconds / 31536000
        if (interval > 1) return Math.floor(interval) + 'y ago'
        interval = seconds / 2592000
        if (interval > 1) return Math.floor(interval) + 'mo ago'
        interval = seconds / 86400
        if (interval > 1) return Math.floor(interval) + 'd ago'
        interval = seconds / 3600
        if (interval > 1) return Math.floor(interval) + 'h ago'
        interval = seconds / 60
        if (interval > 1) return Math.floor(interval) + 'm ago'
        return 'just now'
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-all shadow-sm border border-border relative"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-card rounded-[2rem] shadow-2xl border border-border overflow-hidden z-50">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="font-black text-foreground tracking-tight">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    className={`p-6 border-b border-border last:border-0 hover:bg-muted transition-colors cursor-pointer group ${!notif.is_read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                            notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                notif.type === 'error' ? 'bg-destructive/10 text-destructive' :
                                                    'bg-primary/10 text-primary'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {notif.type === 'success' ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                )}
                                            </svg>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-black text-foreground tracking-tight">{notif.title}</h4>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{getTimeAgo(notif.created_at)}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">{notif.message}</p>
                                            {notif.link && (
                                                <Link
                                                    href={notif.link}
                                                    className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:gap-3 transition-all"
                                                >
                                                    View Details <span>&rarr;</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
