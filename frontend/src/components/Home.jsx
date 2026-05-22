import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Forzamos la consulta a la IP de tu servidor Ubuntu
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://157.230.54.54:5000';

export default function Home() {
  const [dbStatus, setDbStatus] = useState('comprobando'); // 'comprobando', 'online', 'offline'

  // Hacemos que le pregunte al servidor real cuando cargue la pantalla
  useEffect(() => {
    const comprobarConexion = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`, {
          signal: AbortSignal.timeout(3000) // Espera máximo 3 segundos
        });
        
        if (response.ok) {
          setDbStatus('online');
        } else {
          setDbStatus('offline');
        }
      } catch (error) {
        setDbStatus('offline');
      }
    };

    comprobarConexion();
  }, []);

  // Lógica para cambiar los colores según la realidad del servidor
  let colorPunto = 'bg-amber-500';
  let textoStatus = 'Comprobando conexión...';

  if (dbStatus === 'online') {
    colorPunto = 'bg-green-500';
    textoStatus = 'Conexión a BD: Establecida';
  } else if (dbStatus === 'offline') {
    colorPunto = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    textoStatus = 'Servidor OFFLINE';
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      
      {/* Encabezado */}
      <header className="mb-12 text-center">
        <h1 className="text-7xl font-bold text-blue-500 mb-2">RubikBot Control Panel</h1>
        <p className="text-xl text-gray-400">Sistema de resolución robótica e historial</p>
      </header>

      {/* 🔴 AHORA ESTE INDICADOR DICE LA VERDAD 🔴 */}
      <div className="mb-8 flex items-center bg-gray-800 px-4 py-2 rounded-full border border-gray-700 transition-colors">
        <div className={`w-3 h-3 rounded-full ${colorPunto} mr-3 ${dbStatus === 'comprobando' ? 'animate-pulse' : ''}`}></div>
        <span className="text-sm font-medium">{textoStatus}</span>
      </div>

      {/* Menú Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        <Link to="/input-cubo" 
              className="flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-500 transition-colors rounded-2xl p-8 shadow-lg group">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎲</span>
          <h2 className="text-2xl font-bold">Ingresar Cubo</h2>
          <p className="text-blue-200 text-center mt-2 text-sm">Configura manualmente los colores de las caras</p>
        </Link>

        <Link to="/historial" 
              className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 rounded-2xl p-8 shadow-lg group">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📋</span>
          <h2 className="text-2xl font-bold">Historial de Movimientos</h2>
          <p className="text-gray-400 text-center mt-2 text-sm">Revisa los tiempos y resoluciones pasadas</p>
        </Link>

        <Link to="/configuracion" 
              className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 rounded-2xl p-8 shadow-lg group">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚙️</span>
          <h2 className="text-2xl font-bold">Configuración</h2>
          <p className="text-gray-400 text-center mt-2 text-sm">Ajustes del robot y motores</p>
        </Link>

        <Link to="/conexiones" 
              className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 rounded-2xl p-8 shadow-lg group">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔌</span>
          <h2 className="text-2xl font-bold">Revisar Conexiones</h2>
          <p className="text-gray-400 text-center mt-2 text-sm">Verificar Arduino y Base de Datos</p>
        </Link>

      </div>
    </div>
  );
}