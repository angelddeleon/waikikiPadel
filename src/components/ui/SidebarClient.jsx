import React, { useState, useEffect } from 'react';
import { Link } from 'react-router'; // Asegúrate de usar 'react-router-dom'
import logo from '../../assets/logo.png';
import MenuItemClient from '../MenuItemClient.jsx';
import { UserIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router';

const SidebarClient = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/usuarios/verificarToken', {
                    method: 'GET',
                    credentials: 'include', 
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true); // Si la respuesta es correcta, el usuario está autenticado
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error al verificar el token:', error);
                setIsAuthenticated(false);
            }
        };

        checkToken(); // Verificar token cuando se carga el componente
    }, []);

    const handleLogout = async () => {
        try {
            setLoading(true);

            const response = await fetch('http://localhost:3000/api/usuarios/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/iniciarsesion'); // Redirigir a la página de inicio de sesión
            } else {
                throw new Error('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Logo */}
            <Link to="/">
                <img className="w-full" src={logo} alt="logo" />
            </Link>

            {/* Si el usuario no está autenticado, mostrar los botones de login y registrarse debajo del logo */}
            {!isAuthenticated && (
                <div className="flex flex-col items-center list-none w-full mt-4">
                    {/* Botón de Iniciar sesión */}
                    <li className="w-full mb-4">
                        <Link to="/iniciarsesion">
                            <button className="block w-full py-2 text-center hover:bg-gray-600/50 hover:text-white rounded transition-colors">
                                Iniciar sesión
                            </button>
                        </Link>
                    </li>
                    {/* Botón de Registrarse */}
                    <li className="w-full">
                        <Link to="/">
                            <button className="block w-full py-2 text-center hover:bg-gray-600/50 hover:text-white rounded transition-colors">
                                Registrarse
                            </button>
                        </Link>
                    </li>
                </div>
            )}

            {/* Navegación */}
            <nav className="flex flex-col flex-grow justify-center items-center">
                <ul className="flex flex-col items-center list-none text-gray flex-grow">
                    {/* Si el usuario está autenticado, mostrar el menú de usuario */}
                    {isAuthenticated ? (
                        <>
                            <MenuItemClient
                                to="/perfil"
                                text="Perfil"
                                icon={<UserIcon className="w-5 h-5" />}
                            />
                            {/* Elemento "Salir" en la parte inferior */}
                            <li className="mt-auto w-full">
                                <button
                                    onClick={handleLogout}
                                    className="block w-full py-2 text-center hover:bg-gray-600/50 hover:text-white rounded transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? 'Cerrando sesión...' : 'Salir'}
                                </button>
                            </li>
                        </>
                    ) : (
                        <></>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default SidebarClient;
