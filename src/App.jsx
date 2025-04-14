import { Route, Routes, BrowserRouter } from 'react-router';  // Asegúrate de importar desde 'react-router-dom'

import Principal from './pages/Client/Principal.jsx';
import CanchasC from './pages/Client/Canchas.jsx';
import Reservar from './pages/Client/Reservar.jsx';
import MetodosPago from './pages/Client/MetodosPago.jsx';
import IniciarSesion from './pages/Client/IniciarSesion.jsx';
import Regitrarse from './pages/Client/Registrarse.jsx';
import MetodoPagoAdmin from './pages/Admin/MetodoPagoAdmin.jsx';
import Perfil from './pages/Client/Perfil.jsx';
import ProtectedRoute from './utils/ProtectedRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Principal />} />
        <Route path='/canchasdispo' element={<CanchasC />} />
        <Route path='/perfil' element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path='/reservar' element={<ProtectedRoute><Reservar /></ProtectedRoute>} />
        <Route path='/metodospago' element={<ProtectedRoute><MetodosPago /></ProtectedRoute>} />
        <Route path='/iniciarsesion' element={<IniciarSesion />} />
        <Route path='/registrarse' element={<Regitrarse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
