import express from 'express';
import {
  crearUsuario,
  obtenerPerfil,
  login,
  verificaToken,
  logout,
  uploadImage  // Importar la nueva función logout
} from '../controllers/usuarioController.js';
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Rutas para los usuarios
router.post('/', crearUsuario); // Registrar usuario
router.post('/uploadImage', uploadImage); // Registrar usuario
router.post('/login', login); // Login de usuario
router.post('/logout', logout); // Nueva ruta para cerrar sesión

router.get('/verificarToken', verificaToken);  // Verificar si el token es válido

router.get('/perfil/:id', verifyToken, obtenerPerfil);

export default router;
