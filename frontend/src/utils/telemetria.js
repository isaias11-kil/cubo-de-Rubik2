// frontend/src/utils/telemetria.js

// Lee la IP de DigitalOcean desde tu archivo .env
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://157.230.54.54:5000';

// frontend/src/utils/telemetria.js

// Ahora la función recibe un objeto 'detallesExtra' con los datos reales
export const registrarEvento = async (tipo, detallesExtra = {}) => {
  try {
    const payload = {
      tipo_evento: tipo,
      tipo_accion: tipo,
      detalles: "Enviado desde el panel de control",
      // En lugar de números fijos, usamos las variables que le pasemos a la función
      // Si no viene el dato, ponemos 0 como valor por defecto para que no falle
      grados_motor: detallesExtra.grados || 0,
      cara_cubo: detallesExtra.cara || "N/A",
      cantidad_movimientos: detallesExtra.movimientos || 0,
      tiempo_armado_segundos: detallesExtra.tiempo || 0
    };

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://157.230.54.54:5000'}/api/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ El servidor rechazó los datos:", errorData);
    } else {
      console.log("✅ Evento guardado con éxito");
    }
  } catch (error) {
    console.error("❌ Error de red:", error);
  }
};