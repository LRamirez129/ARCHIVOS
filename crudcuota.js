// Backend/crudtablas/crudcuota.js
const express = require('express');
const router = express.Router();

// Rutas CRUD para Cuotas (CON_CUOTA)

// Obtener todas las cuotas
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery(`
            SELECT
                CUO_CUOTA,
                RES_RESIDENCIA,
                TICO_TIPO_COBRO,
                CUO_PERIODO,
                CUO_MONTO,
                TO_CHAR(CUO_FECHA_GENERACION, 'YYYY-MM-DD') AS CUO_FECHA_GENERACION,
                CUO_ESTADO,
                TO_CHAR(CUO_FECHA_LIMITE, 'YYYY-MM-DD') AS CUO_FECHA_LIMITE
            FROM CON_CUOTA
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener las cuotas" });
    }
});

// Obtener una cuota por su ID
router.get('/:id', async (req, res) => {
    const cuotaId = req.params.id;
    try {
        const result = await req.executeQuery(`
            SELECT
                CUO_CUOTA,
                RES_RESIDENCIA,
                TICO_TIPO_COBRO,
                CUO_PERIODO,
                CUO_MONTO,
                TO_CHAR(CUO_FECHA_GENERACION, 'YYYY-MM-DD') AS CUO_FECHA_GENERACION,
                CUO_ESTADO,
                TO_CHAR(CUO_FECHA_LIMITE, 'YYYY-MM-DD') AS CUO_FECHA_LIMITE
            FROM CON_CUOTA
            WHERE CUO_CUOTA = :id
        `, [cuotaId]);
        if (result.rows.length > 0) {
            res.json({ success: true, cuota: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Cuota no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar la cuota' });
    }
});

// Insertar una nueva cuota
router.post('/', async (req, res) => {
    const { RES_RESIDENCIA, TICO_TIPO_COBRO, CUO_PERIODO, CUO_MONTO, CUO_FECHA_GENERACION, CUO_ESTADO, CUO_FECHA_LIMITE } = req.body;
    if (!RES_RESIDENCIA || !TICO_TIPO_COBRO || !CUO_PERIODO || !CUO_MONTO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para la cuota' });
    }
    try {
        const result = await req.executeQuery(
            `
            INSERT INTO CON_CUOTA (RES_RESIDENCIA, TICO_TIPO_COBRO, CUO_PERIODO, CUO_MONTO, CUO_FECHA_GENERACION, CUO_ESTADO, CUO_FECHA_LIMITE)
            VALUES (:residencia, :tipoCobro, :periodo, :monto, TO_DATE(:fechaGeneracion, 'YYYY-MM-DD'), :estado, TO_DATE(:fechaLimite, 'YYYY-MM-DD'))
            `,
            {
                residencia: RES_RESIDENCIA,
                tipoCobro: TICO_TIPO_COBRO,
                periodo: CUO_PERIODO,
                monto: CUO_MONTO,
                fechaGeneracion: CUO_FECHA_GENERACION || null,
                estado: CUO_ESTADO || 'Pendiente',
                fechaLimite: CUO_FECHA_LIMITE || null
            }
        );
        res.status(201).json({ success: true, message: 'Cuota creada correctamente', insertedId: result.lastRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al crear la cuota' });
    }
});

// Actualizar una cuota existente
router.put('/:id', async (req, res) => {
    const cuotaId = req.params.id;
    const { RES_RESIDENCIA, TICO_TIPO_COBRO, CUO_PERIODO, CUO_MONTO, CUO_FECHA_GENERACION, CUO_ESTADO, CUO_FECHA_LIMITE } = req.body;
    if (!RES_RESIDENCIA || !TICO_TIPO_COBRO || !CUO_PERIODO || !CUO_MONTO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para actualizar la cuota' });
    }
    try {
        const result = await req.executeQuery(
            `
            UPDATE CON_CUOTA
            SET
                RES_RESIDENCIA = :residencia,
                TICO_TIPO_COBRO = :tipoCobro,
                CUO_PERIODO = :periodo,
                CUO_MONTO = :monto,
                CUO_FECHA_GENERACION = TO_DATE(:fechaGeneracion, 'YYYY-MM-DD'),
                CUO_ESTADO = :estado,
                CUO_FECHA_LIMITE = TO_DATE(:fechaLimite, 'YYYY-MM-DD')
            WHERE CUO_CUOTA = :id
            `,
            {
                residencia: RES_RESIDENCIA,
                tipoCobro: TICO_TIPO_COBRO,
                periodo: CUO_PERIODO,
                monto: CUO_MONTO,
                fechaGeneracion: CUO_FECHA_GENERACION || null,
                estado: CUO_ESTADO || 'Pendiente',
                fechaLimite: CUO_FECHA_LIMITE || null,
                id: cuotaId
            }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Cuota actualizada correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Cuota no encontrada' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar la cuota' });
    }
});

// Eliminar una cuota por su ID
router.delete('/:id', async (req, res) => {
    const cuotaId = req.params.id;
    try {
        const result = await req.executeQuery(
            'DELETE FROM CON_CUOTA WHERE CUO_CUOTA = :id',
            [cuotaId]
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Cuota eliminada correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Cuota no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar la cuota' });
    }
});

module.exports = router;