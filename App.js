import React, { useState } from 'react';
import './App.css';
import GestionUsuarios from './ftcrudtablas/usuario';
import GestionResidencias from './ftcrudtablas/residencia';
import GestionNotificaciones from './ftcrudtablas/notificacion';
import GestionTipoCobro from './ftcrudtablas/tipocobro';
import GestionCuotas from './ftcrudtablas/cuota';
import GestionFormasPago from './ftcrudtablas/formadepago';
import GestionPagos from './ftcrudtablas/pago';
import GestionMultas from './ftcrudtablas/multa';
import GestionGastos from './ftcrudtablas/gasto';
import GestionCondominios from './ftcrudtablas/condominio';
import GestionProveedores from './ftcrudtablas/proveedor';
import ReportesResidencia from './componentes/ReportesResidencia';
import ReportesCondominio from './reporteria/ReportesCondominio';


function App() {
  const [vista, setVista] = useState(null);

  const renderVista = () => {
    switch (vista) {
      case 'usuario':
        return <GestionUsuarios />;
      case 'residencia':
        return <GestionResidencias />;
      case 'notificacion':
        return <GestionNotificaciones />;
      case 'tipocobro':
        return <GestionTipoCobro />;
      case 'cuota':
        return <GestionCuotas />;
      case 'formapago':
        return <GestionFormasPago />;
      case 'pago':
        return <GestionPagos />;
      case 'multa':
        return <GestionMultas />;
      case 'gasto':
        return <GestionGastos />;
      case 'condominio':
        return <GestionCondominios />;
      case 'proveedor':
        return <GestionProveedores />;
      case 'reportes':
        return <ReportesResidencia />;
      case 'reportesCondominio':
        return <ReportesCondominio />;
      default:
        return <div style={contentAreaStyle}>Selecciona una opción del menú.</div>;
    }
  };

  return (
    <div className="app-layout" style={appLayoutStyle}>
      {/* Barra Lateral de Navegación */}
      <aside style={sidebarStyle}>
        <h2 style={sidebarTitleStyle}>Sistema de Cobro de Condominio</h2>
        <ul style={navListStyle}>
          <li style={listItemStyle(vista === 'usuario')} onClick={() => setVista('usuario')}>Usuarios</li>
          <li style={listItemStyle(vista === 'condominio')} onClick={() => setVista('condominio')}>Condominios</li>
          <li style={listItemStyle(vista === 'residencia')} onClick={() => setVista('residencia')}>Residencias</li>
          <li style={listItemStyle(vista === 'notificacion')} onClick={() => setVista('notificacion')}>Notificaciones</li>
          <li style={listItemStyle(vista === 'tipocobro')} onClick={() => setVista('tipocobro')}>Tipos de Cobro</li>
          <li style={listItemStyle(vista === 'cuota')} onClick={() => setVista('cuota')}>Cuotas</li>
          <li style={listItemStyle(vista === 'formapago')} onClick={() => setVista('formapago')}>Formas de Pago</li>
          <li style={listItemStyle(vista === 'pago')} onClick={() => setVista('pago')}>Pagos</li>
          <li style={listItemStyle(vista === 'multa')} onClick={() => setVista('multa')}>Multas</li>
          <li style={listItemStyle(vista === 'gasto')} onClick={() => setVista('gasto')}>Gastos</li>
          <li style={listItemStyle(vista === 'proveedor')} onClick={() => setVista('proveedor')}>Proveedores</li>
          <li style={listItemStyle(vista === 'reportes')} onClick={() => setVista('reportes')}>Calculos</li>
          <li style={listItemStyle(vista === 'reportesCondominio')} onClick={() => setVista('reportesCondominio')}>Reportes Generales</li>
        </ul>
      </aside>

      {/* Área de Contenido Principal */}
      <main style={mainContentStyle}>
        {renderVista()}
      </main>
    </div>
  );
}

const appLayoutStyle = {
  display: 'flex',
  minHeight: '100vh',
};

const sidebarStyle = {
  backgroundColor: '#e3f2fd', // Azul muy claro
  width: '220px',
  padding: '20px',
  borderRight: '1px solid #bbdefb', // Azul claro
  display: 'flex',
  flexDirection: 'column',
};

const sidebarTitleStyle = {
  color: '#1976d2', // Azul más oscuro
  marginBottom: '20px',
  textAlign: 'center',
};

const navListStyle = {
  listStyleType: 'none',
  padding: 0,
};

const listItemStyle = (isSelected) => ({
  padding: '12px 15px',
  cursor: 'pointer',
  borderBottom: '1px solid #b3e5fc', // Otro azul claro
  backgroundColor: isSelected ? '#b3e5fc' : 'transparent', // Resalta la selección
  color: isSelected ? '#0d47a1' : '#333', // Cambia el color del texto al seleccionar
  fontWeight: isSelected ? 'bold' : 'normal',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#90caf9', // Azul un poco más oscuro al pasar el ratón
    color: '#0d47a1',
  },
});

const mainContentStyle = {
  flex: 1,
  padding: '20px',
  backgroundColor: '#f0f8ff', // Un tono azul muy claro (AliceBlue) para el fondo principal
};

const contentAreaStyle = {
  padding: '20px',
  textAlign: 'center',
  color: '#555',
};

export default App;