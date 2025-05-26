import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionFormasPago() {
    const [formasPago, setFormasPago] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoFormaPagoId, setEditandoFormaPagoId] = useState(null);
    const [FOPA_NOMBRE, setFOPA_NOMBRE] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [eliminandoFormaPagoId, setEliminandoFormaPagoId] = useState(null);

    useEffect(() => {
        fetchFormasPago();
    }, []);

    const fetchFormasPago = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/formaspago');
            if (response.data.success) {
                setFormasPago(response.data.data);
            } else {
                console.error('Error:', response.data.message);
                setMensaje(`Error al obtener las formas de pago: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener las formas de pago:', error);
            setMensaje('Error al conectar con el servidor.');
        }
    };

    const handleAgregar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3002/api/formaspago', { FOPA_NOMBRE });
            setMensaje(response.data.message || (response.data.success ? 'Forma de pago agregada correctamente' : 'Error al insertar la forma de pago'));
            if (response.data.success) {
                setFOPA_NOMBRE('');
                setVista('listar');
                fetchFormasPago();
            }
        } catch (error) {
            setMensaje('Error al insertar la forma de pago.');
        }
    };

    const handleEditar = (id) => {
        const formaPagoAEditar = formasPago.find(fp => fp[0] === id);
        if (formaPagoAEditar) {
            setEditandoFormaPagoId(id);
            setFOPA_NOMBRE(formaPagoAEditar[1] || '');
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/formaspago/${editandoFormaPagoId}`, { FOPA_NOMBRE });
            setMensaje(response.data.success ? 'Forma de pago actualizada correctamente' : 'Error al actualizar la forma de pago');
            if (response.data.success) {
                setVista('listar');
                setEditandoFormaPagoId(null);
                fetchFormasPago();
            }
        } catch (error) {
            setMensaje('Error al actualizar la forma de pago.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la forma de pago con ID ${id}?`)) {
            setEliminandoFormaPagoId(id);
            axios.delete(`http://localhost:3002/api/formaspago/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Forma de pago eliminada correctamente' : 'Error al eliminar la forma de pago');
                    if (response.data.success) {
                        setFormasPago(formasPago.filter(fp => fp[0] !== id));
                    }
                    setEliminandoFormaPagoId(null);
                })
                .catch(error => setMensaje('Error al eliminar la forma de pago.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Formas de Pago</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Forma de Pago</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formasPago.map((formaPago) => (
                                    <tr key={formaPago[0]}>
                                        <td>{formaPago[0]}</td>
                                        <td>{formaPago[1]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(formaPago[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(formaPago[0])} className="btn btn-danger btn-sm" disabled={eliminandoFormaPagoId === formaPago[0]}>
                                                {eliminandoFormaPagoId === formaPago[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Forma de Pago' : 'Agregar Forma de Pago'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="FOPA_NOMBRE">Nombre</label>
                                <input type="text" className="form-control" id="FOPA_NOMBRE" value={FOPA_NOMBRE} onChange={(e) => setFOPA_NOMBRE(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Forma de Pago'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar formas de pago.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Formas de Pago</h1>
            {renderVista()}
        </div>
    );
}

export default GestionFormasPago;