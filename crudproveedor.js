// Backend/crudtablas/crudproveedor.js
const oracledb = require('oracledb');
const express = require('express');
const router = express.Router();

// Rutas CRUD para Proveedores (CON_PROVEEDOR)

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery(`
            SELECT
                PRO_PROVEEDOR,
                PRO_NOMBRE,
                PRO_NOMBRE_CONTACTO,
                PRO_NUMERO,
                PRO_NIT
            FROM CON_PROVEEDOR
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener los proveedores" });
    }
});

// Obtener un proveedor por su ID
router.get('/:id', async (req, res) => {
    const proveedorId = req.params.id;
    try {
        const result = await req.executeQuery(`
            SELECT
                PRO_PROVEEDOR,
                PRO_NOMBRE,
                PRO_NOMBRE_CONTACTO,
                PRO_NUMERO,
                PRO_NIT
            FROM CON_PROVEEDOR
            WHERE PRO_PROVEEDOR = :id
        `, [proveedorId]);
        if (result.rows.length > 0) {
            res.json({ success: true, proveedor: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar el proveedor' });
    }
});

// Insertar un nuevo proveedor
router.post('/', async (req, res) => {
    const { PRO_NOMBRE, PRO_NOMBRE_CONTACTO, PRO_NUMERO, PRO_NIT } = req.body;
    if (!PRO_NOMBRE) {
        return res.status(400).json({ success: false, message: 'El nombre del proveedor es obligatorio' });
    }
    try {
        const result = await req.executeQuery(
            `
            INSERT INTO CON_PROVEEDOR (PRO_NOMBRE, PRO_NOMBRE_CONTACTO, PRO_NUMERO, PRO_NIT)
            VALUES (:nombre, :contacto, :numero, :nit)
            `,
            {
                nombre: PRO_NOMBRE,
                contacto: PRO_NOMBRE_CONTACTO || null,
                numero: PRO_NUMERO || null,
                nit: PRO_NIT || null
            },
            { autoCommit: true, bindDefs: [ { type: oracledb.STRING }, { type: oracledb.STRING }, { type: oracledb.STRING }, { type: oracledb.STRING } ] } // Especifica los tipos de datos
        );
        res.status(201).json({ success: true, message: 'Proveedor creado correctamente', insertedId: result.lastRowid });
    } catch (err) {
        console.error(err);
        // Error específico para la restricción UNIQUE de PRO_NIT
        if (err.message && err.message.includes('ORA-00001')) {
            return res.status(400).json({ success: false, message: 'El NIT ya existe' });
        }
        res.status(500).json({ success: false, message: 'Error al crear el proveedor' });
    }
});

// Actualizar un proveedor existente
router.put('/:id', async (req, res) => {
    const proveedorId = req.params.id;
    const { PRO_NOMBRE, PRO_NOMBRE_CONTACTO, PRO_NUMERO, PRO_NIT } = req.body;
    if (!PRO_NOMBRE) {
        return res.status(400).json({ success: false, message: 'El nombre del proveedor es obligatorio para actualizar' });
    }
    try {
        const result = await req.executeQuery(
            `
            UPDATE CON_PROVEEDOR
            SET
                PRO_NOMBRE = :nombre,
                PRO_NOMBRE_CONTACTO = :contacto,
                PRO_NUMERO = :numero,
                PRO_NIT = :nit
            WHERE PRO_PROVEEDOR = :id
            `,
            {
                nombre: PRO_NOMBRE,
                contacto: PRO_NOMBRE_CONTACTO || null,
                numero: PRO_NUMERO || null,
                nit: PRO_NIT || null,
                id: proveedorId
            },
            { autoCommit: true }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Proveedor actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        }
    } catch (err) {
        console.error(err);
        // Error específico para la restricción UNIQUE de PRO_NIT
        if (err.message && err.message.includes('ORA-00001')) {
            return res.status(400).json({ success: false, message: 'El NIT ya existe' });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar el proveedor' });
    }
});

// Eliminar un proveedor por su ID
router.delete('/:id', async (req, res) => {
    const proveedorId = req.params.id;
    try {
        const result = await req.executeQuery(
            'DELETE FROM CON_PROVEEDOR WHERE PRO_PROVEEDOR = :id',
            [proveedorId],
            { autoCommit: true }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Proveedor eliminado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar el proveedor' });
    }
});

module.exports = router;