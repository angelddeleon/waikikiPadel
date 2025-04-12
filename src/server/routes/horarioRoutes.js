const express = require("express");
const {
    obtenerHorariosDisponibles,
    crearHorario,
    obtenerHorarioPorId,
    actualizarEstadoHorario
} = require("../controllers/horarioController");

const router = express.Router();

// Rutas para los horarios
router.get("/disponibles", obtenerHorariosDisponibles);
router.post("/", crearHorario);
router.get("/:id", obtenerHorarioPorId);
router.put("/:id/estado", actualizarEstadoHorario);

module.exports = router;