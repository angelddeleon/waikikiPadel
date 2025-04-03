import {
  createUsuario,
  findByEmail,
  getUsuarios,
  deleteUsuario,
  toggleBlockUsuario,
  findById,

} from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import multer from 'multer';
import pool from '../config/db.js';
import rateLimit from 'express-rate-limit';

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
      cb(null, file.originalname); // Conserva el nombre original
  },
});

const upload = multer({ storage });

export const uploadImage = (req, res) => {
  return new Promise((resolve, reject) => {
      upload.single('image')(req, res, (err) => {
          if (err) {
              console.error('Error al subir la imagen:', err);
              return reject(new Error('Error al subir la imagen'));
          }
          if (!req.body) {
              return reject(new Error('No se proporcionó ninguna imagen'));
          }
           // Usa el nombre original en tu lógica
          resolve(req.body.image); // Retorna la ruta del archivo
      });
  });
};



export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, telefono, password, codigoPais, role = 'usuario' } = req.body;

    // Validaciones mejoradas
    if (!nombre || !email || !telefono || !password || !codigoPais) {
      return res.status(400).json({ 
        success: false,
        error: "Todos los campos son obligatorios",
        fields: { nombre, email, telefono, password, codigoPais }
      });
    }

    // Verificar conexión a la base de datos primero
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Error de conexión a la base de datos:', dbError);
      return res.status(500).json({ 
        success: false,
        error: "Error de conexión con la base de datos"
      });
    }

    // Verificar si el email ya existe
    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: "El correo electrónico ya está registrado"
      });
    }

    // Crear usuario
    const result = await createUsuario({ nombre, email, telefono, password, codigoPais, role });

    // Generar token JWT
    const token = jwt.sign(
      { userId: result.insertId, role },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );

    // Configurar cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 3600000,
      path: '/'
    });

    // Respuesta exitosa
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

// Configuración de límite de intentos
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 intentos por IP
  message: 'Demasiados intentos de inicio de sesión desde esta IP, intente nuevamente más tarde',
  skipSuccessfulRequests: true
});

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email y contraseña son requeridos' 
    });
  }

  try {
    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Formato de email inválido' 
      });
    }

    // Buscar el usuario
    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas' // Mensaje genérico por seguridad
      });
    }

    // Verificar usuario bloqueado
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false,
        error: 'Cuenta bloqueada. Contacte al administrador.' 
      });
    }

    // Verificar contraseña
    if (!user.password) {
      console.error(`Usuario ${email} no tiene contraseña en la base de datos`);
      return res.status(500).json({ 
        success: false,
        error: 'Error en el sistema. Contacte al administrador.' 
      });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Registrar intento fallido (podrías guardar esto en la base de datos)
      console.warn(`Intento fallido de inicio de sesión para el usuario: ${email}`);
      
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );

    // Configurar cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hora
      path: '/'
    });

    // Respuesta exitosa (sin enviar información sensible)
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


export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await getUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteUsuario(id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const bloquearUsuario = async (req, res) => {
  const { id } = req.params;
  const { isBlocked } = req.body;

  try {
    await toggleBlockUsuario(id, isBlocked);
    res.json({ message: `Usuario ${isBlocked ? 'bloqueado' : 'desbloqueado'} exitosamente` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const logout = (req, res) => {
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

export const verificaToken = (req, res) => {
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

export const obtenerPerfil = async (req, res) => {
  const userIdFromToken = req.user.userId; // ID del usuario en el token

  try {
    const usuario = await findById(userIdFromToken);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si existe la imagen del perfil, asigna la URL completa
    const imageUrl = usuario.profileImage 
      ? `http://localhost:3000/uploads/usuarios/${usuario.profileImage}` 
      : null;

    // Excluir la contraseña antes de enviar la respuesta
    const { password, ...perfil } = usuario;

    // Agregar la URL de la imagen al perfil
    res.json({ ...perfil, imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al obtener el perfil del usuario' });
  }
};
