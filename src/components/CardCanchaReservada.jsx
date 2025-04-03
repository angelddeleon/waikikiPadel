import React from "react";
import { formatTime } from "../utils/formatTime";

function CardCanchaReservada({ name, status, start_time, end_time, fecha }) {
    const horaInicio = formatTime(start_time);
    const horaFin = formatTime(end_time);

    // Formatear fecha
    const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    }) : '';

    return (
        <div id="cardCancha" className="p-4 w-[400px] border border-gray-500 shadow rounded-md cursor-pointer">
            {/* Fecha */}
            {fecha && (
                <div className="text-center mb-2">
                    <p className="text-sm font-medium text-gray-700">
                        {fechaFormateada}
                    </p>
                </div>
            )}
            
            {/* Nombre y estado */}
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
            
            {/* Horarios */}
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