import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import LayoutClient from "../../layout/LayoutClient.jsx";
import { MetodoPago } from "../../components/MetodoPago.jsx";
import { formatTime } from "../../utils/formatTime.jsx";
import Swal from "sweetalert2";

function MetodosPago() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const navigate = useNavigate();

    // Obtener parámetros
    const canchaId = searchParams.get("cancha");
    const fecha = searchParams.get("fecha");
    const horariosIds = searchParams.get("horarios")?.split(",") || [];
    const montoTotal = searchParams.get("montoTotal");

    // Estados
    const [cancha, setCancha] = useState(null);
    const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
    const [comprobante, setComprobante] = useState(null);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Validar parámetros
    useEffect(() => {
        if (!canchaId || !fecha || !horariosIds.length || !montoTotal) {
            setError("Faltan parámetros necesarios");
            Swal.fire({
                title: "Error",
                text: "Faltan parámetros para la reserva",
                icon: "error"
            }).then(() => navigate("/principal"));
        }
    }, [canchaId, fecha, horariosIds, montoTotal, navigate]);

    // Datos de métodos de pago
    const metodosPago = {
        "Pago Móvil": { requiereComprobante: true },
        "Zelle": { requiereComprobante: true },
        "Efectivo": { requiereComprobante: false }
    };

    // Obtener cancha
    useEffect(() => {
        const fetchCancha = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:3000/api/canchas/${canchaId}`);
                if (!res.ok) throw new Error("Error al obtener cancha");
                setCancha(await res.json());
            } catch (err) {
                setError(err.message);
                Swal.fire("Error", "No se pudo obtener la cancha", "error");
            } finally {
                setLoading(false);
            }
        };

        if (canchaId) fetchCancha();
    }, [canchaId]);

    // Formatear horarios
    const horariosFormateados = horariosIds.map(hora => {
        const fin = new Date(`2000-01-01T${hora}`);
        fin.setHours(fin.getHours() + 1);
        return {
            inicio: formatTime(hora),
            fin: formatTime(fin.toTimeString().slice(0, 8))
        };
    });

    // Manejar archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo y tamaño
        const tiposValidos = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!tiposValidos.includes(file.type)) {
            setError("Formato no válido. Use JPEG, PNG, JPG o PDF");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("El archivo es muy grande (máx. 5MB)");
            return;
        }

        setFile(file);
        setError("");

        // Vista previa si es imagen
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setComprobante(reader.result);
            reader.readAsDataURL(file);
        } else {
            setComprobante(null);
        }
    };

    // Procesar reserva
    const procesarReserva = async () => {
        setLoading(true);
        
        try {
            // 1. Subir comprobante si es necesario
            let nombreArchivo = null;
            if (file && metodosPago[metodoSeleccionado]?.requiereComprobante) {
                const formData = new FormData();
                formData.append("comprobante", file);
                
                const uploadRes = await fetch('http://localhost:3000/api/upload-comprobante', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Error al subir comprobante");
                const { filename } = await uploadRes.json();
                nombreArchivo = filename;
            }

            // 2. Crear reserva
            const horarios = horariosIds.map(hora => {
                const fin = new Date(`2000-01-01T${hora}`);
                fin.setHours(fin.getHours() + 1);
                return {
                    start_time: hora,
                    end_time: fin.toTimeString().slice(0, 8)
                };
            });

            const reservaRes = await fetch('http://localhost:3000/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    cancha_id: canchaId,
                    fecha,
                    horarios,
                    monto: montoTotal,
                    metodoPago: metodoSeleccionado,
                    nombreImg: nombreArchivo
                })
            });

            if (!reservaRes.ok) throw new Error("Error al crear reserva");

            // Éxito
            await Swal.fire({
                title: "¡Reserva exitosa!",
                text: `Tu reserva en ${cancha?.name} ha sido confirmada`,
                icon: "success"
            });
            navigate("/principal");

        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
            Swal.fire("Error", err.message || "Error al procesar la reserva", "error");
        } finally {
            setLoading(false);
        }
    };

    // Validar y confirmar reserva
    const handleReservar = () => {
        if (!metodoSeleccionado) {
            setError("Seleccione un método de pago");
            return;
        }
        if (metodosPago[metodoSeleccionado]?.requiereComprobante && !file) {
            setError("Debe subir un comprobante");
            return;
        }

        Swal.fire({
            title: "Confirmar reserva",
            text: `¿Desea reservar la cancha ${cancha?.name} por $${montoTotal}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, reservar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                procesarReserva();
            }
        });
    };

    if (loading) {
        return (
            <LayoutClient>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </LayoutClient>
        );
    }

    return (
        <LayoutClient>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 bg-blue-50 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-blue-900">Confirmar Reserva</h1>
                    </div>

                    <div className="p-6">
                        {/* Detalles de la reserva */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold">{cancha?.name || "Cargando..."}</h2>
                            <p className="text-gray-600">Fecha: {fecha}</p>
                        </div>

                        {/* Horarios */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Horarios:</h3>
                            {horariosFormateados.map((horario, i) => (
                                <div key={i} className="flex justify-between mb-2">
                                    <span>{horario.inicio} - {horario.fin}</span>
                                </div>
                            ))}
                        </div>

                        {/* Métodos de pago */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Método de Pago</h3>
                            {Object.keys(metodosPago).map((metodo) => (
                                <MetodoPago
                                    key={metodo}
                                    nombre={metodo}
                                    seleccionado={metodoSeleccionado === metodo}
                                    onChange={() => {
                                        setMetodoSeleccionado(metodo);
                                        setError("");
                                    }}
                                    requiereComprobante={metodosPago[metodo].requiereComprobante}
                                    onFileChange={handleFileChange}
                                    comprobante={comprobante}
                                />
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold">Total a pagar:</h3>
                            <p className="text-2xl font-bold">${montoTotal}</p>
                        </div>

                        {/* Errores */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        {/* Botón */}
                        <button
                            onClick={handleReservar}
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                        >
                            {loading ? "Procesando..." : "Confirmar Reserva"}
                        </button>
                    </div>
                </div>
            </div>
        </LayoutClient>
    );
}

export default MetodosPago;