import React from "react";
import { Link } from "react-router";
import Horario from "./Horario.jsx";

function CardCancha({ id, name, image, price_per_hour, horarios }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
            <Link to={`/reservar?cancha=${id}`}>
                <img 
                    src={image} 
                    alt={name} 
                    className="w-full h-48 object-cover"
                />
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">1 h desde</p>
                            <p className="text-lg font-bold text-blue-900">US ${price_per_hour}</p>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Horarios disponibles */}
            <div className="px-4 pb-4">
                {horarios.length > 0 ? (
                    <div className="flex overflow-x-auto gap-2 pb-2">
                        {horarios.map((horario, index) => (
                            <Horario
                                key={index}
                                canchaId={id}
                                horario={horario.start_time}
                                fecha={new Date().toISOString().split("T")[0]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-2">No hay horarios para hoy</p>
                        <Link 
                            to={`/reservar?cancha=${id}`}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Buscar horarios para mañana
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CardCancha;