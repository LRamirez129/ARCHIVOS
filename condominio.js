import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionCondominios() {
    const [condominios, setCondominios] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoCondominioId, setEditandoCondominioId] = useState(null);
    const [formData, setFormData] = useState({
        COND_NOMBRE: '',
        COND_DIRECCION: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoCondominioId, setEliminandoCondominioId] = useState(null);

    useEffect(() => {
        fetchCondominios();
    }, []);

    const fetchCondominios = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/condominios');
            if (response.data.success) {
                setCondominios(response.data.data);
            } else {
                console.error('Error al listar condominios:', response.data.message);
                setMensaje(`Error al obtener los condominios: ${response.data.message}`);
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
            const response = await axios.post('http://localhost:3002/api/condominios', formData);
            setMensaje(response.data.message || (response.data.success ? 'Condominio agregado correctamente' : 'Error al insertar el condominio'));
            if (response.data.success) {
                setFormData({
                    COND_NOMBRE: '',
                    COND_DIRECCION: ''
                });
                setVista('listar');
                fetchCondominios();
            }
        } catch (error) {
            setMensaje('Error al insertar el condominio.');
        }
    };

    const handleEditar = (id) => {
        const condominioAEditar = condominios.find(condominio => condominio[0] === id);
        if (condominioAEditar) {
            setEditandoCondominioId(id);
            setFormData({
                COND_NOMBRE: condominioAEditar[1] || '',
                COND_DIRECCION: condominioAEditar[2] || ''
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/condominios/${editandoCondominioId}`, formData);
            setMensaje(response.data.success ? 'Condominio actualizado correctamente' : 'Error al actualizar el condominio');
            if (response.data.success) {
                setVista('listar');
                setEditandoCondominioId(null);
                fetchCondominios();
            }
        } catch (error) {
            setMensaje('Error al actualizar el condominio.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el condominio con ID ${id}?`)) {
            setEliminandoCondominioId(id);
            axios.delete(`http://localhost:3002/api/condominios/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Condominio eliminado correctamente' : 'Error al eliminar el condominio');
                    if (response.data.success) {
                        setCondominios(condominios.filter(condominio => condominio[0] !== id));
                    }
                    setEliminandoCondominioId(null);
                })
                .catch(error => setMensaje('Hubo un error al eliminar el condominio.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Condominios</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Condominio</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Dirección</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {condominios.map((condominio) => (
                                    <tr key={condominio[0]}>
                                        <td>{condominio[0]}</td>
                                        <td>{condominio[1]}</td>
                                        <td>{condominio[2]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(condominio[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(condominio[0])} className="btn btn-danger btn-sm" disabled={eliminandoCondominioId === condominio[0]}>
                                                {eliminandoCondominioId === condominio[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Condominio' : 'Agregar Condominio'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="COND_NOMBRE">Nombre del Condominio</label>
                                <input type="text" className="form-control" id="COND_NOMBRE" name="COND_NOMBRE" value={formData.COND_NOMBRE} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="COND_DIRECCION">Dirección del Condominio</label>
                                <input type="text" className="form-control" id="COND_DIRECCION" name="COND_DIRECCION" value={formData.COND_DIRECCION} onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Condominio'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar condominios.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Condominios</h1>
            {renderVista()}
        </div>
    );
}

export default GestionCondominios;