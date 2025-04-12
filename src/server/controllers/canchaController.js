const {
    getCanchas,
    createCancha,
    getCanchaById,
} = require("../models/Cancha");

exports.obtenerCanchas = async (req, res) => {
    try {
        const canchas = await getCanchas();
        res.status(200).json(canchas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las canchas", error });
    }
};

exports.crearCancha = async (req, res) => {
    try {
        const { name, image, pricePerHour } = req.body;
        const id = await createCancha(name, image, pricePerHour);
        res.status(201).json({ id, name, image, pricePerHour });
    } catch (error) {
        res.status(500).json({ message: "Error al crear la cancha", error });
    }
};

exports.obtenerCanchaPorId = async (req, res) => {
    try {
        const cancha = await getCanchaById(req.params.id);
        if (!cancha) {
            return res.status(404).json({ message: "Cancha no encontrada" });
        }
        res.status(200).json(cancha);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la cancha", error });
    }
};
