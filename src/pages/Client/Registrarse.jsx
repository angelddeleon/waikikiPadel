import { Link, useNavigate } from "react-router"; // Cambié la importación a react-router-dom
import LayoutRegistrarse from "../../layout/LayoutRegistrarse";
import logo from '../../assets/logo1.png';
import defaultUser from '../../assets/defaultUser.jpg';
import { useState, useEffect } from "react";
import Select from "react-select";

function Registrarse() {
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [file, setProfile] = useState(null);
    const [errors, setErrors] = useState({});
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // Cambié 'contraseña' a 'password'
    const navigate = useNavigate(); // Para redirigir al usuario

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(file)
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all")
            .then((response) => response.json())
            .then((data) => {
                const countryList = data.map((country) => ({
                    value: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ""),
                    flag: country.flags.png,
                }));
                setCountries(countryList);
            })
            .catch((error) => console.error("Error fetching countries:", error));
    }, []);

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
    };

    const formatOptionLabel = ({ value, flag }) => (
        <div style={{ display: "flex", alignItems: "center" }}>
            <img src={flag} alt={value} style={{ width: "20px" }} />
            <span>{value}</span>
        </div>
    );

    const validateForm = () => {
        const newErrors = {};

        if (!nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio.";
        } else if (nombre.trim().length < 2) {
            newErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
        }

        if (!telefono.trim()) {
            newErrors.telefono = "El número de teléfono es obligatorio.";
        } else if (!/^\d+$/.test(telefono)) {
            newErrors.telefono = "El número de teléfono debe ser válido.";
        }

        if (!email.trim()) {
            newErrors.email = "El correo electrónico es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "El correo electrónico no es válido.";
        }

        if (!password.trim()) { // Cambié 'contraseña' a 'password'
            newErrors.password = "La contraseña es obligatoria."; // Cambié 'contraseña' a 'password'
        } else if (password.trim().length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres."; // Cambié 'contraseña' a 'password'
        }

        if (!selectedCountry) {
            newErrors.pais = "Debes seleccionar un país.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            const data = {
                nombre,
                email,
                telefono,
                password, // Cambié 'contraseña' a 'password'
                codigoPais: selectedCountry.value,
                filname:file.name // Enviar el código del país
            };
            console.log(data);
            

             // Verifica que los datos sean correctos

            try {
                                
                const response = await fetch("http://localhost:3000/api/usuarios", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json", // Especifica el tipo de contenido
                    },
                    body: JSON.stringify(data), // Convierte el objeto a JSON
                });
                if(file){
                    const formData = new FormData();
                    formData.append("image", file);
                    formData.append("email", email); // "image" debe coincidir con el nombre del campo esperado en el backend
                
                     fetch("http://localhost:3000/api/usuarios/uploadImage", {
                        method: "POST",
                        body: formData, // Se envía el archivo correctamente como FormData
                    });
                }


                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al registrar el usuario");
                }

                const result = await response.json();
                console.log("Usuario registrado:", result);

                // Redirigir al usuario a la página principal
                navigate("/iniciarsesion");
            } catch (error) {
                console.error("Error:", error);
                setErrors({ submit: error.message });
            }
        } else {
            console.log("Formulario inválido. Corrige los errores.");
        }
    };

    return (
        <LayoutRegistrarse>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <img className="w-20 mb-4" src={logo} alt="logo" />
                    <div className="mb-4 rounded-full w-20 h-20 flex justify-center items-center overflow-hidden relative group">
                        <input
                            type="file"
                            id="profileImageInput"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="profileImageInput" className="cursor-pointer w-full h-full">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Foto de perfil"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={defaultUser}
                                    alt="Foto de perfil predeterminada"
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                </svg>
                            </div>
                        </label>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex w-80 flex-col max-h-[80vh] overflow-y-auto">
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">Número de teléfono</label>
                        <div className="flex items-center">
                            <Select
                                options={countries}
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                formatOptionLabel={formatOptionLabel}
                                placeholder="Codigo"
                                className="w-60 h-full"
                            />
                            <input
                                type="text"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md ml-2 h-full"
                                placeholder="Número de teléfono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                        </div>
                        {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                        <input
                            type="email"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            value={password} // Cambié 'contraseña' a 'password'
                            onChange={(e) => setPassword(e.target.value)} // Cambié 'setcontraseña' a 'setPassword'
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>} {/* Cambié 'contraseña' a 'password' */}
                    </div>

                    <Link to="/iniciarsesion">
                        <p className="text-blue-600 underline mb-4">¿Tienes una cuenta?</p>
                    </Link>

                    {/* Botón de Registrarse */}
                    <div className="sticky bottom-0 bg-white py-2">
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer w-full"
                        >
                            Registrarse
                        </button>
                    </div>
                </form>
            </div>
        </LayoutRegistrarse>
    );
}

export default Registrarse;
