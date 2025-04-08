import React from "react";
import { formatTime } from "../utils/formatTime";

function CardCanchaReservada({ name, status, start_time, end_time, fecha }) {
    const horaInicio = formatTime(start_time);
    const horaFin = formatTime(end_time);

        // Formatear fecha directamente desde el string YYYY-MM-DD
        const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) : '';

    return (
        <div id="cardCancha" className="p-4 w-[400px] border border-gray-500 shadow rounded-md cursor-pointer">
            
            {/* Nombre y estado - Estilo original */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{name}</h3>
                <p className={`text-sm ${
                    status === 'pendiente' ? 'bg-yellow-500' : 
                    status === 'confirmada' ? 'bg-green-800' : 
                    'bg-red-800'
                } text-white rounded p-2`}>
                    {status === 'pendiente' ? 'Pendiente' : 
                     status === 'confirmada' ? 'Confirmada' : 
                     'Cancelada'}
                </p>
            </div>

            {/* Fecha - Manteniendo el estilo original */}
            {fecha && (
            <div className="text-center m-2">
                <p className="text-sm font-medium text-gray-700">
                    {fechaFormateada}
                </p>
            </div>
            )}
            
            {/* Horarios - Estilo original */}
            <div className="flex justify-center items-center my-4 font-bold">
                <p className="mr-1">Desde:</p>
                <p className="mr-1 font-semibold text-white p-1 rounded-xl text-center w-25 bg-blue-950">{horaInicio}</p>
                <p className="mr-1">Hasta:</p>
                <p className="m-1 font-semibold text-white p-1 rounded-xl text-center w-25 bg-blue-950">{horaFin}</p>
            </div>
        </div>
    );
}

export default CardCanchaReservada;