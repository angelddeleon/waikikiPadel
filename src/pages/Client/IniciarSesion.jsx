import { Link, useNavigate } from "react-router";
import LayoutRegistrarse from "../../layout/LayoutRegistrarse";
import logo from "../../../public/Logo-Waikiki-NEGRO.png";
import { useState, useEffect } from "react";

function IniciarSesion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(null);
  const navigate = useNavigate();

  // Efecto para verificar bloqueo temporal
  useEffect(() => {
    const lastAttempt = localStorage.getItem('lastFailedAttempt');
    const blockTime = localStorage.getItem('blockTime');
    
    if (lastAttempt && blockTime) {
      const now = new Date();
      const blockUntil = new Date(parseInt(blockTime));
      
      if (now < blockUntil) {
        setIsBlocked(true);
        setBlockTime(blockUntil);
        
        // Temporizador para desbloquear
        const timer = setTimeout(() => {
          setIsBlocked(false);
          localStorage.removeItem('lastFailedAttempt');
          localStorage.removeItem('blockTime');
        }, blockUntil - now);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Validación de email
    if (!email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    } else if (email.length > 100) {
      newErrors.email = "El correo no puede exceder los 100 caracteres";
    }

    // Validación de contraseña
    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (password.length > 50) {
      newErrors.password = "La contraseña no puede exceder los 50 caracteres";
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Debe contener al menos una mayúscula, una minúscula y un número";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (isBlocked) {
      const remainingTime = Math.ceil((blockTime - new Date()) / 1000 / 60);
      setSubmitError(`Cuenta bloqueada temporalmente. Intente nuevamente en ${remainingTime} minutos.`);
      return;
    }

    if (validateForm()) {
      setIsLoading(true);

      try {
        const response = await fetch("https://backend2node.waikikipadel.com/api/usuarios/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: 'include' // Importante: aseguramos que las cookies se incluyan
        });

        const data = await response.json();

        if (!response.ok) {
          // Manejo de intentos fallidos
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);

          if (newAttempts >= 3) {
            // Bloquear por 15 minutos después de 3 intentos fallidos
            const blockUntil = new Date(Date.now() + 15 * 60 * 1000);
            localStorage.setItem('lastFailedAttempt', Date.now());
            localStorage.setItem('blockTime', blockUntil.getTime());
            setIsBlocked(true);
            setBlockTime(blockUntil);
            
            setSubmitError("Demasiados intentos fallidos. Su cuenta está bloqueada temporalmente por 15 minutos.");
          } else {
            throw new Error(data.error || "Error al iniciar sesión");
          }
        } else {
          // Resetear contador de intentos fallidos
          setAttempts(0);
          localStorage.removeItem('lastFailedAttempt');
          localStorage.removeItem('blockTime');

          // Guardar datos del usuario
          if (data.user) {
            const userData = {
              id: data.user.id,
              nombre: data.user.nombre,
              email: data.user.email,
              role: data.user.role,
              token: data.token
            };

            localStorage.setItem("user", JSON.stringify(userData));
            navigate("/"); // Redirigir al principal
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setSubmitError(error.message || "Error al iniciar sesión");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <LayoutRegistrarse>
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <img className="w-3xs mb-5" src={logo} alt="logo" />
        <form onSubmit={handleSubmit} className="flex w-80 flex-col">
          {/* Campo de Email */}
          <div>
            <div className="relative mt-1 w-full">
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mb-1 border-1 peer block w-full appearance-none rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } bg-transparent px-2.5 pb-2 pt-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0`}
                placeholder=" "
                disabled={isBlocked}
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
                className={`border-1 peer block w-full appearance-none rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } bg-transparent px-2.5 pb-2 pt-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0`}
                placeholder=" "
                disabled={isBlocked}
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
          <Link to="/registrarse" className="mb-4">
            <p className="text-blue-600 underline">¿No tienes una cuenta todavía?</p>
          </Link>

          {/* Botón de Iniciar Sesión */}
          <button
            type="submit"
            className={`rounded-lg py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading || isBlocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
            disabled={isLoading || isBlocked}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : isBlocked ? "Cuenta bloqueada" : "Iniciar Sesión"}
          </button>

          {/* Mostrar errores */}
          {submitError && (
            <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {submitError}
            </div>
          )}
        </form>
      </div>
    </LayoutRegistrarse>
  );
}

export default IniciarSesion;
