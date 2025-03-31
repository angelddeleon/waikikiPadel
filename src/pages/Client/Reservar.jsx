import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import LayoutClient from "../../layout/LayoutClient.jsx";
import { formatTime } from "../../utils/formatTime.jsx";
import { ClipLoader } from "react-spinners"; // Importar el spinner

function Reservar() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const canchaId = searchParams.get("cancha");
    const fechaInicial = searchParams.get("fecha");
    const horaInicial = searchParams.get("hora"); // Obtener la hora desde la URL

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
    const [horasSeleccionadas, setHorasSeleccionadas] = useState(horaInicial ? [horaInicial] : []); // Inicializar horas con la hora de la URL
    const [errorFecha, setErrorFecha] = useState("");

    const fechaActual = getFechaActualVenezuela();

    useEffect(() => {
        const fetchCanchaYHorarios = async () => {
            try {
                const responseCancha = await fetch(`http://localhost:3000/api/canchas/${canchaId}`);
                if (!responseCancha.ok) {
                    throw new Error("Error al obtener la cancha");
                }
                const dataCancha = await responseCancha.json();

                const responseHorarios = await fetch(
                    `http://localhost:3000/api/horarios/disponibles?cancha_id=${canchaId}&fecha=${fechaSeleccionada}`
                );
                if (!responseHorarios.ok) {
                    throw new Error("Error al obtener los horarios");
                }
                const dataHorarios = await responseHorarios.json();

                const canchaConHorarios = { ...dataCancha, horarios: dataHorarios };

                setCancha(canchaConHorarios);
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
        validarFecha(nuevaFecha);
    };

    const handleHoraClick = (start_time) => {
        if (fechaSeleccionada < fechaActual) {
            setErrorFecha("No se pueden seleccionar horas para fechas pasadas.");
            return;
        }

        if (horasSeleccionadas.includes(start_time)) {
            // Si ya está seleccionada, la quitamos
            setHorasSeleccionadas(horasSeleccionadas.filter((hora) => hora !== start_time));
        } else {
            // Si no está seleccionada, la agregamos
            setHorasSeleccionadas([...horasSeleccionadas, start_time]);
        }
    };

    const precioPorHora = cancha?.price_per_hour || 0;
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
        return <LayoutClient>
            <div className="flex h-screen items-center justify-center">
                <ClipLoader color="#1E3A8A" size={50} />
            </div>

        </LayoutClient>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <LayoutClient>
            <div className="flex flex-col min-h-screen">
                <img
                    src={cancha?.image}
                    alt="Cancha de pádel"
                    className="w-full h-40 object-cover"
                />

                <div id="infoCont" className="p-4 flex-grow overflow-y-auto h-130">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-blue-950">Reservar:</h1>
                        <h2 className="text-2xl md:text-3xl font-bold mr-4 text-green-600">
                            {cancha?.name || "Cargando..."}
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-between my-4">
                        <h1 className="text-2xl font-bold my-2 text-blue-950">Elige cuando deseas jugar:</h1>
                        <div className="flex justify-center">
                            <input
                                type="date"
                                value={fechaSeleccionada}
                                onChange={handleFechaChange}
                                min={fechaActual}
                                className="shadow w-xs p-4"
                            />
                        </div>
                    </div>

                    {errorFecha && (
                        <div className="text-red-500 text-center my-2">
                            {errorFecha}
                        </div>
                    )}

                    <div id="contHoras" className="flex flex-col my-1">
                        <h2 className="text-xl font-bold my-2 text-blue-950">Horas disponibles</h2>

                        <ul className="flex justify-center flex-wrap">
                            {cancha?.horarios?.map((horario) => (
                                <li key={horario.start_time}>
                                    <div
                                        id="horario"
                                        className={`flex justify-center items-center border w-25 mr-2 mb-2 p-2 shadow-2xl rounded cursor-pointer ${horasSeleccionadas.includes(horario.start_time)
                                            ? "bg-[#113872] text-white"
                                            : "hover:bg-[#113872] hover:text-white"
                                            } duration-300 ease-in`}
                                        onClick={() => handleHoraClick(horario.start_time)}
                                    >
                                        <p>{formatTime(horario.start_time)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {horasSeleccionadas.length > 0 && (
                        <>
                            <div id="precioCont" className="flex flex-col">
                                <h3 className="text-xl font-bold text-blue-950">Monto a pagar</h3>
                                <div className="bg-[#113872] text-white text-center rounded p-4 my-4">
                                    <p className="text-2xl font-bold">{montoTotal}$</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {horasSeleccionadas.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-white shadow-lg">
                        <button
                            onClick={handleReservarClick}
                            className="bg-blue-700 cursor-pointer text-white rounded-full w-md p-3"
                        >
                            Métodos de Pago
                        </button>
                    </div>
                )}
            </div>
        </LayoutClient>
    );
}

export default Reservar;
