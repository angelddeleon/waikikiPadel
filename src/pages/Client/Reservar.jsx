import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import LayoutClient from "../../layout/LayoutClient.jsx";
import { formatTime } from "../../utils/formatTime.jsx";
import { ClipLoader } from "react-spinners";

function Reservar() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const canchaId = searchParams.get("cancha");
    const fechaInicial = searchParams.get("fecha");
    const horaInicial = searchParams.get("hora");

    const [cancha, setCancha] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getFechaActualVenezuela = () => {
        const ahora = new Date();
        const offsetVenezuela = -4 * 60;
        const fechaLocal = new Date(ahora.getTime() + offsetVenezuela * 60 * 1000);
        return fechaLocal.toISOString().split("T")[0];
    };

    const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaInicial || getFechaActualVenezuela());
    const [horasSeleccionadas, setHorasSeleccionadas] = useState(horaInicial ? [horaInicial] : []);
    const [errorFecha, setErrorFecha] = useState("");

    const fechaActual = getFechaActualVenezuela();

    useEffect(() => {
        const fetchCanchaYHorarios = async () => {
            try {
                setLoading(true);
                const [responseCancha, responseHorarios] = await Promise.all([
                    fetch(`http://localhost:3000/api/canchas/${canchaId}`),
                    fetch(`http://localhost:3000/api/horarios/disponibles?cancha_id=${canchaId}&fecha=${fechaSeleccionada}`)
                ]);

                if (!responseCancha.ok || !responseHorarios.ok) {
                    throw new Error("Error al obtener los datos");
                }

                const [dataCancha, dataHorarios] = await Promise.all([
                    responseCancha.json(),
                    responseHorarios.json()
                ]);

                // Ensure price_per_hour is a valid number
                const precioValidado = !isNaN(Number(dataCancha.price_per_hour)) 
                    ? Number(dataCancha.price_per_hour) 
                    : 0;

                setCancha({ 
                    ...dataCancha, 
                    price_per_hour: precioValidado,
                    horarios: dataHorarios 
                });
                setError(null);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCanchaYHorarios();
    }, [canchaId, fechaSeleccionada]);

    const validarFecha = (fecha) => {
        if (fecha < fechaActual) {
            setErrorFecha("No se pueden seleccionar fechas anteriores al día actual.");
            return false;
        } else {
            setErrorFecha("");
            return true;
        }
    };

    useEffect(() => {
        if (fechaInicial) {
            setFechaSeleccionada(fechaInicial);
            validarFecha(fechaInicial);
        }
    }, [fechaInicial]);

    const handleFechaChange = (e) => {
        const nuevaFecha = e.target.value;
        setFechaSeleccionada(nuevaFecha);
        setHorasSeleccionadas([]); // Limpiar selección al cambiar fecha
        validarFecha(nuevaFecha);
    };

    const handleHoraClick = (start_time) => {
        if (fechaSeleccionada < fechaActual) {
            setErrorFecha("No se pueden seleccionar horas para fechas pasadas.");
            return;
        }

        setHorasSeleccionadas(prev => 
            prev.includes(start_time) 
                ? prev.filter(hora => hora !== start_time) 
                : [...prev, start_time]
        );
    };

    // Safe calculation of price and total
    const precioPorHora = cancha?.price_per_hour ? Number(cancha.price_per_hour) : 0;
    const montoTotal = horasSeleccionadas.length * precioPorHora;

    const navigate = useNavigate();
    const handleReservarClick = () => {
        if (horasSeleccionadas.length === 0) {
            setErrorFecha("Debes seleccionar al menos una hora.");
            return;
        }

        navigate(`/metodospago?cancha=${canchaId}&fecha=${fechaSeleccionada}&horarios=${horasSeleccionadas.join(",")}&montoTotal=${montoTotal}`);
    };

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
                <div className="flex h-screen items-center justify-center text-red-500">
                    Error: {error}
                </div>
            </LayoutClient>
        );
    }

    return (
        <LayoutClient>
            <div className="flex flex-col min-h-screen">
                <img
                    src={cancha?.image}
                    alt={`Cancha ${cancha?.name}`}
                    className="w-full h-40 object-cover"
                />

                <div className="p-4 flex-grow overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-blue-950">Reservar:</h1>
                        <h2 className="text-xl md:text-2xl font-bold text-green-600">
                            {cancha?.name}
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-blue-950 mb-2 md:mb-0">
                            Elige cuando deseas jugar:
                        </h1>
                        <input
                            type="date"
                            value={fechaSeleccionada}
                            onChange={handleFechaChange}
                            min={fechaActual}
                            className="border p-2 rounded shadow"
                        />
                    </div>

                    {errorFecha && (
                        <div className="text-red-500 text-center mb-4">
                            {errorFecha}
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-blue-950 mb-4">
                            Horas disponibles
                        </h2>

                        {cancha?.horarios?.length > 0 ? (
                            <div className="flex flex-wrap gap-3 justify-center">
                                {cancha.horarios.map((horario) => (
                                    <button
                                        key={horario.start_time}
                                        className={`px-4 py-2 border rounded-lg shadow transition-all ${
                                            horasSeleccionadas.includes(horario.start_time)
                                                ? "bg-blue-800 text-white"
                                                : "bg-white hover:bg-blue-100"
                                        }`}
                                        onClick={() => handleHoraClick(horario.start_time)}
                                    >
                                        {formatTime(horario.start_time)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-gray-600 text-lg font-medium mb-2">
                                    No hay horarios disponibles
                                </p>
                                <p className="text-blue-600">
                                    Por favor selecciona otra fecha
                                </p>
                            </div>
                        )}
                    </div>

                    {horasSeleccionadas.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-blue-950 mb-2">
                                Monto a pagar
                            </h3>
                            <div className="bg-blue-800 text-white text-center rounded-lg p-4 shadow">
                                <p className="text-2xl font-bold">
                                    ${montoTotal.toFixed(2)}
                                </p>
                                <p className="text-sm">
                                    ({horasSeleccionadas.length} hora{horasSeleccionadas.length !== 1 ? 's' : ''} × ${precioPorHora.toFixed(2)})
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {horasSeleccionadas.length > 0 && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 px-6 shadow-lg">
                        <button
                            onClick={handleReservarClick}
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            Continuar con el pago
                        </button>
                    </div>
                )}
            </div>
        </LayoutClient>
    );
}

export default Reservar;