//Frontend/componentes/CalculosResidencia.js
import React, { useState } from 'react';
import IngresosPorResidencia from './IngresosPorResidencia';
import SaldoPendientePorResidencia from './SaldoPendientePorResidencia';

function ReportesResidencia() {
  const [vistaReporte, setVistaReporte] = useState(null);

  const renderReporte = () => {
    switch (vistaReporte) {
      case 'ingresos':
        return <IngresosPorResidencia />;
      case 'saldoPendiente':
        return <SaldoPendientePorResidencia />;
      default:
        return <div>Selecciona un calculo para ver.</div>;
    }
  };

  return (
    <div className="container mt-4">
      <h2>Calculos de Residencia</h2>
      <div className="btn-group mb-3" role="group" aria-label="Opciones de reporte">
        <button
          onClick={() => setVistaReporte('ingresos')}
          className="btn btn-info"
        >
          Ingresos por Residencia
        </button>
        <button
          onClick={() => setVistaReporte('saldoPendiente')}
          className="btn btn-warning"
        >
          Saldo Pendiente por Residencia
        </button>
        {vistaReporte && (
          <button
            onClick={() => setVistaReporte(null)}
            className="btn btn-secondary ml-2"
          >
            Volver a Calculos
          </button>
        )}
      </div>

      <div className="mt-3">
        {renderReporte()}
      </div>
    </div>
  );
}

export default ReportesResidencia;

