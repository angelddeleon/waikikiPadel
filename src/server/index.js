import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuración de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de directorios de uploads
const uploadsDir = path.join(__dirname, 'uploads');
const comprobanteDir = path.join(uploadsDir, 'comprobante');

// Crear directorios si no existen
[uploadsDir, comprobanteDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio creado: ${dir}`);
  }
});

// Configuración de Multer para comprobantes
const comprobanteStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, comprobanteDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `comprobante-${uniqueSuffix}${ext}`);
  }
});

const uploadComprobante = multer({ 
  storage: comprobanteStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, JPG) o PDF'));
  }
});

// Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de CORS mejorada
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    // Agrega aquí el dominio de tu aplicación Flask
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization', 'Set-Cookie']
};

app.use(cors(corsOptions));

// Middleware para servir archivos estáticos
app.use('/uploads/comprobante', express.static(comprobanteDir, {
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// Importación de rutas
import usuarioRoutes from "./routes/usuarioRoutes.js";
import canchaRoutes from "./routes/canchaRoutes.js";
import horarioRoutes from "./routes/horarioRoutes.js";
import reservaRoutes from "./routes/reservaRoutes.js";
import pagoRoutes from "./routes/pagoRoutes.js";

// Rutas de la API
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/canchas", canchaRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/pagos", pagoRoutes);

// Ruta para subir comprobantes
app.post('/api/upload-comprobante', uploadComprobante.single('comprobante'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: "No se proporcionó ningún archivo" 
    });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/comprobante/${req.file.filename}`;
  
  res.status(200).json({ 
    success: true,
    message: "Comprobante subido correctamente",
    filename: req.file.filename,
    url: fileUrl
  });
});

// Ruta para ver imágenes (accesible desde Flask)
app.get('/api/images/comprobante/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(comprobanteDir, filename);
  
  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        success: false,
        error: "Imagen no encontrada"
      });
    }
    
    // Servir el archivo estático
    res.sendFile(filePath);
  });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada"
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err instanceof multer.MulterError) {
    return res.status(413).json({
      success: false,
      error: err.code === 'LIMIT_FILE_SIZE' 
        ? "El archivo es demasiado grande (máximo 5MB)" 
        : "Error al procesar el archivo"
    });
  }

  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Ruta de comprobantes: ${comprobanteDir}`);
  console.log(`🔗 Ejemplo de acceso: http://localhost:${PORT}/uploads/comprobante/nombre-del-archivo.jpg`);
});

// Manejo de cierre elegante
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());

export default app;