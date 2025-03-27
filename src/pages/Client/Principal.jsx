import React, { useState, useEffect } from "react";
import { Link } from "react-router"; // Cambiar a 'react-router-dom'
import LayoutClient from "../../layout/LayoutClient.jsx";
import CardCancha from "../../components/CardCancha.jsx";
import CardCanchaReservada from "../../components/CardCanchaReservada.jsx";
import { ClipLoader } from "react-spinners"; // Importar el spinner

function Principal() {
    const [canchas, setCanchas] = useState([]); // Estado para las canchas
    const [reservas, setReservas] = useState([]); // Estado para las reservas
    const [loading, setLoading] = useState(true); // Estado para manejar la carga
    const [error, setError] = useState(null); // Estado para manejar errores

    // Obtener canchas y horarios
    useEffect(() => {
        const fetchCanchasYHorarios = async () => {
            try {
                // Obtener las canchas
                const responseCanchas = await fetch("http://localhost:3000/api/canchas");
                if (!responseCanchas.ok) {
                    throw new Error("Error al obtener las canchas");
                }
                const dataCanchas = await responseCanchas.json();
    
                // Obtener los horarios disponibles para cada cancha
                const canchasConHorarios = await Promise.all(
                    dataCanchas.map(async (cancha) => {
                        const fechaActual = new Date().toISOString().split("T")[0]; // Fecha actual
                        const responseHorarios = await fetch(
                            `http://localhost:3000/api/horarios/disponibles?cancha_id=${cancha.id}&fecha=${fechaActual}`
                        );
                        if (!responseHorarios.ok) {
                            throw new Error("Error al obtener los horarios");
                        }
                        const dataHorarios = await responseHorarios.json();
                        return { ...cancha, horarios: dataHorarios }; // Agregar horarios a la cancha
                    })
                );
    
                setCanchas(canchasConHorarios); // Actualiza el estado con las canchas y sus horarios
            } catch (error) {
                setError(error.message); // Maneja el error
            } finally {
                setLoading(false); // Finaliza la carga
            }
        };
    
        fetchCanchasYHorarios(); // Llama a la función para obtener los datos
    }, []);

    // Obtener reservas
    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const id = 0; // ID como ejemplo
                const responseReservas = await fetch(`http://localhost:3000/api/reservas/usuario/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (responseReservas.ok) {
                    const dataReservas = await responseReservas.json();
                    setReservas(dataReservas); // Actualiza el estado con las reservas
                } else {
                    setReservas([]); // Si no hay reservas, reseteamos el estado
                }
            } catch (error) {
                setError(error.message); // Maneja el error
            } finally {
                setLoading(false); // Finaliza la carga
            }
        };

        fetchReservas(); // Llama a la función para obtener las reservas
    }, []);

    // Si está cargando o hay un error, muestra el Spinner o el error
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
    const mensaje = "Hola, 1. Me interesa hacer una reserva en su cancha personalmente. 2.He tenido un error al reservar la cancha ";

    return (
        <LayoutClient>
            <div className="overflow-x-hidden">
                <div className="mx-4 my-2 flex justify-between items-center py-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-950">Mis Reservaciones</h1>
                </div>

                <div className="flex">
                    {reservas.length === 0 ? (
                        // Si no hay reservas, muestra el botón de crear una reserva
                        <Link to="/canchasdispo">
                            <button
                                type="button"
                                id="CardCrearReservacion"
                                className="mx-4 py-6 md:py-8 p-4 md:p-6 border-2 border-blue-950 transform transition-transform duration-300 md:hover:scale-105 rounded-lg cursor-pointer"
                            >
                                <p className="text-3xl text-blue-950">+</p>
                                <p className="text-lg md:text-xl text-blue-950 font-bold">Reserva tu cancha</p>
                            </button>
                        </Link>
                    ) : (
                        // Si hay reservas, muestra las tarjetas con scroll horizontal
                        <div className="flex overflow-x-auto horarios-container mx-4 max-w-full">
                            {reservas.map((reserva) => (
                                <CardCanchaReservada
                                    key={reserva.id}
                                    name={reserva.cancha_name}
                                    status={reserva.status}
                                    start_time={reserva.start_time}
                                    end_time={reserva.end_time}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Canchas disponibles */}
                <div className="flex flex-col w-full ">
                    <h1 className="text-3xl font-bold text-blue-950 px-2 my-4">Canchas Disponibles</h1>


                    {/* Mostrar spinner o error */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader color="#1E3A8A" size={50} />
                        </div>
                    ) : error ? (
                        <p className="text-center text-red-500">Error: {error}</p>
                    ) : (
                        <div id="canchasCont" className="flex flex-wrap justify-between w-full">
                            {canchas.map((cancha) => (
                                <CardCancha
                                    key={cancha.id}
                                    id={cancha.id}
                                    name={cancha.name}
                                    image={cancha.image}
                                    price_per_hour={cancha.price_per_hour}
                                    horarios={cancha.horarios} // Pasar los horarios como prop
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Botón de WhatsApp */}
                <div className="fixed bottom-5 right-5">


                <a
                    href={`https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 bg-green-500 rounded-full shadow-lg"
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
