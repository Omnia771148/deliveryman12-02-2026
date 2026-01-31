module.exports = {
    globDirectory: 'public/',
    globPatterns: [
        '**/*.{svg,png,json,ico}'
    ],
    swDest: 'public/sw.js',
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [{
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
            cacheName: 'offline-cache',
            expiration: {
                maxEntries: 200,
            }
        }
    }]
};
