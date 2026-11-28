// useScrollTriggerRefresh.ts
'use client'

import { useEffect } from 'react'

let refreshTimer: ReturnType<typeof setTimeout> | null = null
let refreshVersion = 0

export function refreshScrollTriggers() {
    if (refreshTimer) clearTimeout(refreshTimer)

    const version = ++refreshVersion
    refreshTimer = setTimeout(() => {
        refreshTimer = null
        import('gsap/ScrollTrigger')
            .then(({ ScrollTrigger }) => {
                if (version !== refreshVersion) return
                ScrollTrigger.sort()
                ScrollTrigger.refresh()
            })
            .catch((error) => {
                console.error('Failed to refresh scroll triggers:', error)
            })
    }, 100)
}

// NEW: allow cancelling a pending refresh
export function cancelScrollTriggerRefresh() {
    if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
    }
    refreshVersion++
}

export function useScrollTriggerRefresh() {
    useEffect(() => {
        refreshScrollTriggers()

        const handleResize = () => refreshScrollTriggers()
        const handleLoad = () => refreshScrollTriggers()

        window.addEventListener('resize', handleResize)
        window.addEventListener('load', handleLoad)

        const images = Array.from(document.images)
        const pending = images.filter((img) => !img.complete)

        const handleImageLoad = () => refreshScrollTriggers()
        pending.forEach((img) => {
            img.addEventListener('load', handleImageLoad)
            img.addEventListener('error', handleImageLoad)
        })

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('load', handleLoad)
            pending.forEach((img) => {
                img.removeEventListener('load', handleImageLoad)
                img.removeEventListener('error', handleImageLoad)
            })
            cancelScrollTriggerRefresh()
        }
    }, [])
}