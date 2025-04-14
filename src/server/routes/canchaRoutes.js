const express = require("express");
const {
    obtenerCanchas,
    crearCancha,
    obtenerCanchaPorId,
} = require("../controllers/canchaController");

const router = express.Router();

// Rutas para las canchas
router.get("/", obtenerCanchas);
router.post("/", crearCancha);
router.get("/:id", obtenerCanchaPorId);

module.exports = router;