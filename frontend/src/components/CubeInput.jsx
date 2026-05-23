import { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateCubeParity } from '../utils/cubeValidator';
import { solveRubik } from '../utils/cubeSolver';
import { registrarEvento } from '../utils/telemetria'; // ✅ Bitácora para Ubuntu
import { conectarBluetooth, enviarDatosBluetooth } from '../utils/bluetooth'; // ✅ Control físico del Robot

const COLORS = {
  white: { hex: '#FFFFFF', name: 'Blanco' },
  yellow: { hex: '#FFD500', name: 'Amarillo' },
  green: { hex: '#009E60', name: 'Verde' },
  blue: { hex: '#0051BA', name: 'Azul' },
  orange: { hex: '#FF5800', name: 'Naranja' },
  red: { hex: '#C41E3A', name: 'Rojo' },
};

const initialCube = {
  U: Array(9).fill(null).map((_, i) => (i === 4 ? 'white' : null)),
  L: Array(9).fill(null).map((_, i) => (i === 4 ? 'orange' : null)),
  F: Array(9).fill(null).map((_, i) => (i === 4 ? 'green' : null)),
  R: Array(9).fill(null).map((_, i) => (i === 4 ? 'red' : null)),
  B: Array(9).fill(null).map((_, i) => (i === 4 ? 'blue' : null)),
  D: Array(9).fill(null).map((_, i) => (i === 4 ? 'yellow' : null)),
};

