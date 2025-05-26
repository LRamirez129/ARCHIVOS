// Backend/crudtablas/crudpago.js
const express = require('express');
const router = express.Router();

// Rutas CRUD para Pagos (CON_PAGO)

// Obtener todos los pagos
router.get('/', async (req, res) => {
    try {
        const result = await req.executeQuery(`
            SELECT
                PAG_PAGO,
                CUO_CUOTA,
                FOPA_FORMA_PAGO,
                TO_CHAR(PAG_FECHA_PAGO, 'YYYY-MM-DD') AS PAG_FECHA_PAGO,
                PAG_MONTO,
                PAG_REFERENCIA_PAGO
            FROM CON_PAGO
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error al obtener los pagos" });
    }
});

// Obtener un pago por su ID
router.get('/:id', async (req, res) => {
    const pagoId = req.params.id;
    try {
        const result = await req.executeQuery(`
            SELECT
                PAG_PAGO,
                CUO_CUOTA,
                FOPA_FORMA_PAGO,
                TO_CHAR(PAG_FECHA_PAGO, 'YYYY-MM-DD') AS PAG_FECHA_PAGO,
                PAG_MONTO,
                PAG_REFERENCIA_PAGO
            FROM CON_PAGO
            WHERE PAG_PAGO = :id
        `, [pagoId]);
        if (result.rows.length > 0) {
            res.json({ success: true, pago: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Pago no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al buscar el pago' });
    }
});

// Insertar un nuevo pago
router.post('/', async (req, res) => {
    const { CUO_CUOTA, FOPA_FORMA_PAGO, PAG_FECHA_PAGO, PAG_MONTO, PAG_REFERENCIA_PAGO } = req.body;
    if (!CUO_CUOTA || !FOPA_FORMA_PAGO || !PAG_MONTO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para el pago' });
    }
    try {
        const result = await req.executeQuery(
            `
            INSERT INTO CON_PAGO (CUO_CUOTA, FOPA_FORMA_PAGO, PAG_FECHA_PAGO, PAG_MONTO, PAG_REFERENCIA_PAGO)
            VALUES (:cuota, :formaPago, TO_DATE(:fechaPago, 'YYYY-MM-DD'), :monto, :referencia)
            `,
            {
                cuota: CUO_CUOTA,
                formaPago: FOPA_FORMA_PAGO,
                fechaPago: PAG_FECHA_PAGO || null,
                monto: PAG_MONTO,
                referencia: PAG_REFERENCIA_PAGO || null
            }
        );
        res.status(201).json({ success: true, message: 'Pago registrado correctamente', insertedId: result.lastRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al registrar el pago' });
    }
});

// Actualizar un pago existente
router.put('/:id', async (req, res) => {
    const pagoId = req.params.id;
    const { CUO_CUOTA, FOPA_FORMA_PAGO, PAG_FECHA_PAGO, PAG_MONTO, PAG_REFERENCIA_PAGO } = req.body;
    if (!CUO_CUOTA || !FOPA_FORMA_PAGO || !PAG_MONTO) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para actualizar el pago' });
    }
    try {
        const result = await req.executeQuery(
            `
            UPDATE CON_PAGO
            SET
                CUO_CUOTA = :cuota,
                FOPA_FORMA_PAGO = :formaPago,
                PAG_FECHA_PAGO = TO_DATE(:fechaPago, 'YYYY-MM-DD'),
                PAG_MONTO = :monto,
                PAG_REFERENCIA_PAGO = :referencia
            WHERE PAG_PAGO = :id
            `,
            {
                cuota: CUO_CUOTA,
                formaPago: FOPA_FORMA_PAGO,
                fechaPago: PAG_FECHA_PAGO || null,
                monto: PAG_MONTO,
                referencia: PAG_REFERENCIA_PAGO || null,
                id: pagoId
            }
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Pago actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Pago no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar el pago' });
    }
});

// Eliminar un pago por su ID
router.delete('/:id', async (req, res) => {
    const pagoId = req.params.id;
    try {
        const result = await req.executeQuery(
            'DELETE FROM CON_PAGO WHERE PAG_PAGO = :id',
            [pagoId]
        );
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Pago eliminado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Pago no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar el pago' });
    }
});

module.exports = router;