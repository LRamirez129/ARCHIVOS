// src/components/BotonGenerarCuotas.js
import React, { useState } from 'react';
import axios from 'axios';

const BotonGenerarCuotas = () => {
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const generarCuotas = async () => {
    setCargando(true);
    setMensaje('');
    try {
      const response = await axios.post('http://localhost:3002/api/cuotas/generar');
      setMensaje(response.data.message);
    } catch (error) {
      setMensaje(
        error.response?.data?.message || 'Error al generar cuotas'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <button onClick={generarCuotas} disabled={cargando}>
        {cargando ? 'Generando...' : 'Generar cuotas del mes'}
      </button>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default BotonGenerarCuotas;