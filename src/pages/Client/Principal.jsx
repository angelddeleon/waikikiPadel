import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import LayoutClient from "../../layout/LayoutClient.jsx";
import CardCancha from "../../components/CardCancha.jsx";
import CardCanchaReservada from "../../components/CardCanchaReservada.jsx";
import { ClipLoader } from "react-spinners";

function Principal() {
    const [canchas, setCanchas] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener canchas y horarios
    useEffect(() => {
        const fetchCanchasYHorarios = async () => {
            try {
                const responseCanchas = await fetch("http://localhost:3000/api/canchas");
                if (!responseCanchas.ok) {
                    throw new Error("Error al obtener las canchas");
                }
                const dataCanchas = await responseCanchas.json();
    
                const canchasConHorarios = await Promise.all(
                    dataCanchas.map(async (cancha) => {
                        const fechaActual = new Date().toISOString().split("T")[0];
                        const responseHorarios = await fetch(
                            `http://localhost:3000/api/horarios/disponibles?cancha_id=${cancha.id}&fecha=${fechaActual}`
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

    // Obtener reservas
    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const id = 0; // Reemplazar con ID de usuario real
                const responseReservas = await fetch(`http://localhost:3000/api/reservas/usuario/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (responseReservas.ok) {
                    const dataReservas = await responseReservas.json();
                    setReservas(dataReservas);
                } else {
                    setReservas([]);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReservas();
    }, []);

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
                    {error}
                </div>
            </LayoutClient>
        );
    }

    const numeroTelefono = "58424-4520697";
    const mensaje = "Hola, me interesa hacer una reserva en su cancha";

    return (
        <LayoutClient>
            <div className="px-4">
                {/* Sección de Mis Reservaciones - Con scroll horizontal funcional */}
                <div className="py-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-950 mb-4">Mis Reservaciones</h1>
                    
                    {reservas.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Link to="/canchasdispo">
                                <button
                                    type="button"
                                    id="CardCrearReservacion"
                                    className="w-full h-full py-6 md:py-8 p-4 md:p-6 border-2 border-blue-950 transform transition-transform duration-300 hover:scale-105 rounded-lg cursor-pointer flex flex-col items-center justify-center"
                                >
                                    <p className="text-3xl text-blue-950">+</p>
                                    <p className="text-lg md:text-xl text-blue-950 font-bold">Reserva tu cancha</p>
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="flex overflow-x-auto gap-12 pb-2">
                                {reservas.map((reserva) => (
                                    <div key={reserva.id} className="inline-flex flex-shrink-0 w-80">
                                        <CardCanchaReservada
                                            name={reserva.cancha_name}
                                            status={reserva.status}
                                            fecha={reserva.date}
                                            start_time={reserva.start_time}
                                            end_time={reserva.end_time}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sección de Canchas Disponibles */}
                <div className="py-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-950 mb-4">Canchas Disponibles</h1>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader color="#1E3A8A" size={50} />
                        </div>
                    ) : error ? (
                        <p className="text-center text-red-500">Error: {error}</p>
                    ) : (
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
                    )}
                </div>

                {/* Botón de WhatsApp */}
                <div className="fixed bottom-5 right-5 z-50">
                    <a
                        href={`https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-4 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            alt="WhatsApp"
                            className="w-12 h-12"
                        />
                    </a>
                </div>
            </div>
        </LayoutClient>
    );
}

export default Principal;