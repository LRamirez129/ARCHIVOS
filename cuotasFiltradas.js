const express = require('express');
const router = express.Router();

router.get('/pendientes/residencia/:residenciaId', async (req, res) => {
    const residenciaId = req.params.residenciaId;
    try {
        const resultPendientes = await req.executeQuery(`
            SELECT
                CUO_CUOTA,
                TICO_TIPO_COBRO,
                CUO_PERIODO,
                CUO_MONTO,
                TO_CHAR(CUO_FECHA_LIMITE, 'YYYY-MM-DD') AS CUO_FECHA_LIMITE
            FROM CON_CUOTA
            WHERE RES_RESIDENCIA = :residenciaId
            AND CUO_ESTADO = 'Pendiente'
        `, [residenciaId]);

        const resultVencidas = await req.executeQuery(`
            SELECT SUM(CUO_MONTO) AS total_vencido
            FROM CON_CUOTA
            WHERE RES_RESIDENCIA = :residenciaId
            AND CUO_ESTADO = 'Vencida'
        `, [residenciaId]);

        res.json({
            success: true,
            pendientes: resultPendientes.rows,
            totalVencido: resultVencidas.rows[0]?.TOTAL_VENCIDO || 0
        });
    } catch (err) {
        console.error('Error al filtrar cuotas por residencia:', err);
        res.status(500).json({ success: false, message: 'Error al filtrar las cuotas' });
    }
});

module.exports = router;