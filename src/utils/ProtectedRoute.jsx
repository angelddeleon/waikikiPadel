import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ClipLoader } from "react-spinners"; 
import LayoutClient from '../layout/LayoutClient';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkTokenValidity = async () => {
            try {
                const response = await fetch('https://backend.waikikipadel.com/api/usuarios/verificarToken', {
                    method: 'GET',
                    credentials: 'include', 
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 401) {
                    // Si el token es inválido, redirige a login
                    navigate('/iniciarsesion');
                    return;
                }

                // Si el token es válido, continúa la carga de la página
                const data = await response.json();
                console.log(data);
            } catch (error) {
                setError(error.message);
                navigate('/iniciarsesion');
            } finally {
                setLoading(false);  // Importante: termina el estado de carga
            }
        };

        checkTokenValidity();
    }, [navigate]);

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

    return children;  // Si todo está bien, renderiza el componente hijo
};

export default ProtectedRoute;
