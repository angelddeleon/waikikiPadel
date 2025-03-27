import pool from '../config/db.js';

import bcrypt from 'bcryptjs';

export const createUsuario = async (user) => {
  const { nombre, email, telefono, password, codigoPais, role = 'usuario' } = user;

  if (!password) {
    throw new Error("La contraseña es obligatoria");
  }

  // Cifra la contraseña antes de guardarla en la base de datos
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const query = `
      INSERT INTO usuarios (nombre, email, telefono, password, codigoPais, role, isBlocked)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      nombre,
      email,
      telefono,
      hashedPassword, // Guarda la contraseña cifrada
      codigoPais,
      role,
      false, // isBlocked por defecto es false
    ]);

    return result;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw new Error('No se pudo crear el usuario');
  }
};

export const findByEmail = async (email) => {
  const query = 'SELECT id, nombre, email, telefono, password, role, isBlocked FROM usuarios WHERE email = ?';
  const [rows] = await pool.query(query, [email]);
  return rows[0]; // Devuelve el primer usuario
};


export const getUsuarios = async () => {
  const query = 'SELECT * FROM usuarios';
  const [rows] = await pool.query(query);
  return rows;
};

export const deleteUsuario = async (id) => {
  await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
};

export const toggleBlockUsuario = async (id, isBlocked) => {
  const query = 'UPDATE usuarios SET isBlocked = ? WHERE id = ?';
  await pool.query(query, [isBlocked, id]);
};

export const findById = async (id) => {
  const query = 'SELECT * FROM usuarios WHERE id = ?';
  const [rows] = await pool.query(query, [id]);
  return rows[0]; // Devuelve el primer usuario
};
export const setPerfil = async (email, newValue) => {
  try {
      // Consulta para actualizar la columna deseada por email
      const query = 'UPDATE usuarios SET profileImage = ? WHERE email = ?';
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


