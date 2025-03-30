import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

// Importación de rutas
import usuarioRoutes from "./routes/usuarioRoutes.js";
import canchaRoutes from "./routes/canchaRoutes.js";
import horarioRoutes from "./routes/horarioRoutes.js";
import reservaRoutes from "./routes/reservaRoutes.js";
import pagoRoutes from "./routes/pagoRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;



const __dirname = path.dirname(new URL(import.meta.url).pathname);  // Esto es necesario porque usas ES modules


// Verificar existencia de la carpeta "uploads"
const uploadPath = '../uploads/usuarios/';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath); // Crear la carpeta si no existe
}

// Verificar existencia de la carpeta "uploads"
const uploadPath2 = '../uploads/comprobante/';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath); // Crear la carpeta si no existe
}

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Asignar un nombre único
    },
});

const upload = multer({ storage });

// Middleware para subir imágenes (ruta simple)
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
    }
    res.status(200).json({ message: "Imagen subida correctamente", path: req.file.path });
});

// Configuración de Middlewares
app.use(express.json()); // Analiza solicitudes JSON
app.use(cookieParser()); // Manejo de cookies



// Configuración de CORS
app.use(cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5000"], // Cambiar según tu frontend
    credentials: true, // Permitir cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

app.use('/uploads/usuarios', express.static(uploadPath));
app.use('/uploads/comprobante', express.static(path.join(uploadPath2)));

console.log(path.join(__dirname, 'uploads/comprobante'));


// Rutas de la API
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/canchas", canchaRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/pagos", pagoRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
