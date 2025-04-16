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

exports.uploadImage = (req, res) => {
  return new Promise((resolve, reject) => {
      upload.single('image')(req, res, (err) => {
          if (err) {
              console.error('Error al subir la imagen:', err);
              return reject(new Error('Error al subir la imagen'));
          }
          if (!req.body) {
              return reject(new Error('No se proporcionó ninguna imagen'));
          }
          resolve(req.body.image);
      });
  });
};

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, telefono, password, codigoPais, role = 'usuario' } = req.body;

    if (!nombre || !email || !telefono || !password || !codigoPais) {
      return res.status(400).json({ 
        success: false,
        error: "Todos los campos son obligatorios",
        fields: { nombre, email, telefono, password, codigoPais }
      });
    }

    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Error de conexión a la base de datos:', dbError);
      return res.status(500).json({ 
        success: false,
        error: "Error de conexión con la base de datos"
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
      maxAge: 3600000,
      path: '/'
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: { id: result.insertId, nombre, email, role }
    });

  } catch (error) {
    console.error('Error detallado en crearUsuario:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    
    return res.status(500).json({
      success: false,
      error: "Error en el servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : null
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Formato de email inválido' 
      });
    }

    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false,
        error: 'Cuenta bloqueada. Contacte al administrador.' 
      });
    }

    if (!user.password) {
      console.error(`Usuario ${email} no tiene contraseña en la base de datos`);
      return res.status(500).json({ 
        success: false,
        error: 'Error en el sistema. Contacte al administrador.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Intento fallido de inicio de sesión para el usuario: ${email}`);
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
      sameSite: 'strict',
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
    console.error('Error en el login:', {
      message: error.message,
      stack: error.stack,
      email: email,
      timestamp: new Date().toISOString()
    });

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
      path: '/'
    });
    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error en el logout:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

exports.verificaToken = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No hay token. Inicia sesión' });
  }

  jwt.verify(token, 'secreto', (err, decoded) => {
    if (err) {
      res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None', path: '/' });
      return res.status(401).json({ error: 'Token inválido' });
    }

    res.json({ message: 'Token válido', user: decoded });
  });
};

exports.obtenerPerfil = async (req, res) => {
  const userIdFromToken = req.user.userId;

  try {
    const usuario = await findById(userIdFromToken);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const imageUrl = usuario.profileImage 
      ? `http://localhost:3000/uploads/usuarios/${usuario.profileImage}` 
      : null;

    const { password, ...perfil } = usuario;

    res.json({ ...perfil, imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al obtener el perfil del usuario' });
  }
};