export default function CubeInput() {
  // ✅ El estado de Bluetooth regresa a su lugar
  // Agrega esto a tus estados
  const [startTime, setStartTime] = useState(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [cube, setCube] = useState(initialCube);
  const [activeColor, setActiveColor] = useState('white');
  const [error, setError] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [movesList, setMovesList] = useState('');
  const [invalidEdges, setInvalidEdges] = useState([]);

  const getCounts = (cube) => {
    const counts = { white: 0, yellow: 0, green: 0, blue: 0, orange: 0, red: 0 };
    Object.values(cube).forEach((face) => {
      face.forEach((color) => {
        if (color && counts[color] !== undefined) {
          counts[color]++;
        }
      });
    });
    return counts;
  };

  const currentCounts = getCounts(cube);

  const handleSquareClick = (faceKey, index) => {
    if (index === 4) {
      setError('El centro es fijo y no se puede cambiar.');
      return;
    }
    const currentColor = cube[faceKey][index];
    if (currentColor === activeColor) return;
    if (activeColor !== 'eraser' && currentCounts[activeColor] >= 9) {
      setError(`Límite alcanzado. Ya hay 9 cuadros de color ${COLORS[activeColor].name}.`);
      return;
    }

    setError('');
    setIsValidated(false);
    setInvalidEdges([]);
    setMovesList('');

    const newCube = { ...cube };
    newCube[faceKey] = [...newCube[faceKey]];
    newCube[faceKey][index] = activeColor === 'eraser' ? null : activeColor;
    setCube(newCube);
  };

  const handleVerifyStructure = async () => {
    const result = validateCubeParity(cube);
    if (!result.valid) {
      setError(result.error);
      setIsValidated(false);
      setInvalidEdges(result.invalidEdges || []);
      setMovesList('');
      
      // 📊 TELEMETRÍA: Reportar error de armado
      registrarEvento('error_validacion', { detalle_error: result.error });
      return;
    }

    try {
      const solution = await solveRubik(cube);
      setError('');
      setIsValidated(true);
      setInvalidEdges([]);
      setMovesList(solution || 'El cubo ya está resuelto.');

      // 📊 TELEMETRÍA: Reportar cálculo exitoso
      registrarEvento('cubo_resuelto_matematicamente', {
        secuencia_generada: solution,
        cantidad_movimientos: solution ? solution.trim().split(' ').length : 0
      });

    } catch (error) {
      console.error(error);
      setError('El cubo no tiene una configuración válida.');
      setIsValidated(false);
      setInvalidEdges([]);
      registrarEvento('error_algoritmo', { detalle: 'Configuración imposible' });
    }
  };

  // ✅ Vuelve la conexión Bluetooth
  // En CubeInput.jsx
const handleConnectBluetooth = async () => {
  // Pasamos una función "callback" que se ejecutará cuando llegue el mensaje
  const exito = await conectarBluetooth((mensaje) => {
    console.log("DEBUG: Mensaje recibido en CubeInput:", mensaje);

    // ¡Aquí sí existe la variable mensaje!
    if (mensaje === "DONE") {
      finalizarResolucion(); // Llama a la función que ya hiciste
    }
  });

  if (exito) {
    setIsBluetoothConnected(true);
    alert("¡Bluetooth Conectado Exitosamente! 🔵");
    registrarEvento('conexion_bluetooth', { estado: 'exitosa' });
  } else {
    alert("No se pudo conectar.");
  }
};

  // ✅ HÍBRIDO: Envía al HC-05 y registra en Ubuntu
  const handleSendToRobot = async () => {
  try {
    // 1. CALCULAMOS LOS MOVIMIENTOS USANDO LA VARIABLE movesList
    // Si movesList existe y es un string, lo dividimos por espacios.
    // .filter(Boolean) elimina espacios vacíos para contar solo los movimientos reales.
    const movimientosCalculados = (movesList && typeof movesList === 'string') 
      ? movesList.trim().split(/\s+/).filter(Boolean).length 
      : 0;

    console.log("DEBUG: Movimientos calculados desde movesList:", movimientosCalculados);

    // 1. Guardamos el momento exacto en milisegundos
    setStartTime(Date.now());

    // 2. REGISTRAMOS EL EVENTO EN TU BASE DE DATOS
    await registrarEvento("movimientos_enviados_al_robot", {
      movimientos: movimientosCalculados,
      tiempo: 0, 
      cara: "Frontal"
    });

    // 3. TU LÓGICA EXISTENTE PARA ENVIAR AL ROBOT
    // ... aquí va el código que activa el Bluetooth o socket ...
    console.log("Enviando secuencia al robot...");

  } catch (error) {
    console.error("Error al procesar el envío:", error);
  }
};

const finalizarResolucion = async () => {
    if (startTime) {
      const endTime = Date.now();
      const tiempoTotalSegundos = (endTime - startTime) / 1000;
      
      console.log("✅ Robot terminó. Tiempo:", tiempoTotalSegundos);

      // Registramos en BD
      await registrarEvento("cubo_resuelto", {
        movimientos: 0, // O puedes calcular cuántos quedaron pendientes
        tiempo: tiempoTotalSegundos,
        cara: "Frontal"
      });
      
      setStartTime(null); // Reseteamos para la próxima vez
    }
  };

  const handleResetCube = () => {
    setCube(initialCube);
    setActiveColor('white');
    setError('');
    setIsValidated(false);
    setMovesList('');
    setInvalidEdges([]);
    registrarEvento('reinicio_tablero', { accion: 'limpieza manual' });
  };

  const Face = ({ faceKey }) => (
    <div className="grid grid-cols-3 gap-1 bg-gray-800 p-1 rounded">
      {cube[faceKey].map((color, index) => {
        const isHighlighted = invalidEdges.some(
          (item) => item.face === faceKey && item.index === index
        );
        return (
          <div
            key={`${faceKey}-${index}`}
            onClick={() => handleSquareClick(faceKey, index)}
            className={`w-10 h-10 border border-gray-600 rounded-sm cursor-pointer transition-transform ${
              index === 4 ? 'cursor-not-allowed opacity-80' : 'hover:scale-105'
            } ${isHighlighted ? 'ring-2 ring-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.75)]' : ''}`}
            style={{ backgroundColor: color ? COLORS[color].hex : '#374151' }}
          >
            {index === 4 && <span className="flex justify-center items-center h-full text-xs text-black/30 font-bold">•</span>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <div className="w-full max-w-4xl flex justify-between px-6 mb-6">
        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Volver al Panel
        </Link>
        <h2 className="text-2xl font-bold">Ingreso Manual de Cubo</h2>
      </div>

      <div className="h-16 mb-4 w-full max-w-xl text-center px-4">
        {error && <div className="px-4 py-2 bg-red-950 border border-red-600 text-red-200 rounded-lg text-sm font-semibold">{error}</div>}
        {isValidated && <div className="px-4 py-2 bg-green-950 border border-green-600 text-green-200 rounded-lg text-sm font-semibold">✓ ¡Paridad Correcta! El cubo es matemáticamente resoluble.</div>}
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="grid grid-cols-4 gap-2 p-4 bg-gray-800/50 rounded-xl shadow-inner">
          <div className="col-start-2"><Face faceKey="U" /></div>
          <div className="col-start-1 col-span-4 grid grid-cols-4 gap-2">
            <Face faceKey="L" /><Face faceKey="F" /><Face faceKey="R" /><Face faceKey="B" />
          </div>
          <div className="col-start-2"><Face faceKey="D" /></div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl flex flex-col gap-4 w-64 border border-gray-700">
          <h3 className="text-xl font-bold mb-2">Paleta</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(COLORS).map(([key, { hex, name }]) => (
              <button
                key={key}
                onClick={() => setActiveColor(key)}
                className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${activeColor === key ? 'border-white scale-105 bg-gray-700' : 'border-transparent hover:bg-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-sm shadow-sm" style={{ backgroundColor: hex }}></div>
                  <span className="text-sm">{name}</span>
                </div>
                <span className="text-xs text-gray-400">{currentCounts[key]}/9</span>
              </button>
            ))}
            <button
              onClick={() => setActiveColor('eraser')}
              className={`flex items-center gap-3 p-2 mt-2 rounded-lg border-2 text-sm transition-all ${activeColor === 'eraser' ? 'border-white scale-105 bg-gray-700' : 'border-transparent hover:bg-gray-700'}`}
            >
              <span>🧹</span> Borrador
            </button>
          </div>

          <hr className="border-gray-700 my-2" />
          <button onClick={handleVerifyStructure} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition-colors text-sm shadow-md">Verificar Paridad</button>
          <button onClick={handleResetCube} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors text-sm shadow-md">Reiniciar Cubo</button>

          {/* ✅ BOTÓN BLUETOOTH */}
          <button
            onClick={handleConnectBluetooth}
            className={`font-bold py-2 rounded-lg transition-all text-sm shadow-md ${
              isBluetoothConnected ? 'bg-blue-800 text-blue-200 cursor-default' : 'bg-blue-500 hover:bg-blue-400 text-white'
            }`}
          >
            {isBluetoothConnected ? '🔵 Bluetooth Listo' : 'Conectar Bluetooth 🔵'}
          </button>

          {/* ✅ BOTÓN DE ENVÍO HÍBRIDO (Robot + BD) */}
          <button
            onClick={handleSendToRobot}
            disabled={!isValidated}
            className={`font-bold py-2 rounded-lg transition-all text-sm shadow-lg ${isValidated ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer opacity-100' : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'}`}
          >
            Enviar al Robot 🤖
          </button>
        </div>
      </div>

      {isValidated && (
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-4 w-full max-w-2xl">
          <h4 className="text-sm font-bold text-blue-400 mb-1">Secuencia de Solución Generada:</h4>
          <p className="font-mono bg-gray-900 p-3 rounded border border-gray-700 text-emerald-400 tracking-wider break-words text-sm">
            {movesList || 'El cubo ya está resuelto.'}
          </p>
        </div>
      )}
    </div>
  );
}