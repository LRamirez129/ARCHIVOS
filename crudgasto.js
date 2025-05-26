// Backend/crudtablas/crudgasto.js
const oracledb = require('oracledb');
const express = require('express');
const router = express.Router();

// Rutas CRUD para Gastos (CON_GASTO)

// Obtener todos los gastos
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery(`
            SELECT
                GAS_GASTO,
                CON_CONDOMINIO,
                GAS_DESCRIPCION,
                GAS_MONTO,
                TO_CHAR(GAS_FECHA, 'YYYY-MM-DD') AS GAS_FECHA,
                GAS_TIPO_GASTO
            FROM CON_GASTO
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener los gastos" });
    }
});

// Obtener un gasto por su ID
router.get('/:id', async (req, res) => {
    const gastoId = req.params.id;
    try {
        const result = await req.executeQuery(`
            SELECT
                GAS_GASTO,
                CON_CONDOMINIO,
                GAS_DESCRIPCION,
                GAS_MONTO,
                TO_CHAR(GAS_FECHA, 'YYYY-MM-DD') AS GAS_FECHA,
                GAS_TIPO_GASTO
            FROM CON_GASTO
            WHERE GAS_GASTO = :id
        `, [gastoId]);
        if (result.rows.length > 0) {
            res.json({ success: true, gasto: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Gasto no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar el gasto' });
    }
});

// Insertar un nuevo gasto
router.post('/', async (req, res) => {
    const { CON_CONDOMINIO, GAS_DESCRIPCION, GAS_MONTO, GAS_FECHA, GAS_TIPO_GASTO } = req.body;
    if (!CON_CONDOMINIO || !GAS_DESCRIPCION || !GAS_MONTO || !GAS_FECHA) {
        return res.status(400).json({ success: false, message: 'Los campos CON_CONDOMINIO, GAS_DESCRIPCION, GAS_MONTO y GAS_FECHA son obligatorios' });
    }
    try {
        const result = await req.executeQuery(
            `
            INSERT INTO CON_GASTO (CON_CONDOMINIO, GAS_DESCRIPCION, GAS_MONTO, GAS_FECHA, GAS_TIPO_GASTO)
            VALUES (:condominioId, :descripcion, :monto, TO_DATE(:fecha, 'YYYY-MM-DD'), :tipoGasto)
            `,
            {
                condominioId: CON_CONDOMINIO,
                descripcion: GAS_DESCRIPCION,
                monto: GAS_MONTO,
                fecha: GAS_FECHA,
                tipoGasto: GAS_TIPO_GASTO || null
            },
            { autoCommit: true, bindDefs: [ { type: oracledb.NUMBER }, { type: oracledb.STRING }, { type: oracledb.NUMBER }, { type: oracledb.STRING }, { type: oracledb.STRING } ] } // Especifica los tipos de datos
        );
        res.status(201).json({ success: true, message: 'Gasto creado correctamente', insertedId: result.lastRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al crear el gasto' });
    }
});

// Actualizar un gasto existente
router.put('/:id', async (req, res) => {
    const gastoId = req.params.id;
    const { CON_CONDOMINIO, GAS_DESCRIPCION, GAS_MONTO, GAS_FECHA, GAS_TIPO_GASTO } = req.body;
    if (!CON_CONDOMINIO || !GAS_DESCRIPCION || !GAS_MONTO || !GAS_FECHA) {
        return res.status(400).json({ success: false, message: 'Los campos CON_CONDOMINIO, GAS_DESCRIPCION, GAS_MONTO y GAS_FECHA son obligatorios para actualizar' });
    }
    try {
        const result = await req.executeQuery(
            `
            UPDATE CON_GASTO
            SET
                CON_CONDOMINIO = :condominioId,
                GAS_DESCRIPCION = :descripcion,
                GAS_MONTO = :monto,
                GAS_FECHA = TO_DATE(:fecha, 'YYYY-MM-DD'),
                GAS_TIPO_GASTO = :tipoGasto
            WHERE GAS_GASTO = :id
            `,
            {
                condominioId: CON_CONDOMINIO,
                descripcion: GAS_DESCRIPCION,
                monto: GAS_MONTO,
                fecha: GAS_FECHA,
                tipoGasto: GAS_TIPO_GASTO || null,
                id: gastoId
            },
            { autoCommit: true }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Gasto actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Gasto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar el gasto' });
    }
});

// Eliminar un gasto por su ID
router.delete('/:id', async (req, res) => {
    const gastoId = req.params.id;
    try {
        const result = await req.executeQuery(
            'DELETE FROM CON_GASTO WHERE GAS_GASTO = :id',
            [gastoId],
            { autoCommit: true }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Gasto eliminado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Gasto no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar el gasto' });
    }
});

module.exports = router;