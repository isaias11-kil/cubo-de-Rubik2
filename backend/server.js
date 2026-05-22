const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Cube = require('cubejs'); // Asegúrate de tener instalado: npm install cubejs

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// INICIALIZACIÓN DE MOTORES
// ==========================================
Cube.initSolver(); // El motor matemático se enciende una vez

// ==========================================
// RUTAS DE DIAGNÓSTICO Y RESOLUCIÓN
// ==========================================

// Diagnóstico de Salud
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'online' : 'offline';
  res.status(200).json({
    servidor: 'online',
    base_de_datos: dbStatus,
    tiempo_respuesta: new Date().toISOString()
  });
});

// Resolución Matemática (Ahora el servidor hace el cálculo)
app.post('/api/resolver', (req, res) => {
  try {
    const { cubeString } = req.body;
    const cube = Cube.fromString(cubeString);
    
    if (cube.isSolved()) {
      return res.status(200).json({ solucion: '' });
    }

    const solucion = cube.solve();
    res.status(200).json({ solucion });
  } catch (error) {
    console.error("Error resolviendo el cubo:", error);
    res.status(400).json({ error: 'Configuración inválida' });
  }
});

// ==========================================
// BASE DE DATOS Y EVENTOS
// ==========================================

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/rubikbot_logs';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado a MongoDB exitosamente'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

const eventoSchema = new mongoose.Schema({
  tipo_accion: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  tiempo_segundos: { type: Number, default: 0 },
  movimientos: { type: String, default: 'N/A' },
  detalles: { type: String, default: '' }
});

const Evento = mongoose.model('Evento', eventoSchema);

// Endpoint: Registrar Evento
app.post('/api/eventos', async (req, res) => {
  try {
    const { tipo_accion, tiempo_segundos, movimientos, detalles } = req.body;
    const nuevoEvento = new Evento({ tipo_accion, tiempo_segundos, movimientos, detalles });
    await nuevoEvento.save();
    res.status(201).json({ mensaje: 'Evento registrado con éxito', evento: nuevoEvento });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar evento', detalles: error.message });
  }
});

// Endpoint: Obtener Historial
app.get('/api/eventos', async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ timestamp: -1 });
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial', detalles: error.message });
  }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend corriendo en el puerto ${PORT}`);
});