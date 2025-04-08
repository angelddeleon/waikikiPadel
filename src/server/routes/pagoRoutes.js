import express from "express";
import {
    crearPago,
    obtenerPagos,
    obtenerPagoPorId
} from "../controllers/pagoController.js";

const router = express.Router();

// Rutas para los pagos
router.post("/", crearPago);
router.get("/", obtenerPagos);
router.get("/:id", obtenerPagoPorId);

export default router;