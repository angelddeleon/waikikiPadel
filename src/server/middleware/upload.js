import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configuración de Multer para subir los comprobantes de pago
const uploadComprobante = multer.diskStorage({
    destination: (req, file, cb) => {
        const comprobantePath = './uploads/comprobantes/';  // Carpeta donde se guardarán los comprobantes
        if (!fs.existsSync(comprobantePath)) {
            fs.mkdirSync(comprobantePath, { recursive: true }); // Crear la carpeta si no existe
        }
        cb(null, comprobantePath); // Especificamos la carpeta de destino
    },
    filename: (req, file, cb) => {
        // Asignar un nombre único al archivo usando la fecha actual
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Configuramos el tamaño máximo de los archivos
const upload = multer({
    storage: uploadComprobante,
    limits: { fileSize: 10 * 1024 * 1024 },  // Establece el límite de tamaño de archivo a 10MB
}).single("comprobante");

export default upload;
