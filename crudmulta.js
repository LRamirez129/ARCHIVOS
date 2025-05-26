const express = require('express');
const router = express.Router();

// Rutas CRUD para Multas (CON_MULTA)

// Obtener todas las multas
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery(`
            SELECT
                MUL_MULTA,
                CUO_CUOTA,
                MUL_DESCRIPCION,
                MUL_MONTO,
                TO_CHAR(MUL_FECHA_GENERACION, 'YYYY-MM-DD') AS MUL_FECHA_GENERACION,
                MUL_ESTADO
            FROM CON_MULTA
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener las multas" });
    }
});

// Obtener una multa por su ID
router.get('/:id', async (req, res) => {
    const multaId = req.params.id;
    try {
        const result = await req.executeQuery(`
            SELECT
                MUL_MULTA,
                CUO_CUOTA,
                MUL_DESCRIPCION,
                MUL_MONTO,
                TO_CHAR(MUL_FECHA_GENERACION, 'YYYY-MM-DD') AS MUL_FECHA_GENERACION,
                MUL_ESTADO
            FROM CON_MULTA
            WHERE MUL_MULTA = :id
        `, [multaId]);
        if (result.rows.length > 0) {
            res.json({ success: true, multa: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Multa no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar la multa' });
    }
});

// Insertar una nueva multa
router.post('/', async (req, res) => {
    const { CUO_CUOTA, MUL_DESCRIPCION, MUL_MONTO, MUL_FECHA_GENERACION, MUL_ESTADO } = req.body;
    if (!CUO_CUOTA || !MUL_DESCRIPCION || !MUL_MONTO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para la multa' });
    }
    try {
        const result = await req.executeQuery(
            `
            INSERT INTO CON_MULTA (CUO_CUOTA, MUL_DESCRIPCION, MUL_MONTO, MUL_FECHA_GENERACION, MUL_ESTADO)
            VALUES (:cuota, :descripcion, :monto, TO_DATE(:fechaGeneracion, 'YYYY-MM-DD'), :estado)
            `,
            {
                cuota: CUO_CUOTA,
                descripcion: MUL_DESCRIPCION,
                monto: MUL_MONTO,
                fechaGeneracion: MUL_FECHA_GENERACION || null,
                estado: MUL_ESTADO || 'Pendiente'
            }
        );
        res.status(201).json({ success: true, message: 'Multa creada correctamente', insertedId: result.lastRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al crear la multa' });
    }
});

// Actualizar una multa existente
router.put('/:id', async (req, res) => {
    const multaId = req.params.id;
    const { CUO_CUOTA, MUL_DESCRIPCION, MUL_MONTO, MUL_FECHA_GENERACION, MUL_ESTADO } = req.body;
    if (!CUO_CUOTA || !MUL_DESCRIPCION || !MUL_MONTO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para actualizar la multa' });
    }
    try {
        const result = await req.executeQuery(
            `
            UPDATE CON_MULTA
            SET
                CUO_CUOTA = :cuota,
                MUL_DESCRIPCION = :descripcion,
                MUL_MONTO = :monto,
                MUL_FECHA_GENERACION = TO_DATE(:fechaGeneracion, 'YYYY-MM-DD'),
                MUL_ESTADO = :estado
            WHERE MUL_MULTA = :id
            `,
            {
                cuota: CUO_CUOTA,
                descripcion: MUL_DESCRIPCION,
                monto: MUL_MONTO,
                fechaGeneracion: MUL_FECHA_GENERACION || null,
                estado: MUL_ESTADO || 'Pendiente',
                id: multaId
            }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Multa actualizada correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Multa no encontrada' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar la multa' });
    }
});

// Eliminar una multa por su ID
router.delete('/:id', async (req, res) => {
    const multaId = req.params.id;
    try {
        const result = await req.executeQuery(
            'DELETE FROM CON_MULTA WHERE MUL_MULTA = :id',
            [multaId]
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Multa eliminada correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Multa no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar la multa' });
    }
});

module.exports = router;