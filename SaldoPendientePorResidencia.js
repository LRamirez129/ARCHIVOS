//Frontend/componentes/SaldoPendientePorResidencia.js
import React, { useState } from 'react';
import axios from 'axios';

function SaldoPendientePorResidencia() {
  const [residenciaId, setResidenciaId] = useState('');
  const [reporteSaldo, setReporteSaldo] = useState(null);
  const [mensajeError, setMensajeError] = useState('');

  const calcularSaldo = async () => {
    try {
      setReporteSaldo(null);
      setMensajeError('');

      const response = await axios.get(`http://localhost:3002/api/saldo-pendiente-residencia/${residenciaId}`);

      if (response.data.success) {
        setReporteSaldo(response.data);
        console.log(response.data);
      } else {
        setMensajeError(response.data.message || 'Error al calcular saldo pendiente.');
      }
    } catch (error) {
      console.error('Error al llamar a la API:', error);
      setMensajeError('Hubo un error al comunicarse con el servidor.');
    }
  };

  return (
    <div className="container mt-4 align-left-container">
      <h2>Detalle de Saldo Pendiente por Residencia</h2>
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
      <button onClick={calcularSaldo} className="btn btn-primary">Mostrar Detalle de Saldo</button>

      {mensajeError && <div className="alert alert-danger mt-3">{mensajeError}</div>}

      {reporteSaldo && (
        <div className="mt-3">
          <h3>Residencia: {reporteSaldo.nombreResidencia} (ID: {reporteSaldo.residenciaId})</h3>

          <h4>Cuotas Pendientes:</h4>
          {reporteSaldo.cuotasPendientes && reporteSaldo.cuotasPendientes.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID Cuota</th>
                  <th>Tipo de Cobro</th>
                  <th>Monto Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {reporteSaldo.cuotasPendientes.map(cuota => (
                  <tr key={cuota.id}>
                    <td>{cuota.id}</td>
                    <td>{cuota.tipoCobro}</td>
                    <td>${cuota.monto.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay cuotas pendientes.</p>
          )}

          <h4>Multas Pendientes:</h4>
          {reporteSaldo.multasPendientes && reporteSaldo.multasPendientes.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID Multa</th>
                  <th>Descripción</th>
                  <th>Monto Pendiente</th>
                  <th>ID Cuota Asociada</th>
                </tr>
              </thead>
              <tbody>
                {reporteSaldo.multasPendientes.map(multa => (
                  <tr key={multa.id}>
                    <td>{multa.id}</td>
                    <td>{multa.descripcion}</td>
                    <td>${multa.monto.toFixed(2)}</td>
                    <td>{multa.cuotaId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay multas pendientes.</p>
          )}

          <hr />
          <h3>Saldo Pendiente Total: ${reporteSaldo.saldoPendiente.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
}

export default SaldoPendientePorResidencia;