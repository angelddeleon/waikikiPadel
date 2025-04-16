const {
  createUsuario,
  findByEmail,
  findById,
} = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const multer = require('multer');
const pool = require('../config/db');
const rateLimit = require('express-rate-limit');

// Configuración de Multer (se mantiene igual)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadPath = '../uploads/usuarios/';
      fs.access(uploadPath, fs.constants.W_OK, (err) => {
          if (err) {
              console.error('No se puede escribir en la carpeta:', err);
              return cb(new Error('Error al escribir en la carpeta destino.'));
          }
          cb(null, uploadPath);
      });
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  },
});

const upload = multer({ storage });

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, telefono, password, codigoPais, role = 'usuario' } = req.body;

    if (!nombre || !email || !telefono || !password || !codigoPais) {
      return res.status(400).json({ 
        success: false,
        error: "Todos los campos son obligatorios"
      });
    }

    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: "El correo electrónico ya está registrado"
      });
    }

    const result = await createUsuario({ nombre, email, telefono, password, codigoPais, role });

    const token = jwt.sign(
      { userId: result.insertId, role },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'production' ? '.waikikipadel.com' : undefined,
      maxAge: 3600000,
      path: '/'
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: { id: result.insertId, nombre, email, role }
    });

  } catch (error) {
    console.error('Error en crearUsuario:', error);
    return res.status(500).json({
      success: false,
      error: "Error en el servidor"
    });
  }
};

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de inicio de sesión desde esta IP, intente nuevamente más tarde',
  skipSuccessfulRequests: true
});

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email y contraseña son requeridos' 
    });
  }

  try {
    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'production' ? '.waikikipadel.com' : undefined,
      maxAge: 3600000,
      path: '/'
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error en el servidor' 
    });
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'production' ? '.waikikipadel.com' : undefined,
      path: '/'
    });
    res.json({ 
      success: true,
      message: 'Sesión cerrada correctamente' 
    });
  } catch (error) {
    console.error('Error en el logout:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al cerrar sesión' 
    });
  }
};

exports.verificaToken = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'No hay token. Inicia sesión' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secreto', (err, decoded) => {
    if (err) {
      res.clearCookie('token', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        domain: process.env.NODE_ENV === 'production' ? '.waikikipadel.com' : undefined,
        path: '/' 
      });
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido' 
      });
    }

    res.json({ 
      success: true,
      message: 'Token válido', 
      user: decoded 
    });
  });
};