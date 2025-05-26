// Backend/control/controladoresresidencia.js
const calcularIngresosPorResidencia = async (req, res) => {
  const { residenciaId } = req.params;

  try {
    const query = `
      SELECT
        c.CUO_CUOTA AS idCuota,
        tc.TICO_NOMBRE AS tipoCobroNombre,
        fp.FOPA_NOMBRE AS tipoPagoNombre,
        p.PAG_MONTO AS montoPago
      FROM CON_PAGO p
      JOIN CON_CUOTA c ON p.CUO_CUOTA = c.CUO_CUOTA
      JOIN CON_TIPO_COBRO tc ON c.TICO_TIPO_COBRO = tc.TICO_TIPO_COBRO
      JOIN CON_FORMA_PAGO fp ON p.FOPA_FORMA_PAGO = fp.FOPA_FORMA_PAGO
      WHERE c.RES_RESIDENCIA = :residenciaId
      ORDER BY p.PAG_FECHA_PAGO
    `;
    const params = { residenciaId };

    const result = await req.executeQuery(query, params);
    const detallesPagos = result.rows.map(row => ({
      idCuota: row[0],
      tipoCobro: row[1],
      tipoPago: row[2],
      monto: row[3],
    }));

    res.json({ success: true, ingresos: detallesPagos });

  } catch (error) {
    console.error('Error al obtener detalles de pagos por residencia (Oracle):', error);
    res.status(500).json({ success: false, message: 'Error al obtener detalles de pagos.' });
  }
};

const calcularSaldoPendientePorResidencia = async (req, res) => {
  const { residenciaId } = req.params;

  try {
    // Obtener el nombre de la residencia
    const residenciaResult = await req.executeQuery(
      `SELECT RES_NOMBRE, RES_RESIDENCIA FROM CON_RESIDENCIA WHERE RES_RESIDENCIA = :residenciaId`,
      { residenciaId }
    );
    const nombreResidencia = residenciaResult.rows[0]?.[0] || 'Residencia Desconocida';
    const resId = residenciaResult.rows[0]?.[1] || parseInt(residenciaId);

    // Obtener las cuotas pendientes con su tipo de cobro
    const cuotasPendientesResult = await req.executeQuery(
      `
      SELECT c.CUO_CUOTA, tc.TICO_NOMBRE AS tipoCobroNombre, c.CUO_MONTO
      FROM CON_CUOTA c
      JOIN CON_TIPO_COBRO tc ON c.TICO_TIPO_COBRO = tc.TICO_TIPO_COBRO
      WHERE c.RES_RESIDENCIA = :residenciaId AND c.CUO_ESTADO = 'Pendiente'
      `,
      { residenciaId }
    );
    const cuotasPendientes = cuotasPendientesResult.rows.map(row => ({
      id: row[0],
      tipoCobro: row[1],
      monto: row[2],
    }));

    // Obtener las multas pendientes asociadas a las cuotas de esta residencia
    const multasPendientesResult = await req.executeQuery(
      `
      SELECT m.MUL_MULTA, m.MUL_DESCRIPCION, m.MUL_MONTO, c.CUO_CUOTA
      FROM CON_MULTA m
      JOIN CON_CUOTA c ON m.CUO_CUOTA = c.CUO_CUOTA
      WHERE c.RES_RESIDENCIA = :residenciaId AND m.MUL_ESTADO = 'Pendiente'
      `,
      { residenciaId }
    );
    const multasPendientes = multasPendientesResult.rows.map(row => ({
      id: row[0],
      descripcion: row[1],
      monto: row[2],
      cuotaId: row[3],
    }));

    // Calcular el saldo total pendiente
    const saldoTotalPendiente =
      cuotasPendientes.reduce((sum, cuota) => sum + cuota.monto, 0) +
      multasPendientes.reduce((sum, multa) => sum + multa.monto, 0);

    res.json({
      success: true,
      residenciaId: resId,
      nombreResidencia: nombreResidencia,
      cuotasPendientes: cuotasPendientes,
      multasPendientes: multasPendientes,
      saldoPendiente: saldoTotalPendiente,
    });

  } catch (error) {
    console.error('Error al calcular saldo pendiente detallado (Oracle):', error);
    res.status(500).json({ success: false, message: 'Error al calcular saldo pendiente detallado.' });
  }
};


module.exports = {
  calcularIngresosPorResidencia: calcularIngresosPorResidencia,
  calcularSaldoPendientePorResidencia: calcularSaldoPendientePorResidencia,
};
