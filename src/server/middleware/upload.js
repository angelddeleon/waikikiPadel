const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadComprobante = multer.diskStorage({
    destination: (req, file, cb) => {
        const comprobantePath = './uploads/comprobantes/';
        if (!fs.existsSync(comprobantePath)) {
            fs.mkdirSync(comprobantePath, { recursive: true });
        }
        cb(null, comprobantePath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: uploadComprobante,
    limits: { fileSize: 10 * 1024 * 1024 },
}).single("comprobante");

module.exports = upload;