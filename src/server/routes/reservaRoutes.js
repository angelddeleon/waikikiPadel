import express from "express";
import {
    crearReserva, // Nueva función
    obtenerReservas,
    obtenerReservaPorId,
    actualizarEstadoReserva,
    obtenerReservasUsuario,
    eliminarReserva,
    uploadImage
} from "../controllers/reservaController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyTokenReserva from "../middleware/verifyTokenReserva.js";


const router = express.Router();

// Rutas para las reservas
router.post("/", verifyToken, crearReserva); 
router.post("/ImageCom", uploadImage); 
router.get("/", obtenerReservas);
router.get("/:id", obtenerReservaPorId);
router.put("/:id", actualizarEstadoReserva);
router.delete("/:id", eliminarReserva);
// En reservaRoutes.js
router.get("/usuario/:id", verifyTokenReserva, obtenerReservasUsuario);



export default router;