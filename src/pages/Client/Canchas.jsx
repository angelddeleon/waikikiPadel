import React, { useState, useEffect } from "react";
import LayoutClient from "../../layout/LayoutClient.jsx";
import CardCancha from "../../components/CardCancha.jsx";
import { ClipLoader } from "react-spinners";

function Canchas() {
    const [canchas, setCanchas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener canchas y horarios
    useEffect(() => {
        const fetchCanchasYHorarios = async () => {
            try {
                // Obtener las canchas
                const responseCanchas = await fetch("https://backend2node.waikikipadel.com/api/canchas");
                if (!responseCanchas.ok) {
                    throw new Error("Error al obtener las canchas");
                }
                const dataCanchas = await responseCanchas.json();
    
                // Obtener los horarios disponibles para cada cancha
                const canchasConHorarios = await Promise.all(
                    dataCanchas.map(async (cancha) => {
                        const fechaActual = new Date().toISOString().split("T")[0];
                        const responseHorarios = await fetch(
                            `https://backend2node.waikikipadel.com/api/horarios/disponibles?cancha_id=${cancha.id}&fecha=${fechaActual}`
                        );
                        if (!responseHorarios.ok) {
                            throw new Error("Error al obtener los horarios");
                        }
                        const dataHorarios = await responseHorarios.json();
                        return { ...cancha, horarios: dataHorarios };
                    })
                );
    
                setCanchas(canchasConHorarios);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchCanchasYHorarios();
    }, []);

    // Estados de carga y error
    if (loading) {
        return (
            <LayoutClient>
                <div className="flex h-screen items-center justify-center">
                    <ClipLoader color="#1E3A8A" size={50} />
                </div>
            </LayoutClient>
        );
    }

    if (error) {
        return (
            <LayoutClient>
                <div className="flex h-screen items-center justify-center">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            </LayoutClient>
        );
    }

    return (
        <LayoutClient>
            <div className="px-4 py-8">
                {/* Título */}
                <h1 className="text-2xl md:text-3xl font-bold text-blue-950 mb-6">Canchas Disponibles</h1>

                {/* Contenedor de canchas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {canchas.map((cancha) => (
                        <CardCancha
                            key={cancha.id}
                            id={cancha.id}
                            name={cancha.name}
                            image={cancha.image}
                            price_per_hour={cancha.price_per_hour}
                            horarios={cancha.horarios}
                        />
                    ))}
                </div>

                {/* Mensaje cuando no hay canchas */}
                {!loading && canchas.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-600">No hay canchas disponibles en este momento.</p>
                    </div>
                )}
            </div>
        </LayoutClient>
    );
}

export default Canchas;