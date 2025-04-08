import {
    createPago,
    getPagos,
    getPagoById,
} from "../models/Pago.js";

// Crear un nuevo pago
export const crearPago = async (req, res) => {
    try {
        const { userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus } = req.body;
        const id = await createPago(userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus);
        res.status(201).json({ id, userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el pago", error });
    }
};

// Obtener todos los pagos
export const obtenerPagos = async (req, res) => {
    try {
        const pagos = await getPagos();

        // Mapear los pagos para incluir la URL del comprobante de pago
        const pagosConUrl = pagos.map(pago => {
            return {
                ...pago,
                paymentProof: pago.paymentProof 
                    ? `http://localhost:3000/uploads/comprobante/${pago.paymentProof}` 
                    : null // Asignar null si no hay comprobante
            };
        });

        res.status(200).json(pagosConUrl);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los pagos", error });
    }
};

// Obtener un pago por ID
export const obtenerPagoPorId = async (req, res) => {
    try {
        const pago = await getPagoById(req.params.id);
        if (!pago) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }
        res.status(200).json(pago);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el pago", error });
    }
};

