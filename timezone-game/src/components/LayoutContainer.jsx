import { cn } from '../utils/cn'

/**
 * LayoutContainer — Full-screen "PowerPoint" style wrapper.
 * 100vh × 100vw, overflow hidden, no scrolling.
 */
export default function LayoutContainer({ children, className }) {
    return (
        <div
            className={cn(
                'w-screen h-screen overflow-hidden relative',
                'bg-background font-sans',
                className
            )}
        >
            {children}
        </div>
    )
}
