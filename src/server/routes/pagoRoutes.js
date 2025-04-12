const express = require("express");
const {
    crearPago,
    obtenerPagos,
    obtenerPagoPorId
} = require("../controllers/pagoController");

const router = express.Router();

// Rutas para los pagos
router.post("/", crearPago);
router.get("/", obtenerPagos);
router.get("/:id", obtenerPagoPorId);

module.exports = router;