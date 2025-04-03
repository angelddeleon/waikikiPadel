import {
    getHorarios,
    createHorario,
    getHorarioById,
    updateHorarioEstado,
    deleteHorario,
} from "../models/Horario.js";
import pool from "../config/db.js";
import moment from 'moment-timezone';  // Si decides usar moment-timezone


export const obtenerHorariosDisponibles = async (req, res) => {
    const { cancha_id, fecha } = req.query;

    console.log("cancha_id:", cancha_id); // Depuración
    console.log("fecha:", fecha); // Depuración

    try {
        // Obtener los horarios ocupados para la cancha y fecha específicas
        const [horariosOcupados] = await pool.query(
            `SELECT start_time, end_time FROM horarios 
             WHERE cancha_id = ? AND date = ? AND estado = 'ocupado'`,
            [cancha_id, fecha]
        );

        console.log("horariosOcupados:", horariosOcupados); // Depuración

        // Generar horarios disponibles (de 8:00 AM a 10:00 PM, bloques de 1 hora)
        const horariosDisponibles = [];
        const horaInicio = 7; // 8:00 AM
        const horaFin = 22; // 10:00 PM (último bloque: 10:00 PM - 11:00 PM)

        // Obtener la hora actual en la zona horaria de Venezuela
        const horaActual = moment().tz("America/Caracas").format("HH:mm:ss"); // Hora actual en Venezuela

        console.log("horaActual:", horaActual); // Depuración

        for (let hora = horaInicio; hora <= horaFin; hora++) {
            const horaInicioHorario = `${hora.toString().padStart(2, '0')}:00:00`; // Formato HH:MM:SS
            const horaFinHorario = `${(hora + 1).toString().padStart(2, '0')}:00:00`; // Formato HH:MM:SS

            // Verificar si el horario está ocupado
            const estaOcupado = horariosOcupados.some(
                (horarioOcupado) =>
                    horarioOcupado.start_time === horaInicioHorario &&
                    horarioOcupado.end_time === horaFinHorario
            );

            // Verificar si la hora ya pasó (comparamos con la hora actual en Venezuela)
            if (!estaOcupado && horaInicioHorario > horaActual) {
                horariosDisponibles.push({
                    start_time: horaInicioHorario,
                    end_time: horaFinHorario,
                });
            }
        }

        console.log("horariosDisponibles:", horariosDisponibles); // Depuración

        res.json(horariosDisponibles);
    } catch (error) {
        console.error("Error en obtenerHorariosDisponibles:", error); // Depuración
        res.status(500).json({ message: "Error al obtener los horarios", error });
    }
};


// Obtener todos los horarios
export const obtenerHorarios = async (req, res) => {
    try {
        const horarios = await getHorarios();
        res.status(200).json(horarios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los horarios", error });
    }
};

// Crear un nuevo horario
export const crearHorario = async (req, res) => {
    try {
        const { cancha_id, date, start_time, end_time, estado = "disponible" } = req.body;

        const id = await createHorario(cancha_id, date, start_time, end_time, estado);
        res.status(201).json({ id, cancha_id, date, start_time, end_time, estado });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el horario", error });
    }
};

// Obtener un horario por ID
export const obtenerHorarioPorId = async (req, res) => {
    try {
        const horario = await getHorarioById(req.params.id);
        if (!horario) {
            return res.status(404).json({ message: "Horario no encontrado" });
        }
        res.status(200).json(horario);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el horario", error });
    }
};

// Actualizar el estado de un horario
export const actualizarEstadoHorario = async (req, res) => {
    try {
        const { estado } = req.body;
        await updateHorarioEstado(req.params.id, estado);
        res.status(200).json({ message: "Estado del horario actualizado" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el estado del horario", error });
    }
};

// Eliminar un horario
export const eliminarHorario = async (req, res) => {
    try {
        await deleteHorario(req.params.id);
        res.status(200).json({ message: "Horario eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el horario", error });
    }
};