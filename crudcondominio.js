// Backend/crudtablas/crudcondominio.js
const oracledb = require('oracledb');
const express = require('express');
const router = express.Router();

// Rutas CRUD para Condominios (CON_CONDOMINIO)

// Obtener todos los condominios
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery(`
            SELECT
                COND_CONDOMINIO,
                COND_NOMBRE,
                COND_DIRECCION
            FROM CON_CONDOMINIO
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener los condominios" });
    }
});

// Obtener un condominio por su ID
router.get('/:id', async (req, res) => {
    const condominioId = req.params.id;
    try {
        const result = await req.executeQuery(`
            SELECT
                COND_CONDOMINIO,
                COND_NOMBRE,
                COND_DIRECCION
            FROM CON_CONDOMINIO
            WHERE COND_CONDOMINIO = :id
        `, [condominioId]);
        if (result.rows.length > 0) {
            res.json({ success: true, condominio: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Condominio no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar el condominio' });
    }
});

// Insertar un nuevo condominio
router.post('/', async (req, res) => {
    const { COND_NOMBRE, COND_DIRECCION } = req.body;
    if (!COND_NOMBRE) {
        return res.status(400).json({ success: false, message: 'El nombre del condominio es obligatorio' });
    }
    try {
        const result = await req.executeQuery(
            `
            INSERT INTO CON_CONDOMINIO (COND_NOMBRE, COND_DIRECCION)
            VALUES (:nombre, :direccion)
            `,
            {
                nombre: COND_NOMBRE,
                direccion: COND_DIRECCION || null
            },
            { autoCommit: true, bindDefs: [ { type: oracledb.STRING }, { type: oracledb.STRING } ] } // Especifica los tipos de datos
        );
        res.status(201).json({ success: true, message: 'Condominio creado correctamente', insertedId: result.lastRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al crear el condominio' });
    }
});

// Actualizar un condominio existente
router.put('/:id', async (req, res) => {
    const condominioId = req.params.id;
    const { COND_NOMBRE, COND_DIRECCION } = req.body;
    if (!COND_NOMBRE) {
        return res.status(400).json({ success: false, message: 'El nombre del condominio es obligatorio para actualizar' });
    }
    try {
        const result = await req.executeQuery(
            `
            UPDATE CON_CONDOMINIO
            SET
                COND_NOMBRE = :nombre,
                COND_DIRECCION = :direccion
            WHERE COND_CONDOMINIO = :id
            `,
            {
                nombre: COND_NOMBRE,
                direccion: COND_DIRECCION || null,
                id: condominioId
            },
            { autoCommit: true }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Condominio actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Condominio no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar el condominio' });
    }
});

// Eliminar un condominio por su ID
router.delete('/:id', async (req, res) => {
    const condominioId = req.params.id;
    try {
        const result = await req.executeQuery(
            'DELETE FROM CON_CONDOMINIO WHERE COND_CONDOMINIO = :id',
            [condominioId],
            { autoCommit: true }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Condominio eliminado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Condominio no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar el condominio' });
    }
});

module.exports = router;