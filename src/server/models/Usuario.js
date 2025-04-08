import pool from '../config/db.js';

import bcrypt from 'bcryptjs';

export const createUsuario = async (user) => {
  const { nombre, email, telefono, password, codigoPais, role = 'usuario' } = user;

  // Validaciones adicionales
  if (!nombre || !email || !telefono || !password || !codigoPais) {
    throw new Error("Faltan campos obligatorios");
  }

  try {
    // Verificar conexión a la base de datos
    await pool.query('SELECT 1');
    
    // Verificar email único
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new Error("EMAIL_EXISTS");
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10)
      .catch(err => {
        throw new Error("Error al hashear la contraseña");
      });

    // Insertar usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, email, telefono, password, codigoPais, role, isBlocked)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, email, telefono, hashedPassword, codigoPais, role, false]
    );

    return result;
  } catch (error) {
    console.error('Error en createUsuario:', {
      message: error.message,
      stack: error.stack,
      userData: { email, nombre }
    });
    
    // Relanzar error con más contexto
    throw new Error(`MODEL_ERROR: ${error.message}`);
  }
};

export const findByEmail = async (email) => {
  const query = 'SELECT id, nombre, email, telefono, password, role, isBlocked FROM usuarios WHERE email = ?';
  const [rows] = await pool.query(query, [email]);
  return rows[0]; // Devuelve el primer usuario
};





export const findById = async (id) => {
  const query = 'SELECT * FROM usuarios WHERE id = ?';
  const [rows] = await pool.query(query, [id]);
  return rows[0]; // Devuelve el primer usuario
};
export const setPerfil = async (email, newValue) => {
  try {
      // Consulta para actualizar la columna deseada por email
      const query = 'UPDATE usuarios SET perfil = ? WHERE email = ?';
      const [result] = await pool.query(query, [newValue, email]);

      // Verificar si se afectó algún registro
      if (result.affectedRows > 0) {
          return { success: true, message: 'Registro actualizado correctamente' };
      } else {
          return { success: false, message: 'No se encontró un usuario con ese email' };
      }
  } catch (error) {
      console.error('Error al actualizar el registro:', error);
      return { success: false, message: 'Error al actualizar el registro' };
  }
};


