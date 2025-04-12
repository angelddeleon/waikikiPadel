const express = require("express");
const {
    crearReserva,
    obtenerReservas,
    obtenerReservaPorId,
    obtenerReservasUsuario,
    uploadImage
} = require("../controllers/reservaController");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenReserva = require("../middleware/verifyTokenReserva");

const router = express.Router();

// Rutas para las reservas
router.post("/", verifyToken, crearReserva); 
router.post("/ImageCom", uploadImage); 
router.get("/", obtenerReservas);
router.get("/:id", obtenerReservaPorId);
router.get("/usuario/:id", verifyTokenReserva, obtenerReservasUsuario);

module.exports = router;