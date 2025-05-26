// backendk/crudtablas/crudresidencia.js
const express = require('express');
const router = express.Router();

// Rutas CRUD para Residencias (CON_RESIDENCIA)
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery('SELECT RES_RESIDENCIA, USU_USUARIO, RES_NOMBRE, RES_DIRECCION, RES_CORREO, RES_TELEFONO, COND_CONDOMINIO FROM CON_RESIDENCIA');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener las residencias" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await req.executeQuery(
            'SELECT RES_RESIDENCIA, USU_USUARIO, RES_NOMBRE, RES_DIRECCION, RES_CORREO, RES_TELEFONO, COND_CONDOMINIO FROM CON_RESIDENCIA WHERE RES_RESIDENCIA = :id',
            [req.params.id]
        );
        res.json(result.rows.length > 0 ? { success: true, residencia: result.rows[0] } : { success: false, message: 'Residencia no encontrada' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar la residencia' });
    }
});

router.post('/', async (req, res) => {
    const { USU_USUARIO, RES_NOMBRE, RES_DIRECCION, RES_CORREO, RES_TELEFONO, COND_CONDOMINIO } = req.body;
    if (!USU_USUARIO || !RES_NOMBRE || !COND_CONDOMINIO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (USU_USUARIO, RES_NOMBRE, COND_CONDOMINIO)' });
    }
    try {
        await req.executeQuery(
            'INSERT INTO CON_RESIDENCIA (USU_USUARIO, RES_NOMBRE, RES_DIRECCION, RES_CORREO, RES_TELEFONO, COND_CONDOMINIO) VALUES (:USU_USUARIO, :RES_NOMBRE, :RES_DIRECCION, :RES_CORREO, :RES_TELEFONO, :COND_CONDOMINIO)',
            [USU_USUARIO, RES_NOMBRE, RES_DIRECCION, RES_CORREO, RES_TELEFONO, COND_CONDOMINIO]
        );
        res.json({ success: true, message: 'Residencia insertada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al insertar la residencia' });
    }
});

router.put('/:id', async (req, res) => {
    const { USU_USUARIO, RES_NOMBRE, RES_DIRECCION, RES_CORREO, RES_TELEFONO, COND_CONDOMINIO } = req.body;
    const id = req.params.id;
    if (!USU_USUARIO || !RES_NOMBRE || !COND_CONDOMINIO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (USU_USUARIO, RES_NOMBRE, COND_CONDOMINIO)' });
    }
    try {
        const result = await req.executeQuery(
            `UPDATE CON_RESIDENCIA SET
                USU_USUARIO = :USU_USUARIO,
                RES_NOMBRE = :RES_NOMBRE,
                RES_DIRECCION = :RES_DIRECCION,
                RES_CORREO = :RES_CORREO,
                RES_TELEFONO = :RES_TELEFONO,
                COND_CONDOMINIO = :COND_CONDOMINIO
            WHERE RES_RESIDENCIA = :id`,
            [USU_USUARIO, RES_NOMBRE, RES_DIRECCION, RES_CORREO, RES_TELEFONO, COND_CONDOMINIO, id]
        );
        res.json(result.rowsAffected > 0 ? { success: true, message: 'Residencia actualizada correctamente' } : { success: false, message: 'Residencia no encontrada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar la residencia' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await req.executeQuery('DELETE FROM CON_RESIDENCIA WHERE RES_RESIDENCIA = :id', [req.params.id]);
        res.json({ success: true, message: 'Residencia eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar la residencia' });
    }
});

module.exports = router;