import {
    getHorarios,
    createHorario,
    getHorarioById,
    updateHorarioEstado,
} from "../models/Horario.js";
import pool from "../config/db.js";
import moment from 'moment-timezone';  // Si decides usar moment-timezone


export const obtenerHorariosDisponibles = async (req, res) => {
    const { cancha_id, fecha } = req.query;

    console.log("cancha_id:", cancha_id);
    console.log("fecha:", fecha);

    try {
        // Obtener los horarios ocupados para la cancha y fecha específicas
        const [horariosOcupados] = await pool.query(
            `SELECT start_time, end_time FROM horarios 
             WHERE cancha_id = ? AND date = ? AND estado = 'ocupado'`,
            [cancha_id, fecha]
        );

        console.log("horariosOcupados:", horariosOcupados);

        // Generar horarios disponibles (de 8:00 AM a 10:00 PM, bloques de 1 hora)
        const horariosDisponibles = [];
        const horaInicio = 8;  // 8:00 AM
        const horaFin = 22;    // 10:00 PM (último bloque: 10:00 PM - 11:00 PM)

        // Obtener la fecha y hora actual en la zona horaria de Venezuela
        const ahoraVenezuela = moment().tz("America/Caracas");
        const fechaActual = ahoraVenezuela.format("YYYY-MM-DD");
        const horaActual = ahoraVenezuela.format("HH:mm:ss");

        console.log("fechaActual:", fechaActual);
        console.log("horaActual:", horaActual);

        for (let hora = horaInicio; hora <= horaFin; hora++) {
            const horaInicioHorario = `${hora.toString().padStart(2, '0')}:00:00`;
            // Para el último horario (22:00:00), el end_time será 23:00:00
            const horaFinHorario = hora === 22 
                ? "23:00:00"
                : `${(hora + 1).toString().padStart(2, '0')}:00:00`;

            // Verificar si el horario está ocupado
            const estaOcupado = horariosOcupados.some(
                (horarioOcupado) =>
                    horarioOcupado.start_time === horaInicioHorario &&
                    horarioOcupado.end_time === horaFinHorario
            );

            // Si es la fecha actual, verificar si la hora ya pasó
            if (fecha === fechaActual) {
                if (!estaOcupado && horaInicioHorario > horaActual) {
                    horariosDisponibles.push({
                        start_time: horaInicioHorario,
                        end_time: horaFinHorario,
                    });
                }
            } else {
                // Para cualquier otra fecha, mostrar todos los horarios no ocupados
                if (!estaOcupado) {
                    horariosDisponibles.push({
                        start_time: horaInicioHorario,
                        end_time: horaFinHorario,
                    });
                }
            }
        }

        console.log("horariosDisponibles:", horariosDisponibles);

        res.json(horariosDisponibles);
    } catch (error) {
        console.error("Error en obtenerHorariosDisponibles:", error);
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

