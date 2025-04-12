const {
    createPago,
    getPagos,
    getPagoById,
} = require("../models/Pago");

exports.crearPago = async (req, res) => {
    try {
        const { userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus } = req.body;
        const id = await createPago(userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus);
        res.status(201).json({ id, userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el pago", error });
    }
};

exports.obtenerPagos = async (req, res) => {
    try {
        const pagos = await getPagos();

        const pagosConUrl = pagos.map(pago => {
            return {
                ...pago,
                paymentProof: pago.paymentProof 
                    ? `http://localhost:3000/uploads/comprobante/${pago.paymentProof}` 
                    : null
            };
        });

        res.status(200).json(pagosConUrl);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los pagos", error });
    }
};

exports.obtenerPagoPorId = async (req, res) => {
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
