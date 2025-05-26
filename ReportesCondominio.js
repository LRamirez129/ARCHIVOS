import React, { useState } from 'react';
import ReporteIngresosEgresos from '../reporteria/ReporteIngresosEgresos'; // Ajusta la ruta si es necesario
import ReporteGastos from '../reporteria/ReporteGastos'; 

// Puedes añadir estilos aquí o usar CSS Modules/global CSS
const cardContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px', // Espacio entre las tarjetas
    justifyContent: 'center', // Centrar las tarjetas
    padding: '20px'
};

const cardStyle = {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '300px', // Ancho fijo para cada tarjeta
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
};

const cardHoverStyle = {
    transform: 'translateY(-5px)', // Efecto de elevación al pasar el ratón
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
};

const cardTitleStyle = {
    fontSize: '1.4em',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
};

const cardDescriptionStyle = {
    fontSize: '0.9em',
    color: '#666',
    marginBottom: '15px'
};

const cardIconStyle = {
    fontSize: '3em', // Tamaño del icono
    color: '#1976d2', // Color del icono (azul)
    marginBottom: '15px'
};

const backButtonStyle = {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#6c757d', // Gris
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out'
};

const backButtonHoverStyle = {
    backgroundColor: '#5a6268' // Gris más oscuro al pasar el ratón
};


function ReportesCondominio() {
    const [vistaReporte, setVistaReporte] = useState(null);
    const [isHoveredIngresos, setIsHoveredIngresos] = useState(false);
    const [isHoveredGastos, setIsHoveredGastos] = useState(false);

    const renderReporte = () => {
        switch (vistaReporte) {
            case 'ingresosEgresosGlobal':
                return <ReporteIngresosEgresos />;
            case 'gastosCondominio':
                return <ReporteGastos />;
            default:
                return (
                    <div style={cardContainerStyle}>
                        {/* Tarjeta para Reporte de Ingresos y Egresos */}
                        <div
                            style={{ ...cardStyle, ...(isHoveredIngresos ? cardHoverStyle : {}) }}
                            onClick={() => setVistaReporte('ingresosEgresosGlobal')}
                            onMouseEnter={() => setIsHoveredIngresos(true)}
                            onMouseLeave={() => setIsHoveredIngresos(false)}
                        >
                            <span style={cardIconStyle}>💰</span> {/* Icono para Ingresos/Egresos */}
                            <h3 style={cardTitleStyle}>Reporte de Ingresos y Egresos</h3>
                            <p style={cardDescriptionStyle}>Resumen general de todos los ingresos y egresos por categoría y período.</p>
                            {/* Puedes añadir un botón "Ver Reporte" si lo deseas, pero el clic en la tarjeta ya lo hace */}
                        </div>

                        {/* Tarjeta para Reporte de Gastos */}
                        <div
                            style={{ ...cardStyle, ...(isHoveredGastos ? cardHoverStyle : {}) }}
                            onClick={() => setVistaReporte('gastosCondominio')}
                            onMouseEnter={() => setIsHoveredGastos(true)}
                            onMouseLeave={() => setIsHoveredGastos(false)}
                        >
                            <span style={cardIconStyle}>💸</span> {/* Icono para Gastos */}
                            <h3 style={cardTitleStyle}>Reporte Detallado de Gastos</h3>
                            <p style={cardDescriptionStyle}>Detalle de todos los gastos del condominio, con filtros por tipo de gasto y proveedor.</p>
                            {/* Puedes añadir un botón "Ver Reporte" si lo deseas */}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="container mt-4">
            <h2>Reportes de Condominio</h2>
            {vistaReporte && (
                <button
                    style={backButtonStyle}
                    onClick={() => setVistaReporte(null)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = backButtonHoverStyle.backgroundColor}
                    onMouseLeave={(e) => e.target.style.backgroundColor = backButtonStyle.backgroundColor}
                >
                    ← Volver a Reportes
                </button>
            )}

            <div className="mt-3">
                {renderReporte()}
            </div>
        </div>
    );
}

export default ReportesCondominio;