import React from "react";
import { Link } from "react-router"; // Cambié a 'react-router-dom'
import Horario from "./Horario.jsx";

function CardCancha({ id, name, image, price_per_hour, horarios }) {
    return (
        <div
            id="cardCancha"
            className="my-4 shadow-xl w-full rounded-md cursor-pointer"
        >
            {/* Corregí el Link para usar interpolación de cadenas correctamente */}
            <Link to={`/reservar?cancha=${id}`}>
                <img src={image} alt={name} className="w-full h-50 object-cover rounded-t-md" />
                <div className="p-4">
                    <div className="flex align-items-center text-center justify-between">
                        <h3 className="text-2xl font-bold">{name}</h3>
                        <div>
                            <p className="text-sm">1 h desde</p>
                            <p className="text-lg font-bold">US ${price_per_hour}</p>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Mostrar los horarios disponibles */}
            <div className="py-4 px-2">
                <div className="flex overflow-x-auto whitespace-nowrap horarios-container pb-1 max-w-full">
                    {horarios.map((horario, index) => (
                        <Horario
                            key={index} // Usar el índice como clave temporal
                            canchaId={id}
                            horario={horario.start_time} // Usar start_time en lugar de hora_inicio
                            fecha={new Date().toISOString().split("T")[0]}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CardCancha;
