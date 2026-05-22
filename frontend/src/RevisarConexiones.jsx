import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { conectarBluetooth } from './utils/bluetooth';

// ✅ SOLUCIÓN: Si el .env falla, usa automáticamente el servidor de DigitalOcean
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://157.230.54.54:5000';

export default function RevisarConexiones() {
  const [statusServidor, setStatusServidor] = useState('comprobando'); // comprobando, online, offline
  const [statusBD, setStatusBD] = useState('comprobando');
  const [statusBluetooth, setStatusBluetooth] = useState('desconectado'); // desconectado, conectado

  // Función para hacer "ping" al servidor y a la base de datos
  const comprobarServidor = async () => {
    setStatusServidor('comprobando');
    setStatusBD('comprobando');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        // Un timeout corto para que no se quede pensando eternamente si está apagado
        signal: AbortSignal.timeout(5000) 
      });

      if (response.ok) {
        const data = await response.json();
        setStatusServidor('online');
        setStatusBD(data.base_de_datos);
      } else {
        throw new Error('Servidor respondió con error');
      }
    } catch (error) {
      console.warn("El servidor está apagado o inalcanzable:", error);
      setStatusServidor('offline');
      setStatusBD('offline');
    }
  };

  // Función para probar el Bluetooth físico
  const probarBluetooth = async () => {
    const exito = await conectarBluetooth();
    if (exito) {
      setStatusBluetooth('conectado');
    } else {
      setStatusBluetooth('desconectado');
    }
  };

  // Ejecutar la comprobación del servidor automáticamente al entrar a la pantalla
  useEffect(() => {
    comprobarServidor();
  }, []);

  // Componente visual para las "luces" indicadoras de estado
  const Indicador = ({ estado, texto }) => {
    let colorClass = 'bg-gray-500'; // Default / comprobando
    let textColor = 'text-gray-400';

    if (estado === 'online' || estado === 'conectado') {
      colorClass = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]';
      textColor = 'text-emerald-400';
    } else if (estado === 'offline' || estado === 'desconectado') {
      colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]';
      textColor = 'text-red-400';
    } else if (estado === 'comprobando') {
      colorClass = 'bg-amber-500 animate-pulse';
      textColor = 'text-amber-400';
    }

    return (
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <span className="font-semibold text-lg">{texto}</span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold uppercase tracking-wider ${textColor}`}>
            {estado}
          </span>
          <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <div className="w-full max-w-2xl flex justify-between px-6 mb-10">
        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 font-semibold">
          <span>←</span> Volver al Panel
        </Link>
        <h2 className="text-3xl font-bold">Diagnóstico del Sistema</h2>
      </div>

      <div className="w-full max-w-2xl bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-gray-700/50 flex flex-col gap-6">
        
        <p className="text-gray-400 text-sm mb-2">
          Verifica el estado de los componentes de la arquitectura distribuida.
        </p>

        {/* Tarjetas de estado */}
        <Indicador estado={statusServidor} texto="Servidor Backend (Node.js)" />
        <Indicador estado={statusBD} texto="Base de Datos (MongoDB)" />
        <Indicador estado={statusBluetooth} texto="Módulo Robótico (Bluetooth HC-05)" />

        <hr className="border-gray-700 my-4" />

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={comprobarServidor}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors shadow-md flex-1 sm:flex-none"
          >
            🔄 Refrescar Servidor
          </button>
          
          <button
            onClick={probarBluetooth}
            className={`px-6 py-3 font-bold rounded-lg transition-all shadow-md flex-1 sm:flex-none ${
              statusBluetooth === 'conectado' 
                ? 'bg-blue-800 text-blue-200 cursor-default' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {statusBluetooth === 'conectado' ? '🔵 Bluetooth Listo' : 'Enlazar Bluetooth 🔵'}
          </button>
        </div>

      </div>
    </div>
  );
}