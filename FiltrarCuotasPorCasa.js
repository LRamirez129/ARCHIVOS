import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FiltrarCuotasPorCasa = () => {
    const [residencias, setResidencias] = useState([]);
    const [residenciaSeleccionada, setResidenciaSeleccionada] = useState('');
    const [cuotasPendientes, setCuotasPendientes] = useState([]);
    const [totalVencido, setTotalVencido] = useState(0);
    const [totalPendienteFiltrado, setTotalPendienteFiltrado] = useState(0); // Nuevo estado
    const [mensajeError, setMensajeError] = useState('');

    useEffect(() => {
        // Obtener la lista de residencias desde el backend
        axios.get('http://localhost:3002/api/residencias')
            .then(response => {
                if (response.data.success) {
                    setResidencias(response.data.data);
                } else {
                    console.error('Error al obtener las residencias:', response.data.message);
                    setMensajeError('Error al cargar las residencias.');
                }
            })
            .catch(error => {
                console.error('Error al obtener las residencias:', error);
                setMensajeError('Error de conexión al cargar las residencias.');
            });
    }, []);

    const handleFiltrar = async () => {
        if (residenciaSeleccionada) {
            setMensajeError('');
            try {
                const response = await axios.get(`http://localhost:3002/api/cuotas/pendientes/residencia/${residenciaSeleccionada}`);
                if (response.data.success) {
                    setCuotasPendientes(response.data.pendientes);
                    setTotalVencido(response.data.totalVencido);

                    // Calcular el total pendiente filtrado
                    let sumaPendiente = 0;
                    response.data.pendientes.forEach(cuota => {
                        sumaPendiente += cuota[3]; // Asumiendo que el monto está en el índice 3
                    });
                    setTotalPendienteFiltrado(sumaPendiente);

                } else {
                    setMensajeError(response.data.message || 'Error al obtener las cuotas.');
                    setCuotasPendientes([]);
                    setTotalVencido(0);
                    setTotalPendienteFiltrado(0); // Resetear el total
                }
            } catch (error) {
                console.error('Error al filtrar las cuotas:', error);
                setMensajeError('Error al comunicarse con el servidor.');
                setCuotasPendientes([]);
                setTotalVencido(0);
                setTotalPendienteFiltrado(0); // Resetear el total
            }
        } else {
            setMensajeError('Por favor, selecciona una residencia.');
            setCuotasPendientes([]);
            setTotalVencido(0);
            setTotalPendienteFiltrado(0); // Resetear el total
        }
    };

    return (
        <div className="container mt-4">
            <h2>Filtrar Cuotas por Residencia</h2>
            {mensajeError && <div className="alert alert-danger">{mensajeError}</div>}
            <div className="form-group">
                <label htmlFor="residencia">Seleccionar Residencia:</label>
                <select
                    className="form-control"
                    id="residencia"
                    value={residenciaSeleccionada}
                    onChange={(e) => setResidenciaSeleccionada(e.target.value)}
                >
                    <option value="">Seleccionar...</option>
                    {residencias.map((residencia) => (
                        <option key={residencia[0]} value={residencia[0]}>
                            {residencia[0]} {/* Ajusta cómo se muestra la residencia si tienes más información */}
                        </option>
                    ))}
                </select>
            </div>
            <button className="btn btn-primary" onClick={handleFiltrar}>
                Filtrar
            </button>

            {cuotasPendientes.length > 0 && (
                <div className="mt-3">
                    <h3>Cuotas Pendientes:</h3>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID Cuota</th>
                                <th>Tipo de Cobro</th>
                                <th>Periodo</th>
                                <th>Monto</th>
                                <th>Fecha Límite</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cuotasPendientes.map((cuota) => (
                                <tr key={cuota[0]}>
                                    <td>{cuota[0]}</td>
                                    <td>{cuota[1]}</td>
                                    <td>{cuota[2]}</td>
                                    <td>{cuota[3]}</td>
                                    <td>{cuota[4]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h4 className="mt-2">Total Pendiente a Pagar: ${totalPendienteFiltrado.toFixed(2)}</h4> {/* Nuevo total */}
                </div>
            )}

            {totalVencido > 0 && (
                <div className="mt-3">
                    <h3>Total Pendiente de Cuotas Vencidas:</h3>
                    <p className="alert alert-warning">
                        Total: ${totalVencido.toFixed(2)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FiltrarCuotasPorCasa;