// backendk/crudtablas/crudusuario.js
const express = require('express');
const router = express.Router();
// No necesitas importar executeQuery aquí

// Rutas CRUD para Usuarios (CON_USUARIO)
router.get('/', async (req, res) => {
  try {
    const result = await req.executeQuery('SELECT USU_USUARIO, USU_PRIMER_NOMBRE, USU_SEGUNDO_NOMBRE, USU_PRIMER_APELLIDO, USU_SEGUNDO_APELLIDO, USU_DPI, TO_CHAR(USU_FECHA_NAC, \'YYYY-MM-DD\') AS USU_FECHA_NAC, USU_TELEFONO, USU_CORREO, USU_NOMBRE_USUARIO, USU_ROL_USUARIO FROM CON_USUARIO');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al obtener los usuarios" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.executeQuery(
      'SELECT USU_USUARIO, USU_PRIMER_NOMBRE, USU_SEGUNDO_NOMBRE, USU_PRIMER_APELLIDO, USU_SEGUNDO_APELLIDO, USU_DPI, TO_CHAR(USU_FECHA_NAC, \'YYYY-MM-DD\') AS USU_FECHA_NAC, USU_TELEFONO, USU_CORREO, USU_NOMBRE_USUARIO, USU_ROL_USUARIO FROM CON_USUARIO WHERE USU_USUARIO = :id',
      [req.params.id]
    );
    res.json(result.rows.length > 0 ? { success: true, usuario: result.rows[0] } : { success: false, message: 'Usuario no encontrado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al buscar el usuario' });
  }
});

router.post('/', async (req, res) => {
  const { primerNombre, segundoNombre, primerApellido, segundoApellido, dpi, fechaNac, telefono, correo, nombreUsuario, contraseña, rolUsuario } = req.body;
  if (!primerNombre || !primerApellido || !nombreUsuario || !contraseña) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (primer nombre, primer apellido, nombre de usuario, contraseña)' });
  }
  try {
    await req.executeQuery(
      `INSERT INTO CON_USUARIO (USU_PRIMER_NOMBRE, USU_SEGUNDO_NOMBRE, USU_PRIMER_APELLIDO, USU_SEGUNDO_APELLIDO, USU_DPI, USU_FECHA_NAC, USU_TELEFONO, USU_CORREO, USU_NOMBRE_USUARIO, USU_CONTRASEÑA, USU_ROL_USUARIO)
        VALUES (:primerNombre, :segundoNombre, :primerApellido, :segundoApellido, :dpi, TO_DATE(:fechaNac, 'YYYY-MM-DD'), :telefono, :correo, :nombreUsuario, :contraseña, :rolUsuario)`,
      [primerNombre, segundoNombre, primerApellido, segundoApellido, dpi, fechaNac, telefono, correo, nombreUsuario, contraseña, rolUsuario]
    );
    res.json({ success: true, message: 'Usuario insertado correctamente' });
  } catch (err) {
    console.error("Error al insertar el usuario:", err);
    res.status(500).json({ success: false, message: 'Error al insertar el usuario' });
  }
});

router.put('/:id', async (req, res) => {
  const { primerNombre, segundoNombre, primerApellido, segundoApellido, dpi, fechaNac, telefono, correo, nombreUsuario, contraseña, rolUsuario } = req.body;
  const id = req.params.id;
  if (!primerNombre || !primerApellido || !nombreUsuario || !contraseña) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (primer nombre, primer apellido, nombre de usuario, contraseña)' });
  }
  try {
    const result = await req.executeQuery(
      `UPDATE CON_USUARIO SET
          USU_PRIMER_NOMBRE = :primerNombre,
          USU_SEGUNDO_NOMBRE = :segundoNombre,
          USU_PRIMER_APELLIDO = :primerApellido,
          USU_SEGUNDO_APELLIDO = :segundoApellido,
          USU_DPI = :dpi,
          USU_FECHA_NAC = TO_DATE(:fechaNac, 'YYYY-MM-DD'),
          USU_TELEFONO = :telefono,
          USU_CORREO = :correo,
          USU_NOMBRE_USUARIO = :nombreUsuario,
          USU_CONTRASEÑA = :contraseña,
          USU_ROL_USUARIO = :rolUsuario
        WHERE USU_USUARIO = :id`,
      [primerNombre, segundoNombre, primerApellido, segundoApellido, dpi, fechaNac, telefono, correo, nombreUsuario, contraseña, rolUsuario, id]
    );
    res.json(result.rowsAffected > 0 ? { success: true, message: 'Usuario actualizado correctamente' } : { success: false, message: 'Usuario no encontrado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.executeQuery('DELETE FROM CON_USUARIO WHERE USU_USUARIO = :id', [req.params.id]);
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
  }
});

module.exports = router;