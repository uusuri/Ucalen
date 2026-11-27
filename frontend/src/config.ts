const configuredApiBase = process.env.REACT_APP_API_BASE;

export const API_BASE = configuredApiBase || 'http://localhost:8080';
export const USE_BACKEND = process.env.NODE_ENV === 'production' || Boolean(configuredApiBase);
