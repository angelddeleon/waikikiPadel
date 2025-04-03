import React from "react";
import { Link } from "react-router"; // Cambia a 'react-router-dom'
import { formatTime } from "../utils/formatTime"; // Importar la función utilitaria

function Horario({ canchaId, horario, fecha }) {
    const formattedTime = formatTime(horario); // Formatear la hora
    return (
        <Link to={`/reservar?cancha=${canchaId}&hora=${horario}&fecha=${fecha}`}>
            <div
                id="horario"
                className="flex justify-center items-center border w-30 mr-2 p-2 shadow rounded hover:bg-[#113872] hover:text-white duration-300 ease-in"
            >
                <p>{formattedTime}</p> {/* Mostrar la hora formateada */}
            </div>
        </Link>
    );
}

export default Horario;