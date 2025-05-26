import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionResidencias() {
    const [residencias, setResidencias] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoResidenciaId, setEditandoResidenciaId] = useState(null);
    const [formData, setFormData] = useState({
        USU_USUARIO: '',
        RES_NOMBRE: '',
        RES_DIRECCION: '',
        RES_CORREO: '',
        RES_TELEFONO: '',
        COND_CONDOMINIO: '' // Nuevo campo para la relación con Condominio
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoResidenciaId, setEliminandoResidenciaId] = useState(null);

    useEffect(() => {
        fetchResidencias();
        fetchCondominios(); // Cargar la lista de condominios
    }, []);

    const fetchResidencias = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/residencias');
            if (response.data.success) {
                setResidencias(response.data.data);
            } else {
                console.error('Error:', response.data.message);
                setMensaje(`Error al obtener las residencias: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener las residencias:', error);
            setMensaje('Error al conectar con el servidor.');
        }
    };

    const fetchCondominios = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/condominios');
            if (response.data.success) {
                setCondominios(response.data.data);
            } else {
                console.error('Error al obtener los condominios:', response.data.message);
            }
        } catch (error) {
            console.error('Error al obtener los condominios:', error);
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
            const response = await axios.post('http://localhost:3002/api/residencias', formData);
            setMensaje(response.data.message || (response.data.success ? 'Residencia agregada correctamente' : 'Error al insertar la residencia'));
            if (response.data.success) {
                setFormData({
                    USU_USUARIO: '',
                    RES_NOMBRE: '',
                    RES_DIRECCION: '',
                    RES_CORREO: '',
                    RES_TELEFONO: '',
                    COND_CONDOMINIO: '' // Reset del nuevo campo
                });
                setVista('listar');
                fetchResidencias();
            }
        } catch (error) {
            setMensaje('Error al insertar la residencia.');
        }
    };

    const handleEditar = (id) => {
        const residenciaAEditar = residencias.find(residencia => residencia[0] === id);
        if (residenciaAEditar) {
            setEditandoResidenciaId(id);
            setFormData({
                USU_USUARIO: residenciaAEditar[1] || '',
                RES_NOMBRE: residenciaAEditar[2] || '',
                RES_DIRECCION: residenciaAEditar[3] || '',
                RES_CORREO: residenciaAEditar[4] || '',
                RES_TELEFONO: residenciaAEditar[5] || '',
                COND_CONDOMINIO: residenciaAEditar[6] || '' // Cargar el ID del condominio
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/residencias/${editandoResidenciaId}`, formData);
            setMensaje(response.data.success ? 'Residencia actualizada correctamente' : 'Error al actualizar la residencia');
            if (response.data.success) {
                setVista('listar');
                setEditandoResidenciaId(null);
                fetchResidencias();
            }
        } catch (error) {
            setMensaje('Hubo un error al actualizar la residencia.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la residencia con ID ${id}?`)) {
            setEliminandoResidenciaId(id);
            axios.delete(`http://localhost:3002/api/residencias/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Residencia eliminada correctamente' : 'Error al eliminar la residencia');
                    if (response.data.success) {
                        setResidencias(residencias.filter(residencia => residencia[0] !== id));
                    }
                    setEliminandoResidenciaId(null);
                })
                .catch(error => setMensaje('Hubo un error al eliminar la residencia.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Residencias</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Residencia</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario ID</th>
                                    <th>Nombre</th>
                                    <th>Dirección</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th>Condominio ID</th> {/* Nueva columna */}
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {residencias.map((residencia) => (
                                    <tr key={residencia[0]}>
                                        <td>{residencia[0]}</td>
                                        <td>{residencia[1]}</td>
                                        <td>{residencia[2]}</td>
                                        <td>{residencia[3]}</td>
                                        <td>{residencia[4]}</td>
                                        <td>{residencia[5]}</td>
                                        <td>{residencia[6]}</td> {/* Mostrar el ID del condominio */}
                                        <td>
                                            <button onClick={() => handleEditar(residencia[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(residencia[0])} className="btn btn-danger btn-sm" disabled={eliminandoResidenciaId === residencia[0]}>
                                                {eliminandoResidenciaId === residencia[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Residencia' : 'Agregar Residencia'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="USU_USUARIO">ID de Usuario</label>
                                <input type="number" className="form-control" id="USU_USUARIO" name="USU_USUARIO" value={formData.USU_USUARIO} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="RES_NOMBRE">Nombre de Residencia</label>
                                <input type="text" className="form-control" id="RES_NOMBRE" name="RES_NOMBRE" value={formData.RES_NOMBRE} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="RES_DIRECCION">Dirección</label>
                                <input type="text" className="form-control" id="RES_DIRECCION" name="RES_DIRECCION" value={formData.RES_DIRECCION} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="RES_CORREO">Correo Electrónico</label>
                                <input type="email" className="form-control" id="RES_CORREO" name="RES_CORREO" value={formData.RES_CORREO} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="RES_TELEFONO">Teléfono</label>
                                <input type="text" className="form-control" id="RES_TELEFONO" name="RES_TELEFONO" value={formData.RES_TELEFONO} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="COND_CONDOMINIO">Condominio</label>
                                <select className="form-control" id="COND_CONDOMINIO" name="COND_CONDOMINIO" value={formData.COND_CONDOMINIO} onChange={handleInputChange} required>
                                    <option value="">Seleccionar Condominio</option>
                                    {condominios.map(condominio => (
                                        <option key={condominio[0]} value={condominio[0]}>{condominio[1]}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Residencia'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar residencias.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Residencias</h1>
            {renderVista()}
        </div>
    );
}

export default GestionResidencias;