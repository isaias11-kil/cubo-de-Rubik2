import { Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import CubeInput from './components/CubeInput';
import Historial from './components/Historial';

import RevisarConexiones from './RevisarConexiones'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/input-cubo" element={<CubeInput />} />
      <Route path="/historial" element={<Historial />} />
      {/* ✅ 2. Agregamos la ruta para acceder al diagnóstico */}
      <Route path="/conexiones" element={<RevisarConexiones />} />
    </Routes>
  );
}

export default App;