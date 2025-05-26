import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionProveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoProveedorId, setEditandoProveedorId] = useState(null);
    const [formData, setFormData] = useState({
        PRO_NOMBRE: '',
        PRO_NOMBRE_CONTACTO: '',
        PRO_NUMERO: '',
        PRO_NIT: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoProveedorId, setEliminandoProveedorId] = useState(null);

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/proveedores');
            if (response.data.success) {
                setProveedores(response.data.data);
            } else {
                console.error('Error al listar proveedores:', response.data.message);
                setMensaje(`Error al obtener los proveedores: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener los proveedores:', error);
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
            const response = await axios.post('http://localhost:3002/api/proveedores', formData);
            setMensaje(response.data.message || (response.data.success ? 'Proveedor agregado correctamente' : 'Error al insertar el proveedor'));
            if (response.data.success) {
                setFormData({
                    PRO_NOMBRE: '',
                    PRO_NOMBRE_CONTACTO: '',
                    PRO_NUMERO: '',
                    PRO_NIT: ''
                });
                setVista('listar');
                fetchProveedores();
            }
        } catch (error) {
            setMensaje('Error al insertar el proveedor.');
        }
    };

    const handleEditar = (id) => {
        const proveedorAEditar = proveedores.find(proveedor => proveedor[0] === id);
        if (proveedorAEditar) {
            setEditandoProveedorId(id);
            setFormData({
                PRO_NOMBRE: proveedorAEditar[1] || '',
                PRO_NOMBRE_CONTACTO: proveedorAEditar[2] || '',
                PRO_NUMERO: proveedorAEditar[3] || '',
                PRO_NIT: proveedorAEditar[4] || ''
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/proveedores/${editandoProveedorId}`, formData);
            setMensaje(response.data.success ? 'Proveedor actualizado correctamente' : 'Error al actualizar el proveedor');
            if (response.data.success) {
                setVista('listar');
                setEditandoProveedorId(null);
                fetchProveedores();
            }
        } catch (error) {
            setMensaje('Error al actualizar el proveedor.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el proveedor con ID ${id}?`)) {
            setEliminandoProveedorId(id);
            axios.delete(`http://localhost:3002/api/proveedores/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Proveedor eliminado correctamente' : 'Error al eliminar el proveedor');
                    if (response.data.success) {
                        setProveedores(proveedores.filter(proveedor => proveedor[0] !== id));
                    }
                    setEliminandoProveedorId(null);
                })
                .catch(error => setMensaje('Hubo un error al eliminar el proveedor.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Proveedores</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Proveedor</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Nombre de Contacto</th>
                                    <th>Número</th>
                                    <th>NIT</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proveedores.map((proveedor) => (
                                    <tr key={proveedor[0]}>
                                        <td>{proveedor[0]}</td>
                                        <td>{proveedor[1]}</td>
                                        <td>{proveedor[2]}</td>
                                        <td>{proveedor[3]}</td>
                                        <td>{proveedor[4]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(proveedor[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(proveedor[0])} className="btn btn-danger btn-sm" disabled={eliminandoProveedorId === proveedor[0]}>
                                                {eliminandoProveedorId === proveedor[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="PRO_NOMBRE">Nombre del Proveedor</label>
                                <input type="text" className="form-control" id="PRO_NOMBRE" name="PRO_NOMBRE" value={formData.PRO_NOMBRE} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PRO_NOMBRE_CONTACTO">Nombre de Contacto</label>
                                <input type="text" className="form-control" id="PRO_NOMBRE_CONTACTO" name="PRO_NOMBRE_CONTACTO" value={formData.PRO_NOMBRE_CONTACTO} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PRO_NUMERO">Número de Teléfono</label>
                                <input type="text" className="form-control" id="PRO_NUMERO" name="PRO_NUMERO" value={formData.PRO_NUMERO} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PRO_NIT">NIT</label>
                                <input type="text" className="form-control" id="PRO_NIT" name="PRO_NIT" value={formData.PRO_NIT} onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Proveedor'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar proveedores.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Proveedores</h1>
            {renderVista()}
        </div>
    );
}

export default GestionProveedores;