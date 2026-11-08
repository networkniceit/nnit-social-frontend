const LIVE = 'https://nnit-social-backend-production-8ce8.up.railway.app';
// Old Vercel setting pointed to a dead server (6ad7); always use the live one.
const fromEnv = import.meta.env.VITE_API_URL;
export const API_URL = (fromEnv && !fromEnv.includes('6ad7')) ? fromEnv : LIVE;
