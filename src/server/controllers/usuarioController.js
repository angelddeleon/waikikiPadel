import {
  createUsuario,
  findByEmail,
  getUsuarios,
  deleteUsuario,
  toggleBlockUsuario,
  findById,
  setPerfil
} from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

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
  const { nombre, email, telefono, password, codigoPais,filname, role = 'usuario' } = req.body;

  if (!password) {
    return res.status(400).json({ error: "La contraseña es obligatoria" });
  }

  try {
    // Crear el nuevo usuario en la base de datos
    const result = await createUsuario({ nombre, email, telefono, password, codigoPais, role });
    setPerfil(email,filname );
    // Generar el token JWT
    const token = jwt.sign(
      { userId: result.id, role: result.role }, // Payload del token
      'secreto', // Clave secreta (debería estar en una variable de entorno)
      { expiresIn: '1h' } // Expiración del token
    );

    // Establecer la cookie 'token' con el token JWT
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 3600000, // 1 hora
      path: '/'
    });

    // Respuesta exitosa con el token
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.id,
        nombre: result.nombre,
        email: result.email,
        role: result.role,
      }
    });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario por email
    const user = await findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si el usuario está bloqueado
    if (user.isBlocked) {
      return res.status(400).json({ error: 'Usuario bloqueado' });
    }

    // Verificar si la contraseña está definida
    if (!user.password) {
      return res.status(400).json({ error: 'Contraseña no encontrada en la base de datos' });
    }

    // Asegúrate de que `password` no sea undefined ni nulo
    if (password === undefined || password === null) {
      return res.status(400).json({ error: 'Por favor, ingrese una contraseña' });
    }

    // Comparar contraseñas usando bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      'secreto',
      { expiresIn: '1h' }
    );

    // Establecer la cookie 'token' con el token JWT
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 3600000,
      path: '/'
    });

    // Respuesta exitosa con el token
    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
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

    // Excluir la contraseña antes de enviar la respuesta
    const { password, ...perfil } = usuario;

    res.json(perfil);
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al obtener el perfil del usuario' });
  }
};
 