import express from "express";
import {
    obtenerCanchas,
    crearCancha,
    obtenerCanchaPorId,
} from "../controllers/canchaController.js";

const router = express.Router();

// Rutas para las canchas
router.get("/", obtenerCanchas);
router.post("/", crearCancha);
router.get("/:id", obtenerCanchaPorId);


export default router;