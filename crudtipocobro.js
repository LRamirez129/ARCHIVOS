// Backend/crudtablas/crudtipocobro.js
const express = require('express');
const router = express.Router();

// Rutas CRUD para Tipos de Cobro (CON_TIPO_COBRO)

// Obtener todos los tipos de cobro
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery('SELECT TICO_TIPO_COBRO, TICO_NOMBRE, TICO_DESCRIPCION FROM CON_TIPO_COBRO');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener los tipos de cobro" });
    }
});

// Obtener un tipo de cobro por su ID
router.get('/:id', async (req, res) => {
    const tipoCobroId = req.params.id;
    try {
        const result = await req.executeQuery(
            'SELECT TICO_TIPO_COBRO, TICO_NOMBRE, TICO_DESCRIPCION FROM CON_TIPO_COBRO WHERE TICO_TIPO_COBRO = :id',
            [tipoCobroId]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, tipoCobro: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Tipo de cobro no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar el tipo de cobro' });
    }
});

// Insertar un nuevo tipo de cobro
router.post('/', async (req, res) => {
    const { TICO_NOMBRE, TICO_DESCRIPCION } = req.body;
    if (!TICO_NOMBRE) {
        return res.status(400).json({ success: false, message: 'El nombre del tipo de cobro es obligatorio' });
    }
    try {
        const result = await req.executeQuery(
            'INSERT INTO CON_TIPO_COBRO (TICO_NOMBRE, TICO_DESCRIPCION) VALUES (:nombre, :descripcion)',
            { nombre: TICO_NOMBRE, descripcion: TICO_DESCRIPCION || null }
        );
        res.status(201).json({ success: true, message: 'Tipo de cobro creado correctamente', insertedId: result.lastRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al crear el tipo de cobro' });
    }
});

// Actualizar un tipo de cobro existente
router.put('/:id', async (req, res) => {
    const tipoCobroId = req.params.id;
    const { TICO_NOMBRE, TICO_DESCRIPCION } = req.body;
    if (!TICO_NOMBRE) {
        return res.status(400).json({ success: false, message: 'El nombre del tipo de cobro es obligatorio' });
    }
    try {
        const result = await req.executeQuery(
            'UPDATE CON_TIPO_COBRO SET TICO_NOMBRE = :nombre, TICO_DESCRIPCION = :descripcion WHERE TICO_TIPO_COBRO = :id',
            { nombre: TICO_NOMBRE, descripcion: TICO_DESCRIPCION || null, id: tipoCobroId }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Tipo de cobro actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Tipo de cobro no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar el tipo de cobro' });
    }
});

// Eliminar un tipo de cobro por su ID
router.delete('/:id', async (req, res) => {
    const tipoCobroId = req.params.id;
    try {
        const result = await req.executeQuery(
            'DELETE FROM CON_TIPO_COBRO WHERE TICO_TIPO_COBRO = :id',
            [tipoCobroId]
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Tipo de cobro eliminado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Tipo de cobro no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar el tipo de cobro' });
    }
});

module.exports = router;