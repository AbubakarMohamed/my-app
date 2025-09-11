import _ from 'lodash';
window._ = _;

/**
 * Axios Setup
 * Axios is an HTTP client to interact with your Laravel back-end.
 * It automatically handles sending the CSRF token for security.
 */
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/', // 👈 change to '/api' if you’re using api.php routes
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // important if using Sanctum for auth
});

// Attach CSRF token (for web.php routes, not needed for Sanctum API unless you’re using session cookies)
let token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    axiosInstance.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

window.axios = axiosInstance; // still expose globally if needed
export default axiosInstance;  // 👈 prefer importing directly in services

/**
 * Echo (Real-time) - Uncomment only if using Laravel Echo + Pusher
 */
// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';

// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: import.meta.env.VITE_PUSHER_APP_KEY,
//     cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
//     wsHost: import.meta.env.VITE_PUSHER_HOST
//         ? import.meta.env.VITE_PUSHER_HOST
//         : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
//     wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
//     wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
// });
