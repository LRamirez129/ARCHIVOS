import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionTipoCobro() {
    const [tiposCobro, setTiposCobro] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar', 'eliminar'
    const [editandoTipoCobroId, setEditandoTipoCobroId] = useState(null);
    const [TICO_NOMBRE, setTICO_NOMBRE] = useState('');
    const [TICO_DESCRIPCION, setTICO_DESCRIPCION] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [eliminandoTipoCobroId, setEliminandoTipoCobroId] = useState(null);

    useEffect(() => {
        fetchTiposCobro();
    }, []);

    const fetchTiposCobro = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/tiposcobro');
            if (response.data.success) {
                setTiposCobro(response.data.data);
            } else {
                console.error('Error:', response.data.message);
                setMensaje(`Error al obtener los tipos de cobro: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener los tipos de cobro:', error);
            setMensaje('Error al conectar con el servidor.');
        }
    };

    const handleAgregar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3002/api/tiposcobro', { TICO_NOMBRE, TICO_DESCRIPCION });
            setMensaje(response.data.message || (response.data.success ? 'Tipo de cobro agregado correctamente' : 'Error al insertar el tipo de cobro'));
            if (response.data.success) {
                setTICO_NOMBRE('');
                setTICO_DESCRIPCION('');
                setVista('listar');
                fetchTiposCobro();
            }
        } catch (error) {
            setMensaje('Error al insertar el tipo de cobro.');
        }
    };

    const handleEditar = (id) => {
        const tipoCobroAEditar = tiposCobro.find(tc => tc[0] === id);
        if (tipoCobroAEditar) {
            setEditandoTipoCobroId(id);
            setTICO_NOMBRE(tipoCobroAEditar[1] || '');
            setTICO_DESCRIPCION(tipoCobroAEditar[2] || '');
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/tiposcobro/${editandoTipoCobroId}`, { TICO_NOMBRE, TICO_DESCRIPCION });
            setMensaje(response.data.success ? 'Tipo de cobro actualizado correctamente' : 'Error al actualizar el tipo de cobro');
            if (response.data.success) {
                setVista('listar');
                setEditandoTipoCobroId(null);
                fetchTiposCobro();
            }
        } catch (error) {
            setMensaje('Error al actualizar el tipo de cobro.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el tipo de cobro con ID ${id}?`)) {
            setEliminandoTipoCobroId(id);
            axios.delete(`http://localhost:3002/api/tiposcobro/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Tipo de cobro eliminado correctamente' : 'Error al eliminar el tipo de cobro');
                    if (response.data.success) {
                        setTiposCobro(tiposCobro.filter(tc => tc[0] !== id));
                    }
                    setEliminandoTipoCobroId(null);
                })
                .catch(error => setMensaje('Error al eliminar el tipo de cobro.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Tipos de Cobro</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Tipo de Cobro</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tiposCobro.map((tipoCobro) => (
                                    <tr key={tipoCobro[0]}>
                                        <td>{tipoCobro[0]}</td>
                                        <td>{tipoCobro[1]}</td>
                                        <td>{tipoCobro[2]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(tipoCobro[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(tipoCobro[0])} className="btn btn-danger btn-sm" disabled={eliminandoTipoCobroId === tipoCobro[0]}>
                                                {eliminandoTipoCobroId === tipoCobro[0] ? 'Eliminando...' : 'Eliminar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'agregar':
                return (
                    <div>
                        <h2>Agregar Tipo de Cobro</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="TICO_NOMBRE">Nombre</label>
                                <input type="text" className="form-control" id="TICO_NOMBRE" value={TICO_NOMBRE} onChange={(e) => setTICO_NOMBRE(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="TICO_DESCRIPCION">Descripción</label>
                                <textarea className="form-control" id="TICO_DESCRIPCION" value={TICO_DESCRIPCION} onChange={(e) => setTICO_DESCRIPCION(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-success">Agregar Tipo de Cobro</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            case 'editar':
                return (
                    <div>
                        <h2>Editar Tipo de Cobro</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={handleActualizar}>
                            <div className="form-group">
                                <label htmlFor="TICO_NOMBRE">Nombre</label>
                                <input type="text" className="form-control" id="TICO_NOMBRE" value={TICO_NOMBRE} onChange={(e) => setTICO_NOMBRE(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="TICO_DESCRIPCION">Descripción</label>
                                <textarea className="form-control" id="TICO_DESCRIPCION" value={TICO_DESCRIPCION} onChange={(e) => setTICO_DESCRIPCION(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar tipos de cobro.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Tipos de Cobro</h1>
            {renderVista()}
        </div>
    );
}

export default GestionTipoCobro;