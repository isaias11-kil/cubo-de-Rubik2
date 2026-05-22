let port = null;
let writer = null;

export const conectarBluetooth = async () => {
  try {
    // Pedimos al usuario que seleccione el puerto
    port = await navigator.serial.requestPort();
    
    // Intentamos abrirlo
    await port.open({ baudRate: 9600 }); 
    
    writer = port.writable.getWriter();
    return true;

  } catch (error) {
    // 💡 TRUCO: Si el error dice que ya está abierto, lo tomamos como un éxito
    if (error.name === 'InvalidStateError' || error.message.includes('already open')) {
      console.log("🔵 El puerto ya estaba abierto de una sesión anterior.");
      
      // Recuperamos el canal de escritura por si se borró al recargar la página
      if (!writer && port) {
        writer = port.writable.getWriter();
      }
      return true; // Le decimos a React que la conexión fue un éxito
    }

    console.error("Error al conectar Bluetooth:", error);
    return false;
  }
};

export const enviarDatosBluetooth = async (datos) => {
  if (!writer) {
    alert("Primero debes conectar el Bluetooth 🔵");
    return false;
  }
  
  try {
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(datos));
    return true;
  } catch (error) {
    console.error("Error al enviar datos:", error);
    return false;
  }
};