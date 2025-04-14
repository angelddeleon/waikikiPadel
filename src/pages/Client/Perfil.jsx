import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners"; // Importar el spinner
import LayoutClient from "../../layout/LayoutClient";

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const id = 0; // Aquí debes poner el id correcto, puede venir de un estado global o autenticación
        const response = await fetch(`https://backend.waikikipadel.com/api/usuarios/perfil/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Asegúrate de que las cookies se envíen correctamente
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del usuario");
        }

        const data = await response.json();
        setUsuario(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

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
        <div>Error: {error}</div>
      </LayoutClient>
    );
  }

  return (
    <LayoutClient>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        {/* Mostrar la imagen si existe */}
        <div className="w-36 h-36 mb-4 rounded-full overflow-hidden shadow-lg">
          {usuario.imageUrl ? (
            <img
              src={usuario.imageUrl}  // Aquí usamos la URL de la imagen proporcionada por el backend
              alt="Imagen de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600">Sin Imagen</div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-blue-950 mb-2">{usuario.nombre || "Cargando..."}</h2>

        {/* Código de país y número */}
        <div className="text-lg text-gray-700 mb-2">
          <span className="font-semibold">{usuario.codigoPais || "+XX"}</span>
          {` ${usuario.telefono || "000-000-0000"}`}
        </div>

        {/* Correo electrónico */}
        <div className="text-lg text-gray-700">
          <span className="font-semibold">Correo: </span>
          {usuario.email || "Cargando..."}
        </div>
      </div>
    </LayoutClient>
  );
}

export default Perfil;
