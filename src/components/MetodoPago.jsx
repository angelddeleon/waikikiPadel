import React from "react";

export function MetodoPago({
  nombre,
  seleccionado,
  onChange,
  requiereComprobante,
  onFileChange,
  comprobante
}) {
  return (
    <div 
      className={`p-4 mb-3 border rounded-lg cursor-pointer ${
        seleccionado ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onClick={onChange}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{nombre}</h4>
        <input 
          type="radio" 
          checked={seleccionado}
          onChange={onChange}
          className="h-4 w-4 text-blue-600"
        />
      </div>

      {seleccionado && requiereComprobante && (
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">
            Subir comprobante:
          </label>
          <input
            type="file"
            onChange={(e) => {
              e.stopPropagation();
              onFileChange(e);
            }}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            accept="image/*,.pdf"
          />
          
          {comprobante && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
              {comprobante.startsWith("data:image") ? (
                <img src={comprobante} alt="Comprobante" className="max-w-xs border rounded" />
              ) : (
                <p className="text-sm">PDF seleccionado</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}