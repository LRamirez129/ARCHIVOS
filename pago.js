import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionPagos() {
    const [pagos, setPagos] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoPagoId, setEditandoPagoId] = useState(null);
    const [formData, setFormData] = useState({
        CUO_CUOTA: '',
        FOPA_FORMA_PAGO: '',
        PAG_FECHA_PAGO: '',
        PAG_MONTO: '',
        PAG_REFERENCIA_PAGO: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoPagoId, setEliminandoPagoId] = useState(null);

    useEffect(() => {
        fetchPagos();
    }, []);

    const fetchPagos = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/pagos');
            if (response.data.success) {
                setPagos(response.data.data);
            } else {
                console.error('Error al listar pagos:', response.data.message);
                setMensaje(`Error al obtener los pagos: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener los pagos:', error);
            setMensaje('Error al conectar con el servidor.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAgregar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3002/api/pagos', formData);
            setMensaje(response.data.message || (response.data.success ? 'Pago agregado correctamente' : 'Error al insertar el pago'));
            if (response.data.success) {
                setFormData({
                    CUO_CUOTA: '',
                    FOPA_FORMA_PAGO: '',
                    PAG_FECHA_PAGO: '',
                    PAG_MONTO: '',
                    PAG_REFERENCIA_PAGO: ''
                });
                setVista('listar');
                fetchPagos();
            }
        } catch (error) {
            setMensaje('Error al insertar el pago.');
        }
    };

    const handleEditar = (id) => {
        const pagoAEditar = pagos.find(pago => pago[0] === id);
        if (pagoAEditar) {
            setEditandoPagoId(id);
            setFormData({
                CUO_CUOTA: pagoAEditar[1] || '',
                FOPA_FORMA_PAGO: pagoAEditar[2] || '',
                PAG_FECHA_PAGO: pagoAEditar[3] ? pagoAEditar[3].substring(0, 10) : '',
                PAG_MONTO: pagoAEditar[4] || '',
                PAG_REFERENCIA_PAGO: pagoAEditar[5] || ''
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/pagos/${editandoPagoId}`, formData);
            setMensaje(response.data.success ? 'Pago actualizado correctamente' : 'Error al actualizar el pago');
            if (response.data.success) {
                setVista('listar');
                setEditandoPagoId(null);
                fetchPagos();
            }
        } catch (error) {
            setMensaje('Error al actualizar el pago.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el pago con ID ${id}?`)) {
            setEliminandoPagoId(id);
            axios.delete(`http://localhost:3002/api/pagos/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Pago eliminado correctamente' : 'Error al eliminar el pago');
                    if (response.data.success) {
                        setPagos(pagos.filter(pago => pago[0] !== id));
                    }
                    setEliminandoPagoId(null);
                })
                .catch(error => setMensaje('Hubo un error al eliminar el pago.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Pagos</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Pago</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cuota ID</th>
                                    <th>Forma de Pago ID</th>
                                    <th>Fecha de Pago</th>
                                    <th>Monto</th>
                                    <th>Referencia de Pago</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.map((pago) => (
                                    <tr key={pago[0]}>
                                        <td>{pago[0]}</td>
                                        <td>{pago[1]}</td>
                                        <td>{pago[2]}</td>
                                        <td>{pago[3]}</td>
                                        <td>{pago[4]}</td>
                                        <td>{pago[5]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(pago[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(pago[0])} className="btn btn-danger btn-sm" disabled={eliminandoPagoId === pago[0]}>
                                                {eliminandoPagoId === pago[0] ? 'Eliminando...' : 'Eliminar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'agregar':
            case 'editar':
                const esEditar = vista === 'editar';
                return (
                    <div>
                        <h2>{esEditar ? 'Editar Pago' : 'Agregar Pago'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="CUO_CUOTA">ID de Cuota</label>
                                <input type="number" className="form-control" id="CUO_CUOTA" name="CUO_CUOTA" value={formData.CUO_CUOTA} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="FOPA_FORMA_PAGO">ID de Forma de Pago</label>
                                <input type="number" className="form-control" id="FOPA_FORMA_PAGO" name="FOPA_FORMA_PAGO" value={formData.FOPA_FORMA_PAGO} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PAG_FECHA_PAGO">Fecha de Pago (YYYY-MM-DD)</label>
                                <input type="date" className="form-control" id="PAG_FECHA_PAGO" name="PAG_FECHA_PAGO" value={formData.PAG_FECHA_PAGO} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PAG_MONTO">Monto</label>
                                <input type="number" step="0.01" className="form-control" id="PAG_MONTO" name="PAG_MONTO" value={formData.PAG_MONTO} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PAG_REFERENCIA_PAGO">Referencia de Pago</label>
                                <input type="text" className="form-control" id="PAG_REFERENCIA_PAGO" name="PAG_REFERENCIA_PAGO" value={formData.PAG_REFERENCIA_PAGO} onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Pago'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar pagos.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Pagos</h1>
            {renderVista()}
        </div>
    );
}

export default GestionPagos;