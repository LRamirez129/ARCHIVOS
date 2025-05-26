const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Middleware para ejecutar consultas (asegúrate de que este middleware está correctamente configurado
// en tu 'servidor.js' para inyectar la función executeQuery en req)
const withQueryExecutor = (req, res, next) => {
    if (!req.executeQuery) {
        console.error("Error: req.executeQuery no está definido. Asegúrate de que el middleware con el pool de conexión se ejecuta antes en servidor.js.");
        return res.status(500).json({ message: "Error interno del servidor: no se pudo establecer la conexión a la base de datos." });
    }
    next();
};

router.get('/', withQueryExecutor, async (req, res) => {
    const { year, monthDesde, monthHasta } = req.query;

    if (!year || !monthDesde || !monthHasta) {
        return res.status(400).json({ message: 'Parámetros de fecha (year, monthDesde, monthHasta) son requeridos.' });
    }

    const parsedYear = parseInt(year);
    const parsedMonthDesde = parseInt(monthDesde);
    const parsedMonthHasta = parseInt(monthHasta);

    if (isNaN(parsedYear) || isNaN(parsedMonthDesde) || isNaN(parsedMonthHasta) ||
        parsedMonthDesde < 1 || parsedMonthDesde > 12 ||
        parsedMonthHasta < 1 || parsedMonthHasta > 12) {
        return res.status(400).json({ message: 'Parámetros de fecha inválidos.' });
    }

    if (parsedMonthDesde > parsedMonthHasta) {
        return res.status(400).json({ message: 'El mes de inicio no puede ser posterior al mes de fin.' });
    }

    try {
        const queryExecutor = req.executeQuery;

        // Generar nombres de meses para las columnas dinámicas (Ene, Feb, Mar, etc.)
        const monthNames = [];
        const monthShortNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        for (let m = parsedMonthDesde; m <= parsedMonthHasta; m++) {
            monthNames.push(monthShortNames[m - 1]);
        }

        // --- Consulta para INGRESOS detallados por Tipo de Cobro ---
        const ingresosQuery = `
            SELECT
                TC.TICO_NOMBRE AS RUBRO,
                TO_CHAR(P.PAG_FECHA_PAGO, 'Mon', 'NLS_DATE_LANGUAGE=SPANISH') AS MES,
                SUM(P.PAG_MONTO) AS MONTO
            FROM
                CON_PAGO P
            JOIN
                CON_CUOTA C ON P.CUO_CUOTA = C.CUO_CUOTA
            JOIN
                CON_TIPO_COBRO TC ON C.TICO_TIPO_COBRO = TC.TICO_TIPO_COBRO
            WHERE
                EXTRACT(YEAR FROM P.PAG_FECHA_PAGO) = :year AND
                EXTRACT(MONTH FROM P.PAG_FECHA_PAGO) BETWEEN :monthDesde AND :monthHasta
            GROUP BY
                TC.TICO_NOMBRE, TO_CHAR(P.PAG_FECHA_PAGO, 'Mon', 'NLS_DATE_LANGUAGE=SPANISH'), EXTRACT(MONTH FROM P.PAG_FECHA_PAGO)
            ORDER BY
                TC.TICO_NOMBRE, EXTRACT(MONTH FROM P.PAG_FECHA_PAGO)
        `;
        const ingresosResult = await queryExecutor(ingresosQuery, [parsedYear, parsedMonthDesde, parsedMonthHasta]);
        const ingresosData = ingresosResult.rows;
        

        // --- Consulta para EGRESOS detallados por Tipo de Gasto ---
        const egresosQuery = `
            SELECT
                G.GAS_TIPO_GASTO AS RUBRO,
                TO_CHAR(G.GAS_FECHA, 'Mon', 'NLS_DATE_LANGUAGE=SPANISH') AS MES,
                SUM(G.GAS_MONTO) AS MONTO
            FROM
                CON_GASTO G
            WHERE
                EXTRACT(YEAR FROM G.GAS_FECHA) = :year AND
                EXTRACT(MONTH FROM G.GAS_FECHA) BETWEEN :monthDesde AND :monthHasta
            GROUP BY
                G.GAS_TIPO_GASTO, TO_CHAR(G.GAS_FECHA, 'Mon', 'NLS_DATE_LANGUAGE=SPANISH'), EXTRACT(MONTH FROM G.GAS_FECHA)
            ORDER BY
                G.GAS_TIPO_GASTO, EXTRACT(MONTH FROM G.GAS_FECHA)
        `;
        const egresosResult = await queryExecutor(egresosQuery, [parsedYear, parsedMonthDesde, parsedMonthHasta]);
        const egresosData = egresosResult.rows;
    

        // --- Procesar datos para el formato del reporte ---
        const processedIngresos = processDetailedData(ingresosData, monthNames);
        const processedEgresos = processDetailedData(egresosData, monthNames);

        // Calcular totales
        const totalIngresos = processedIngresos.reduce((sum, item) => sum + item.total, 0);
        const totalEgresos = processedEgresos.reduce((sum, item) => sum + item.total, 0);
        const balanceNeto = totalIngresos - totalEgresos;

        res.json({
            mesesReporte: monthNames,
            ingresos: processedIngresos,
            egresos: processedEgresos,
            totalIngresos,
            totalEgresos,
            balanceNeto
        });

    } catch (err) {
        console.error('Error al generar reporte de ingresos/egresos detallado:', err);
        res.status(500).json({ message: 'Error interno del servidor al generar el reporte.', details: err.message });
    }
});


// Función auxiliar para procesar los datos de la base de datos a un formato adecuado para el frontend
// Esta versión usa índices numéricos para acceder a los datos de la fila (row[0], row[1], row[2])
// porque oracledb devuelve arrays por defecto si outFormat no se especifica.
function processDetailedData(rawData, monthNames) {
    const groupedData = {};

    rawData.forEach(row => {
        // ACCEDEMOS A LAS PROPIEDADES POR ÍNDICE NUMÉRICO:
        // row[0] es el RUBRO (ej. 'Jardineria')
        // row[1] es el MES (ej. 'Ene')
        // row[2] es el MONTO (ej. 4000)
        const rubro = row[0];
        const mes = row[1];
        const monto = parseFloat(row[2] || 0); // Asegurar que es un número, por si viene null/undefined

        // Solo procesar si rubro y mes son válidos (no undefined)
        if (rubro === undefined || mes === undefined) {
            console.warn('Advertencia: Fila con rubro o mes indefinido (por índice), saltando procesamiento:', row);
            return; // Saltar esta fila si falta información clave
        }

        if (!groupedData[rubro]) {
            groupedData[rubro] = { rubro: rubro, total: 0 };
            monthNames.forEach(month => {
                // Asegura que cada mes del rango tenga una entrada, incluso si es 0
                groupedData[rubro][month] = 0;
            });
        }
        groupedData[rubro][mes] += monto;
        groupedData[rubro].total += monto;
    });

    // Convertir el objeto agrupado a un array de objetos para el frontend
    return Object.values(groupedData);
}

module.exports = router;