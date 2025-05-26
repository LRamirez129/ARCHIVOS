import React, { useState, useEffect } from 'react';
import axios from 'axios';

function IngresosPorResidencia() {
  const [residenciaId, setResidenciaId] = useState('');
  const [reporteIngresos, setReporteIngresos] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [totalIngresos, setTotalIngresos] = useState(0);

  const calcularIngresos = async () => {
    try {
      setReporteIngresos(null);
      setMensajeError('');
      setTotalIngresos(0);

      const url = `http://localhost:3002/api/ingresos-por-residencia/${residenciaId}`;
      const response = await axios.get(url);

      if (response.data.success) {
        setReporteIngresos(response.data.ingresos);
      } else {
        setMensajeError(response.data.message || 'Error al calcular ingresos.');
      }
    } catch (error) {
      console.error('Error al llamar a la API:', error);
      setMensajeError('Hubo un error al comunicarse con el servidor.');
    }
  };

  useEffect(() => {
    if (reporteIngresos && reporteIngresos.length > 0) {
      const sumaTotal = reporteIngresos.reduce((sum, pago) => sum + pago.monto, 0);
      setTotalIngresos(sumaTotal);
    } else {
      setTotalIngresos(0);
    }
  }, [reporteIngresos]);

  return (
    <div className="container mt-4">
      <h2>Detalle de Ingresos por Residencia</h2>
      <div className="form-group">
        <label htmlFor="residenciaId">ID de Residencia:</label>
        <input
          type="number"
          className="form-control"
          id="residenciaId"
          value={residenciaId}
          onChange={(e) => setResidenciaId(e.target.value)}
          required
        />
      </div>
      <button onClick={calcularIngresos} className="btn btn-primary">Calcular Ingresos</button>

      {mensajeError && <div className="alert alert-danger mt-3">{mensajeError}</div>}

      {reporteIngresos && reporteIngresos.length > 0 ? (
        <div className="mt-3">
          <h3>Detalles de Ingresos para Residencia (ID: {residenciaId})</h3>
          <table className="table">
            <thead>
              <tr>
                <th>ID Cuota</th>
                <th>Tipo de Cobro</th>
                <th>Tipo de Pago</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {reporteIngresos.map(pago => (
                <tr key={`${pago.idCuota}-${pago.monto}`}>
                  <td>{pago.idCuota}</td>
                  <td>{pago.tipoCobro}</td>
                  <td>{pago.tipoPago}</td>
                  <td>${pago.monto.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="table-success">
                <td colSpan="3" className="text-end"><strong>Total Ingresos:</strong></td>
                <td><strong>${totalIngresos.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : reporteIngresos !== null && (
        <div className="alert alert-info mt-3">
          No se encontraron ingresos para la residencia {residenciaId}.
        </div>
      )}
    </div>
  );
}

export default IngresosPorResidencia;