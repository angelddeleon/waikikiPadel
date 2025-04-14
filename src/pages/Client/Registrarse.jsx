import { Link, useNavigate } from "react-router";
import LayoutRegistrarse from "../../layout/LayoutRegistrarse";
import logo from "../../../public/Logo-Waikiki-NEGRO.png";
import { useState, useEffect } from "react";
import Select from "react-select";

function Registrarse() {
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [errors, setErrors] = useState({});
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all")
            .then((response) => response.json())
            .then((data) => {
                const countryList = data.map((country) => ({
                    value: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ""),
                    label: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ""),
                    flag: country.flags.png,
                    idd: country.idd
                }));
                setCountries(countryList);
            })
            .catch((error) => console.error("Error fetching countries:", error));
    }, []);

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
    };

    const formatOptionLabel = ({ label, flag }) => (
        <div style={{ display: "flex", alignItems: "center" }}>
            <img src={flag} alt={label} style={{ width: "20px", marginRight: "8px" }} />
            <span>{label}</span>
        </div>
    );

    const validateForm = () => {
        const newErrors = {};

        // Validación de nombre
        if (!nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio.";
        } else if (nombre.trim().length < 2) {
            newErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
        } else if (nombre.trim().length > 50) {
            newErrors.nombre = "El nombre no puede exceder los 50 caracteres.";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            newErrors.nombre = "El nombre solo puede contener letras y espacios.";
        }

        // Validación de teléfono
        if (!telefono.trim()) {
            newErrors.telefono = "El número de teléfono es obligatorio.";
        } else if (!/^\d+$/.test(telefono)) {
            newErrors.telefono = "El teléfono solo puede contener números.";
        } else if (telefono.length < 8 || telefono.length > 15) {
            newErrors.telefono = "El teléfono debe tener entre 8 y 15 dígitos.";
        }

        // Validación de email
        if (!email.trim()) {
            newErrors.email = "El correo electrónico es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "El correo electrónico no es válido.";
        } else if (email.length > 100) {
            newErrors.email = "El correo no puede exceder los 100 caracteres.";
        }

        // Validación de contraseña
        if (!password.trim()) {
            newErrors.password = "La contraseña es obligatoria.";
        } else if (password.length < 8) {
            newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
        } else if (password.length > 50) {
            newErrors.password = "La contraseña no puede exceder los 50 caracteres.";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            newErrors.password = "La contraseña debe contener al menos una mayúscula, una minúscula y un número.";
        }

        // Validación de país
        if (!selectedCountry) {
            newErrors.pais = "Debes seleccionar un país.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setIsLoading(true);

        if (validateForm()) {
            const data = {
                nombre,
                email,
                telefono,
                password,
                codigoPais: selectedCountry.value,
            };

            try {
                const response = await fetch("https://backend.waikikipadel.com/api/usuarios", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al registrar el usuario");
                }

                const result = await response.json();
                console.log("Usuario registrado:", result);
                navigate("/iniciarsesion");

            } catch (error) {
                console.error("Error:", error);
                setSubmitError(error.message || "Ocurrió un error al registrar. Por favor, inténtalo de nuevo.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    return (
        <LayoutRegistrarse>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <img className="h-25" src={logo} alt="Logo Waikiki" />
                <form onSubmit={handleSubmit} className="flex w-80 flex-col max-h-[80vh] overflow-y-auto">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            className={`mt-1 block w-full p-2 border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Número de teléfono</label>
                        <div className="flex items-center">
                            <Select
                                options={countries}
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                formatOptionLabel={formatOptionLabel}
                                getOptionLabel={option => option.label}
                                placeholder="Código"
                                className="w-1/2 h-full"
                                classNamePrefix="select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: errors.pais ? '#ef4444' : '#d1d5db',
                                        minHeight: '42px'
                                    }),
                                    option: (base) => ({
                                        ...base,
                                        padding: '4px 8px'
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        display: 'flex',
                                        alignItems: 'center'
                                    })
                                }}
                            />
                            <input
                                type="text"
                                className={`mt-1 block w-full p-2 border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} rounded-md ml-2 h-full`}
                                placeholder="Número de teléfono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                        </div>
                        {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                        {errors.pais && <p className="text-red-500 text-xs mt-1">{errors.pais}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                        <input
                            type="email"
                            className={`mt-1 block w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            className={`mt-1 block w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <Link to="/iniciarsesion">
                        <p className="text-blue-600 underline mb-4 text-sm">¿Tienes una cuenta? Inicia sesión</p>
                    </Link>

                    {submitError && (
                        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                            <p className="text-sm">{submitError}</p>
                        </div>
                    )}

                    <div className="sticky bottom-0 bg-white py-2">
                        <button
                            type="submit"
                            className={`rounded-lg py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full ${
                                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </span>
                            ) : (
                                "Registrarse"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </LayoutRegistrarse>
    );
}

export default Registrarse;