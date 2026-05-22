// frontend/src/utils/apiRobot.js

// Apuntamos al nuevo puerto 5005 donde ahora vive el backend (o a la IP de Ubuntu)
const backendUrl = import.meta.env.VITE_API_URL || 'http://157.230.54.54:5000';

export const enviarSolucionAlRobot = async (movesList) => {
  try {
    // Armamos el payload exacto para la bitácora
    // Precaución: mantener las llaves estrictamente en minúsculas
    const payload = {
      secuencia_movimientos: movesList,
      fecha_resolucion: new Date().toISOString()
    };

    // Petición POST "silenciosa" a la bitácora de eventos
    fetch(`${backendUrl}/api/eventos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then(res => {
      if(res.status === 201 || res.status === 200) {
        console.log("✅ Bitácora: Respaldo de la solución guardado exitosamente en MongoDB");
      }
    }).catch(err => {
      // Si el servidor de respaldo está apagado, no rompemos la página web ni el Bluetooth
      console.warn("⚠️ Bitácora: No se pudo contactar al servidor de respaldo.", err);
    });

  } catch (error) {
    console.error("Error armando el respaldo para MongoDB:", error);
  }
};