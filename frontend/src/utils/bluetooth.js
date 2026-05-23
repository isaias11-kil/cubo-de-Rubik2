let port = null;
let writer = null;
let reader = null; // 👈 Nuevo: necesitamos el lector

export const conectarBluetooth = async (onMessageReceived) => { // 👈 Recibe un "aviso"
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    
    writer = port.writable.getWriter();
    
    // 👈 NUEVO: Iniciamos el bucle de lectura en segundo plano
    leerDatos(onMessageReceived); 

    return true;
  } catch (error) {
    if (error.name === 'InvalidStateError' || error.message.includes('already open')) {
      console.log("🔵 El puerto ya estaba abierto.");
      if (!writer && port) writer = port.writable.getWriter();
      leerDatos(onMessageReceived); // Volvemos a escuchar
      return true;
    }
    console.error("Error al conectar:", error);
    return false;
  }
};

// 👈 Esta función escucha todo lo que llega del Arduino
async function leerDatos(onMessageReceived) {
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  reader = textDecoder.readable.getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        console.log("🤖 Arduino dice:", value);
        if (onMessageReceived) onMessageReceived(value.trim()); // Enviamos el mensaje a React
      }
    }
  } catch (error) {
    console.error("Error leyendo datos:", error);
  }
}

export const enviarDatosBluetooth = async (datos) => {
  // ... (tu código de envío actual, no cambia)
};