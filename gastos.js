// Backend/reportes/gastos.js
const express = require('express');
const router = express.Router();

// Asegúrate de que el middleware `withQueryExecutor` está configurado en `servidor.js`
// para inyectar `req.executeQuery`
const withQueryExecutor = (req, res, next) => {
    if (!req.executeQuery) {
        console.error("Error: req.executeQuery no está definido. Asegúrate de que el middleware con el pool de conexión se ejecuta antes en servidor.js.");
        return res.status(500).json({ message: "Error interno del servidor: no se pudo establecer la conexión a la base de datos." });
    }
    next();
};

// Ruta para obtener los tipos de gasto (para el filtro del frontend)
// Ahora selecciona los tipos de gasto directamente de la columna GAS_TIPO_GASTO
router.get('/tipos-gasto', withQueryExecutor, async (req, res) => {
    try {
        const queryExecutor = req.executeQuery;
        // Selecciona los tipos de gasto únicos directamente de la tabla CON_GASTO
        // Asume que GAS_TIPO_GASTO es un VARCHAR2 con los nombres de los tipos.
        const result = await queryExecutor('SELECT DISTINCT GAS_TIPO_GASTO FROM CON_GASTO WHERE GAS_TIPO_GASTO IS NOT NULL ORDER BY GAS_TIPO_GASTO ASC');
        // Mapea los resultados para que el 'id' y 'nombre' sean el mismo valor (el nombre del tipo de gasto)
        res.json(result.rows.map(row => ({
            id: row[0], // Usamos el nombre del tipo de gasto como ID también
            nombre: row[0]
        })));
    } catch (err) {
        console.error('Error al obtener tipos de gasto:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener tipos de gasto.', details: err.message });
    }
});


// Ruta principal para el reporte de gastos
router.get('/', withQueryExecutor, async (req, res) => {
    const { yearDesde, monthDesde, yearHasta, monthHasta, tipoGastoId, nombreProveedor } = req.query;

    // Validación de parámetros de fecha
    const pYearDesde = parseInt(yearDesde);
    const pMonthDesde = parseInt(monthDesde);
    const pYearHasta = parseInt(yearHasta);
    const pMonthHasta = parseInt(monthHasta);

    if (isNaN(pYearDesde) || isNaN(pMonthDesde) || isNaN(pYearHasta) || isNaN(pMonthHasta) ||
        pMonthDesde < 1 || pMonthDesde > 12 || pMonthHasta < 1 || pMonthHasta > 12) {
        return res.status(400).json({ message: 'Parámetros de fecha inválidos.' });
    }

    if (pYearDesde > pYearHasta || (pYearDesde === pYearHasta && pMonthDesde > pMonthHasta)) {
        return res.status(400).json({ message: 'El rango de fechas no es válido. La fecha "Desde" no puede ser posterior a la fecha "Hasta".' });
    }

    let query = `
        SELECT
            TO_CHAR(G.GAS_FECHA, 'DD-MON-YYYY', 'NLS_DATE_LANGUAGE=SPANISH') AS FECHA_GASTO,
            G.GAS_TIPO_GASTO AS TIPO_GASTO, -- Directamente desde CON_GASTO
            G.GAS_DESCRIPCION AS CONCEPTO,
            G.GAS_MONTO AS MONTO,
            P.PRO_NOMBRE AS PROVEEDOR_NOMBRE,
            P.PRO_NIT AS PROVEEDOR_NIT
        FROM
            CON_GASTO G
        JOIN
            CON_PROVEEDOR P ON G.PRO_PROVEEDOR = P.PRO_PROVEEDOR
        WHERE
            EXTRACT(YEAR FROM G.GAS_FECHA) BETWEEN :1 AND :2
            AND EXTRACT(MONTH FROM G.GAS_FECHA) BETWEEN :3 AND :4
    `;

    const binds = [pYearDesde, pYearHasta, pMonthDesde, pMonthHasta];
    let bindCounter = 5; // Empezar el contador de binds después de los parámetros de fecha

    // Filtro por Tipo de Gasto (si se proporciona)
    if (tipoGastoId) {
        // Ahora tipoGastoId es el nombre del tipo de gasto (VARCHAR2)
        query += ` AND UPPER(G.GAS_TIPO_GASTO) = UPPER(:${bindCounter})`;
        binds.push(tipoGastoId);
        bindCounter++;
    }

    // Filtro por Nombre de Proveedor (si se proporciona)
    if (nombreProveedor) {
        query += ` AND UPPER(P.PRO_NOMBRE) LIKE '%' || UPPER(:${bindCounter}) || '%'`;
        binds.push(nombreProveedor);
        bindCounter++;
    }

    query += ` ORDER BY G.GAS_FECHA ASC, G.GAS_TIPO_GASTO ASC`;

    try {
        const queryExecutor = req.executeQuery;
        const result = await queryExecutor(query, binds);
        const gastos = result.rows.map(row => ({
            fechaGasto: row[0],
            tipoGasto: row[1],
            concepto: row[2],
            monto: parseFloat(row[3] || 0),
            proveedorNombre: row[4],
            proveedorNit: row[5]
        }));

        const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

        res.json({
            gastos,
            totalGastos
        });

    } catch (err) {
        console.error('Error al generar reporte de gastos:', err);
        res.status(500).json({ message: 'Error interno del servidor al generar el reporte de gastos.', details: err.message });
    }
});

module.exports = router;