
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// We create a custom hook to handle the logic
function usePageTransition() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // This useEffect hook is responsible for ending the progress bar 
    // when a navigation completes.
    useEffect(() => {
        NProgress.done();
    }, [pathname, searchParams]);

    // This useEffect hook sets up a global click listener to start the 
    // progress bar when a link is clicked. It's a robust way to handle
    // navigations initiated by <Link> components in Next.js 13+ App Router.
    useEffect(() => {
        const handleLinkClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // We look for an 'a' tag ancestor to ensure we're capturing a link click.
            const anchor = target.closest('a');

            // We start the progress bar only if it's a valid, internal link.
            if (anchor && anchor.href && anchor.target !== '_blank' && new URL(anchor.href).origin === window.location.origin) {
                NProgress.start();
            }
        };

        // We listen for 'mousedown' instead of 'click' because it fires earlier,
        // giving a more immediate feedback to the user.
        document.addEventListener('mousedown', handleLinkClick);

        // Cleanup function to remove the event listener when the component unmounts.
        return () => {
            document.removeEventListener('mousedown', handleLinkClick);
            NProgress.done(); // Ensure we clean up on unmount.
        };
    }, []); // Empty dependency array means this effect runs only once on mount.

    return null; // This component does not render anything itself.
}

// The main component that we will include in our layout.
export function PageTransitionLoader() {
    usePageTransition();

    // The component's return is null because `nprogress` injects the
    // progress bar directly into the DOM. We just need to manage its lifecycle.
    return null;
}
