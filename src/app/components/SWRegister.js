'use client';
import { useEffect } from 'react';

export default function SWRegister() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register immediately or on load
            const register = () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('✅ Service Worker registered with scope:', registration.scope);
                    })
                    .catch((err) => {
                        console.error('❌ Service Worker registration failed:', err);
                    });
            };

            window.addEventListener('load', register);

            return () => window.removeEventListener('load', register);
        }
    }, []);

    return null;
}
