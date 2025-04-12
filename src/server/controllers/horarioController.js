const {
    getHorarios,
    createHorario,
    getHorarioById,
    updateHorarioEstado,
} = require("../models/Horario");
const pool = require("../config/db");
const moment = require('moment-timezone');

exports.obtenerHorariosDisponibles = async (req, res) => {
    const { cancha_id, fecha } = req.query;

    console.log("cancha_id:", cancha_id);
    console.log("fecha:", fecha);

    try {
        const [horariosOcupados] = await pool.query(
            `SELECT start_time, end_time FROM horarios 
             WHERE cancha_id = ? AND date = ? AND estado = 'ocupado'`,
            [cancha_id, fecha]
        );

        console.log("horariosOcupados:", horariosOcupados);

        const horariosDisponibles = [];
        const horaInicio = 8;
        const horaFin = 22;

        const ahoraVenezuela = moment().tz("America/Caracas");
        const fechaActual = ahoraVenezuela.format("YYYY-MM-DD");
        const horaActual = ahoraVenezuela.format("HH:mm:ss");

        console.log("fechaActual:", fechaActual);
        console.log("horaActual:", horaActual);

        for (let hora = horaInicio; hora <= horaFin; hora++) {
            const horaInicioHorario = `${hora.toString().padStart(2, '0')}:00:00`;
            const horaFinHorario = hora === 22 
                ? "23:00:00"
                : `${(hora + 1).toString().padStart(2, '0')}:00:00`;

            const estaOcupado = horariosOcupados.some(
                (horarioOcupado) =>
                    horarioOcupado.start_time === horaInicioHorario &&
                    horarioOcupado.end_time === horaFinHorario
            );

            if (fecha === fechaActual) {
                if (!estaOcupado && horaInicioHorario > horaActual) {
                    horariosDisponibles.push({
                        start_time: horaInicioHorario,
                        end_time: horaFinHorario,
                    });
                }
            } else {
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

exports.obtenerHorarios = async (req, res) => {
    try {
        const horarios = await getHorarios();
        res.status(200).json(horarios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los horarios", error });
    }
};

exports.crearHorario = async (req, res) => {
    try {
        const { cancha_id, date, start_time, end_time, estado = "disponible" } = req.body;

        const id = await createHorario(cancha_id, date, start_time, end_time, estado);
        res.status(201).json({ id, cancha_id, date, start_time, end_time, estado });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el horario", error });
    }
};

exports.obtenerHorarioPorId = async (req, res) => {
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

exports.actualizarEstadoHorario = async (req, res) => {
    try {
        const { estado } = req.body;
        await updateHorarioEstado(req.params.id, estado);
        res.status(200).json({ message: "Estado del horario actualizado" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el estado del horario", error });
    }
};