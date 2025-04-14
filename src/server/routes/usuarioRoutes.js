const express = require('express');
const {
  crearUsuario,
  obtenerPerfil,
  login,
  verificaToken,
  logout,
  uploadImage
} = require('../controllers/usuarioController');
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Rutas para los usuarios
router.post('/', crearUsuario);
router.post('/uploadImage', uploadImage);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verificarToken', verificaToken);
router.get('/perfil/:id', verifyToken, obtenerPerfil);

module.exports = router;