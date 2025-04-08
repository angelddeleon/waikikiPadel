import express from "express";
import {
    obtenerHorariosDisponibles,
    crearHorario,
    obtenerHorarioPorId,
    actualizarEstadoHorario
} from "../controllers/horarioController.js";

const router = express.Router();

// Rutas para los horarios
router.get("/disponibles", obtenerHorariosDisponibles);
router.post("/", crearHorario);
router.get("/:id", obtenerHorarioPorId);
router.put("/:id/estado", actualizarEstadoHorario);

export default router;