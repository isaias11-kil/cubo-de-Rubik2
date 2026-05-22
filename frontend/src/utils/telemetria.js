// frontend/src/utils/telemetria.js

// Lee la IP de DigitalOcean desde tu archivo .env
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://157.230.54.54:5000';

// frontend/src/utils/telemetria.js
export const registrarEvento = async (tipo, detalles) => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/api/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_accion: tipo, // <--- Esto tiene que coincidir con el backend
        detalles: JSON.stringify(detalles)
      })
    });
  } catch (error) {
    console.error("Error en telemetría:", error);
  }
};