// frontend/src/utils/config.js

// El sistema intenta leer la variable del entorno; si no existe, usa localhost:5000 por defecto.
export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://157.230.54.54:5000';