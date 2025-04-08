import {
    getCanchas,
    createCancha,
    getCanchaById,

} from "../models/Cancha.js";

// Obtener todas las canchas
export const obtenerCanchas = async (req, res) => {
    try {
        const canchas = await getCanchas();
        res.status(200).json(canchas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las canchas", error });
    }
};

// Crear una nueva cancha
export const crearCancha = async (req, res) => {
    try {
        const { name, image, pricePerHour } = req.body;
        const id = await createCancha(name, image, pricePerHour);
        res.status(201).json({ id, name, image, pricePerHour });
    } catch (error) {
        res.status(500).json({ message: "Error al crear la cancha", error });
    }
};

// Obtener una cancha por ID
export const obtenerCanchaPorId = async (req, res) => {
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

