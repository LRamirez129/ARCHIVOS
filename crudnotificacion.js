// Backend/crudtablas/crudnotificacion.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb'); 
// Rutas CRUD para Notificaciones (CON_NOTIFICACION)

// Obtener todas las notificaciones
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery('SELECT NOT_NOTIFICACION, RES_RESIDENCIA, NOT_MENSAJE, TO_CHAR(NOT_FECHA, \'YYYY-MM-DD HH24:MI:SS\') AS NOT_FECHA, NOT_TIPO FROM CON_NOTIFICACION');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener las notificaciones" });
    }
});

// Obtener una notificación por su ID
router.get('/:id', async (req, res) => {
    const notificacionId = req.params.id;
    try {
        const result = await req.executeQuery(
            'SELECT NOT_NOTIFICACION, RES_RESIDENCIA, NOT_MENSAJE, TO_CHAR(NOT_FECHA, \'YYYY-MM-DD HH24:MI:SS\') AS NOT_FECHA, NOT_TIPO FROM CON_NOTIFICACION WHERE NOT_NOTIFICACION = :id',
            [notificacionId]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, notificacion: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Notificación no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar la notificación' });
    }
});

// Insertar una nueva notificación
router.post('/', async (req, res) => {
    const { RES_RESIDENCIA, NOT_MENSAJE, NOT_FECHA, NOT_TIPO } = req.body;
    if (!RES_RESIDENCIA || !NOT_MENSAJE || !NOT_FECHA || !NOT_TIPO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para la notificación' });
    }
    try {
        const result = await req.executeQuery(
            'INSERT INTO CON_NOTIFICACION (RES_RESIDENCIA, NOT_MENSAJE, NOT_FECHA, NOT_TIPO) VALUES (:residencia, :mensaje, TO_DATE(:fecha, \'YYYY-MM-DD\'), :tipo) RETURNING NOT_NOTIFICACION INTO :newId',
            { residencia: RES_RESIDENCIA, mensaje: NOT_MENSAJE, fecha: NOT_FECHA, tipo: NOT_TIPO, newId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } }, // MODIFICADO PARA SOLO FECHA
            { autoCommit: true } // Asegúrate de que autoCommit esté aquí si no lo está en executeQuery
        );
        res.status(201).json({ success: true, message: 'Notificación creada correctamente', insertedId: result.outBinds.newId[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al crear la notificación' });
    }
});

// Actualizar una notificación existente
router.put('/:id', async (req, res) => {
    const notificacionId = req.params.id;
    const { RES_RESIDENCIA, NOT_MENSAJE, NOT_FECHA, NOT_TIPO } = req.body;
    if (!RES_RESIDENCIA || !NOT_MENSAJE || !NOT_FECHA || !NOT_TIPO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para actualizar la notificación' });
    }
    try {
        const result = await req.executeQuery(
            'UPDATE CON_NOTIFICACION SET RES_RESIDENCIA = :residencia, NOT_MENSAJE = :mensaje, NOT_FECHA = TO_DATE(:fecha, \'YYYY-MM-DD\'), NOT_TIPO = :tipo WHERE NOT_NOTIFICACION = :id', // MODIFICADO PARA SOLO FECHA
            { residencia: RES_RESIDENCIA, mensaje: NOT_MENSAJE, fecha: NOT_FECHA, tipo: NOT_TIPO, id: notificacionId },
            { autoCommit: true } // Asegúrate de que autoCommit esté aquí si no lo está en executeQuery
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Notificación actualizada correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Notificación no encontrada' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar la notificación' });
    }
});

// Eliminar una notificación por su ID
router.delete('/:id', async (req, res) => {
    const notificacionId = req.params.id;
    try {
        const result = await req.executeQuery(
            'DELETE FROM CON_NOTIFICACION WHERE NOT_NOTIFICACION = :id',
            [notificacionId],
            { autoCommit: true } // Asegúrate de que autoCommit esté aquí si no lo está en executeQuery
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Notificación eliminada correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Notificación no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar la notificación' });
    }
});

module.exports = router;