import { Link, useNavigate } from "react-router"; // Cambié 'react-router' a 'react-router-dom'
import LayoutRegistrarse from "../../layout/LayoutRegistrarse";
import logo from '../../assets/logo1.png';
import { useState } from "react";

function IniciarSesion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);  // Estado de carga
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Validación de email
    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    // Validación de contraseña
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);  // Inicia el loading

    if (validateForm()) {
      try {
        // Enviar los datos al backend
        const response = await fetch("http://localhost:3000/api/usuarios/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }), // Cambié 'contraseña' por 'password'
          credentials: 'include'  // Incluir las cookies en la solicitud
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al iniciar sesión");
        }

        const data = await response.json();
        console.log(data); // Verifica si la respuesta contiene el token

        // Guardar el token en el localStorage
        if (data.user) {
          // Guardar el token y la información del usuario en el localStorage
          const userData = {
            id: data.user.id,
            nombre: data.user.nombre,
            email: data.user.email,
            role: data.user.role
          };

          // Guardar todo en localStorage
          localStorage.setItem("user", JSON.stringify(userData));

          navigate("/principal");
        } else {
          throw new Error("User no recibido");
        }

        console.log("Inicio de sesión exitoso:", data);
      } catch (error) {
        console.error("Error:", error);
        setErrors({ submit: error.message });
      } finally {
        setIsLoading(false);  // Detiene el loading
      }
    } else {
      setIsLoading(false);  // Detiene el loading en caso de error de validación
      console.log("Formulario inválido. Corrige los errores.");
    }
  };

  return (
    <LayoutRegistrarse>
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <img className="w-3xs mb-20" src={logo} alt="logo" />

        <form onSubmit={handleSubmit} className="flex w-80 flex-col">
          {/* Campo de Email */}
          <div>
            <div className="relative mt-1 w-full">
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-1 border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2 pt-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
                placeholder=" "
              />
              <label
                htmlFor="email"
                className="absolute top-1.5 left-1 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text select-none bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-1.5 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600"
              >
                Ingresa tu correo
              </label>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Campo de Contraseña */}
          <div>
            <div className="mb-4 relative mt-1 w-full">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2 pt-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute top-1.5 left-1 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text select-none bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-1.5 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600"
              >
                Ingresa tu contraseña
              </label>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Enlace para registrarse */}
          <Link to="/">
            <p className="text-blue-600 underline mb-4">No tienes una cuenta todavía?</p>
          </Link>

          {/* Botón de Iniciar Sesión */}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
            disabled={isLoading} // Deshabilitar el botón mientras se carga
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"} {/* Muestra el texto 'Cargando...' cuando está en proceso */}
          </button>

          {/* Mostrar errores de inicio de sesión */}
          {errors.submit && <p className="text-red-500 text-xs mt-2">{errors.submit}</p>}
        </form>
      </div>
    </LayoutRegistrarse>
  );
}

export default IniciarSesion;
