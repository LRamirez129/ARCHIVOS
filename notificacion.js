import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionNotificaciones() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoNotificacionId, setEditandoNotificacionId] = useState(null);
    const [formData, setFormData] = useState({
        RES_RESIDENCIA: '',
        NOT_MENSAJE: '',
        NOT_FECHA: '',
        NOT_TIPO: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoNotificacionId, setEliminandoNotificacionId] = useState(null);

    useEffect(() => {
        fetchNotificaciones();
    }, []);

    const fetchNotificaciones = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/notificaciones');
            if (response.data.success) {
                setNotificaciones(response.data.data);
            } else {
                console.error('Error:', response.data.message);
                setMensaje(`Error al obtener las notificaciones: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener las notificaciones:', error);
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
            const response = await axios.post('http://localhost:3002/api/notificaciones', formData);
            setMensaje(response.data.message || (response.data.success ? 'Notificación agregada correctamente' : 'Error al insertar la notificación'));
            if (response.data.success) {
                setFormData({
                    RES_RESIDENCIA: '',
                    NOT_MENSAJE: '',
                    NOT_FECHA: '',
                    NOT_TIPO: ''
                });
                setVista('listar');
                fetchNotificaciones();
            }
        } catch (error) {
            setMensaje('Error al insertar la notificación.');
        }
    };

    const handleEditar = (id) => {
        const notificacionAEditar = notificaciones.find(notificacion => notificacion[0] === id);
        if (notificacionAEditar) {
            setEditandoNotificacionId(id);
            setFormData({
                RES_RESIDENCIA: notificacionAEditar[1] || '',
                NOT_MENSAJE: notificacionAEditar[2] || '',
                NOT_FECHA: notificacionAEditar[3] ? notificacionAEditar[3].substring(0, 10) : '',
                NOT_TIPO: notificacionAEditar[4] || ''
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/notificaciones/${editandoNotificacionId}`, formData);
            setMensaje(response.data.success ? 'Notificación actualizada correctamente' : 'Error al actualizar la notificación');
            if (response.data.success) {
                setVista('listar');
                setEditandoNotificacionId(null);
                fetchNotificaciones();
            }
        } catch (error) {
            setMensaje('Error al actualizar la notificación.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la notificación con ID ${id}?`)) {
            setEliminandoNotificacionId(id);
            axios.delete(`http://localhost:3002/api/notificaciones/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Notificación eliminada correctamente' : 'Error al eliminar la notificación');
                    if (response.data.success) {
                        setNotificaciones(notificaciones.filter(notificacion => notificacion[0] !== id));
                    }
                    setEliminandoNotificacionId(null);
                })
                .catch(error => setMensaje('Error al eliminar la notificación.'));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return '';
        }
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Notificaciones</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Notificación</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Residencia ID</th>
                                    <th>Mensaje</th>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notificaciones.map((notificacion) => (
                                    <tr key={notificacion[0]}>
                                        <td>{notificacion[0]}</td>
                                        <td>{notificacion[1]}</td>
                                        <td>{notificacion[2]}</td>
                                        <td>{notificacion[3] ? formatDate(notificacion[3]) : ''}</td>
                                        <td>{notificacion[4]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(notificacion[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(notificacion[0])} className="btn btn-danger btn-sm" disabled={eliminandoNotificacionId === notificacion[0]}>
                                                {eliminandoNotificacionId === notificacion[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Notificación' : 'Agregar Notificación'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="RES_RESIDENCIA">ID de Residencia</label>
                                <input type="number" className="form-control" id="RES_RESIDENCIA" name="RES_RESIDENCIA" value={formData.RES_RESIDENCIA} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="NOT_MENSAJE">Mensaje</label>
                                <textarea className="form-control" id="NOT_MENSAJE" name="NOT_MENSAJE" value={formData.NOT_MENSAJE} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="NOT_FECHA">Fecha (YYYY-MM-DD)</label>
                                <input type="date" className="form-control" id="NOT_FECHA" name="NOT_FECHA" value={formData.NOT_FECHA} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="NOT_TIPO">Tipo</label>
                                <input type="text" className="form-control" id="NOT_TIPO" name="NOT_TIPO" value={formData.NOT_TIPO} onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Notificación'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar notificaciones.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Notificaciones</h1>
            {renderVista()}
        </div>
    );
}

export default GestionNotificaciones;