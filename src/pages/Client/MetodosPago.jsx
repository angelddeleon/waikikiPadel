import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import LayoutClient from "../../layout/LayoutClient.jsx";
import { MetodoPago } from "../../components/MetodoPago.jsx";
import { formatTime } from "../../utils/formatTime.jsx";

function MetodosPago() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const canchaId = searchParams.get("cancha");
    const fecha = searchParams.get("fecha");
    const horariosIds = searchParams.get("horarios").split(",");
    const montoTotal = searchParams.get("montoTotal");

    const [cancha, setCancha] = useState(null);
    const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
    const [imagenPagoMovil, setImagenPagoMovil] = useState(null);

    const [imagenZelle, setImagenZelle] = useState(null);
    const [File, setFile] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const informacionMetodos = {
        "Pago Móvil": {
            instrucciones: "Realiza el pago a través de Pago Móvil usando el siguiente número: 0412-1234567.",
            contacto: "Banco: Banco de Venezuela",
        },
        "Zelle": {
            instrucciones: "Envía el pago a través de Zelle al correo: pagos@canchas.com.",
            contacto: "Correo: pagos@canchas.com",
        },
        "Efectivo": {
            instrucciones: "Paga en efectivo al llegar a la cancha.",
            contacto: "Contacto: 0412-7654321",
        },
    };

    useEffect(() => {
        // Fetch de la cancha por el ID
        const fetchCancha = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/canchas/${canchaId}`);
                if (!response.ok) {
                    throw new Error("Error al obtener los detalles de la cancha");
                }
                const dataCancha = await response.json();
                setCancha(dataCancha);
            } catch (error) {
                setError("No se pudo obtener la cancha.");
            }
        };

        fetchCancha();
    }, [canchaId]);

    // Función para sumar una hora a una hora dada
    const sumarUnaHora = (hora) => {
        const [h, m, s] = hora.split(":"); // Separar horas, minutos y segundos
        const fecha = new Date();
        fecha.setHours(parseInt(h, 10) + 1); // Sumar una hora
        fecha.setMinutes(parseInt(m, 10));
        fecha.setSeconds(parseInt(s, 10));
        return fecha.toTimeString().split(" ")[0]; // Devolver en formato HH:MM:SS
    };

    // Crear un array de objetos con las horas de inicio y fin
    const horariosFormateados = horariosIds.map((horaInicio) => {
        const horaFin = sumarUnaHora(horaInicio); // Sumar una hora a la hora de inicio
        return {
            horaInicio: formatTime(horaInicio), // Formatear la hora de inicio
            horaFin: formatTime(horaFin),       // Formatear la hora de fin
        };
    });

    const handleSeleccion = (metodo) => {
        if (metodoSeleccionado === metodo) {
            setMetodoSeleccionado(null);
            if (metodo === "Pago Móvil") setImagenPagoMovil(null);
            if (metodo === "Zelle") setImagenZelle(null);
        } else {
            setMetodoSeleccionado(metodo);
        }
    };

    const handleFileChange = (event, setImagen, otroSetImagen) => {
        const file = event.target.files[0];

        if (file) {
            setFile( event.target.files[0])
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagen(reader.result);
                otroSetImagen(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReservar = async () => {
        if (!metodoSeleccionado) {
            setError("Debes seleccionar un método de pago para reservar.");
            return;
        }
    
        if (
            (metodoSeleccionado === "Pago Móvil" && !imagenPagoMovil) ||
            (metodoSeleccionado === "Zelle" && !imagenZelle)
        ) {
            setError("Debes subir un comprobante de pago para reservar.");
            return;
        }
    
        setError("");
    
        try {
            // Crear un array de horarios con las horas de inicio y fin
            const horarios = horariosIds.map((horaInicio) => ({
                start_time: horaInicio,
                end_time: sumarUnaHora(horaInicio),
            }));
    
            // Enviar la solicitud al backend
            const reservaResponse = await fetch('http://localhost:3000/api/reservas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Esto asegura que el token se envíe con la solicitud
                body: JSON.stringify({
                    cancha_id: canchaId, // ID de la cancha
                    fecha: fecha, // Fecha de la reserva
                    horarios: horarios, // Array de horarios,
                    monto: montoTotal,
                    metodoPago: metodoSeleccionado,
                    nombreImg:File?File.name:null
                }),
            });
            if (File) {
                const formData = new FormData();
                    formData.append("image", File);
                    
                const reservaResponse2 = await fetch('http://localhost:3000/api/reservas/ImageCom', {
                    method: 'POST',
                    body: formData
                });

            }

    
            const reservaData = await reservaResponse.json();
    
            if (!reservaResponse.ok) {
                throw new Error(reservaData.message || "Error al crear la reserva");
            }
    
            console.log("Reserva exitosa");
            navigate("/principal"); // Redirigir al usuario a la página principal
        } catch (error) {
            console.error("Error al realizar la reserva:", error);
            setError("Error al realizar la reserva. Por favor, intenta de nuevo.");
        }
    };

    return (
        <LayoutClient>
            <div className="flex justify-center p-2">
                <div className="flex flex-col items-center w-full max-w-md h-100">
                    <div className="border border-gray-500 rounded-xl w-full shadow-lg">
                        <div className="p-2">
                            <h1 className="text-2xl font-bold text-blue-950">Reservar</h1>
                        </div>

                        <div className="flex justify-between items-center my-4 p-2">
                            <h2 className="text-xl font-bold text-green-600">{cancha?.name || "Cargando..."}</h2>
                            <p className="text-blue-950 font-bold">{fecha}</p>
                        </div>

                        {/* Mostrar los rangos de horas seleccionadas */}
                        {horariosFormateados.map((horario, index) => (
                            <div key={index} className="flex justify-center items-center my-4 font-bold">
                                <p className="m-2">Desde:</p>
                                <p className="m-2 font-semibold text-white p-2 rounded-xl text-center w-25 bg-blue-950">{horario.horaInicio}</p>
                                <p className="m-2">Hasta:</p>
                                <p className="m-2 font-semibold text-white p-2 rounded-xl text-center w-25 bg-blue-950">{horario.horaFin}</p>
                            </div>
                        ))}

                        <div className="flex flex-col font-bold text-blue-950">
                            <h3 className="text-xl font-bold mb-2 p-2">Métodos de Pago</h3>
                            <ul className="scroll-blue overflow-y-auto" style={{ maxHeight: "400px" }}>
                                <MetodoPago
                                    nombre="Pago Móvil"
                                    seleccionado={metodoSeleccionado === "Pago Móvil"}
                                    onChange={() => handleSeleccion("Pago Móvil")}
                                    informacion={informacionMetodos["Pago Móvil"]}
                                    onFileChange={(e) => handleFileChange(e, setImagenPagoMovil, setImagenZelle)}
                                    imagen={imagenPagoMovil}
                                    setImagen={setImagenPagoMovil}
                                    deshabilitado={!!imagenZelle}
                                />
                                <MetodoPago
                                    nombre="Zelle"
                                    seleccionado={metodoSeleccionado === "Zelle"}
                                    onChange={() => handleSeleccion("Zelle")}
                                    informacion={informacionMetodos["Zelle"]}
                                    onFileChange={(e) => handleFileChange(e, setImagenZelle, setImagenPagoMovil)}
                                    imagen={imagenZelle}
                                    setImagen={setImagenZelle}
                                    deshabilitado={!!imagenPagoMovil}
                                />
                                <MetodoPago
                                    nombre="Efectivo"
                                    seleccionado={metodoSeleccionado === "Efectivo"}
                                    onChange={() => handleSeleccion("Efectivo")}
                                    informacion={informacionMetodos["Efectivo"]}
                                />
                            </ul>
                        </div>
                    </div>

                    <div id="precioCont" className="w-full max-w-md mt-6">
                        <h3 className="text-xl font-bold">Monto a pagar</h3>
                        <div className="bg-[#113872] text-white text-center rounded p-2 my-2 shadow-md">
                            <p className="text-2xl font-bold">{montoTotal}$</p>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-center my-2">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-white shadow-lg">
                <button
                    onClick={handleReservar}
                    className="bg-blue-700 cursor-pointer text-white rounded-full w-md p-3"
                >
                    Reservar
                </button>
            </div>
        </LayoutClient>
    );
}

export default MetodosPago;
