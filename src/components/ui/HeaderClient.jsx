import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import logo from "../../../public/Logo-Waikiki-BLANCO.png";
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router';

const HeaderClient = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const response = await fetch('https://backend2node.waikikipadel.com/api/usuarios/verificarToken', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                
                if (response.ok && data.success) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error al verificar el token:', error);
                setIsAuthenticated(false);
            }
        };

        checkToken();
    }, []);

    const handleLogout = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://backend2node.waikikipadel.com/api/usuarios/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsAuthenticated(false);
                navigate('/iniciarsesion');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <header className="bg-blue-950 w-full flex justify-between items-center p-4 shadow-lg z-50">
            <Link to="/" className="flex items-center">
                <img src={logo} alt="logo" className="w-20 max-w-full" />
            </Link>

            <div className="flex items-center mx-4 space-x-4">
                {isAuthenticated ? (
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1 text-white cursor-pointer"
                        disabled={loading}
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                        <span>{loading ? 'Saliendo...' : 'Salir'}</span>
                    </button>
                ) : (
                    <>
                        <Link 
                            to="/iniciarsesion" 
                            className="flex items-center cursor-pointer space-x-1 text-white"
                        >
                            <span>Iniciar sesión</span>
                        </Link>
                        <Link 
                            to="/registrarse" 
                            className="flex items-center cursor-pointer space-x-1 text-white"
                        >
                            <span>Registrarse</span>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default HeaderClient;