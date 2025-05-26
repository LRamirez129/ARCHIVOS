import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionMultas() {
    const [multas, setMultas] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoMultaId, setEditandoMultaId] = useState(null);
    const [formData, setFormData] = useState({
        CUO_CUOTA: '',
        MUL_DESCRIPCION: '',
        MUL_MONTO: '',
        MUL_FECHA_GENERACION: '',
        MUL_ESTADO: 'Pendiente'
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoMultaId, setEliminandoMultaId] = useState(null);

    useEffect(() => {
        fetchMultas();
    }, []);

    const fetchMultas = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/multas');
            if (response.data.success) {
                setMultas(response.data.data);
            } else {
                console.error('Error:', response.data.message);
                setMensaje(`Error al obtener las multas: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener las multas:', error);
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
            const response = await axios.post('http://localhost:3002/api/multas', formData);
            setMensaje(response.data.message || (response.data.success ? 'Multa agregada correctamente' : 'Error al insertar la multa'));
            if (response.data.success) {
                setFormData({
                    CUO_CUOTA: '',
                    MUL_DESCRIPCION: '',
                    MUL_MONTO: '',
                    MUL_FECHA_GENERACION: '',
                    MUL_ESTADO: 'Pendiente'
                });
                setVista('listar');
                fetchMultas();
            }
        } catch (error) {
            setMensaje('Error al insertar la multa.');
        }
    };

    const handleEditar = (id) => {
        const multaAEditar = multas.find(multa => multa[0] === id);
        if (multaAEditar) {
            setEditandoMultaId(id);
            setFormData({
                CUO_CUOTA: multaAEditar[1] || '',
                MUL_DESCRIPCION: multaAEditar[2] || '',
                MUL_MONTO: multaAEditar[3] || '',
                MUL_FECHA_GENERACION: multaAEditar[4] ? multaAEditar[4].substring(0, 10) : '',
                MUL_ESTADO: multaAEditar[5] || ''
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/multas/${editandoMultaId}`, formData);
            setMensaje(response.data.success ? 'Multa actualizada correctamente' : 'Error al actualizar la multa');
            if (response.data.success) {
                setVista('listar');
                setEditandoMultaId(null);
                fetchMultas();
            }
        } catch (error) {
            setMensaje('Error al actualizar la multa.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la multa con ID ${id}?`)) {
            setEliminandoMultaId(id);
            axios.delete(`http://localhost:3002/api/multas/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Multa eliminada correctamente' : 'Error al eliminar la multa');
                    if (response.data.success) {
                        setMultas(multas.filter(multa => multa[0] !== id));
                    }
                    setEliminandoMultaId(null);
                })
                .catch(error => setMensaje('Error al eliminar la multa.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Multas</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Multa</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cuota ID</th>
                                    <th>Descripción</th>
                                    <th>Monto</th>
                                    <th>Fecha Generación</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {multas.map((multa) => (
                                    <tr key={multa[0]}>
                                        <td>{multa[0]}</td>
                                        <td>{multa[1]}</td>
                                        <td>{multa[2]}</td>
                                        <td>{multa[3]}</td>
                                        <td>{multa[4]}</td>
                                        <td>{multa[5]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(multa[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(multa[0])} className="btn btn-danger btn-sm" disabled={eliminandoMultaId === multa[0]}>
                                                {eliminandoMultaId === multa[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Multa' : 'Agregar Multa'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="CUO_CUOTA">ID de Cuota</label>
                                <input type="number" className="form-control" id="CUO_CUOTA" name="CUO_CUOTA" value={formData.CUO_CUOTA} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="MUL_DESCRIPCION">Descripción</label>
                                <textarea className="form-control" id="MUL_DESCRIPCION" name="MUL_DESCRIPCION" value={formData.MUL_DESCRIPCION} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="MUL_MONTO">Monto</label>
                                <input type="number" step="0.01" className="form-control" id="MUL_MONTO" name="MUL_MONTO" value={formData.MUL_MONTO} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="MUL_FECHA_GENERACION">Fecha de Generación (YYYY-MM-DD)</label>
                                <input type="date" className="form-control" id="MUL_FECHA_GENERACION" name="MUL_FECHA_GENERACION" value={formData.MUL_FECHA_GENERACION} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="MUL_ESTADO">Estado</label>
                                <select className="form-control" id="MUL_ESTADO" name="MUL_ESTADO" value={formData.MUL_ESTADO} onChange={handleInputChange}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagada">Pagada</option>
                                    <option value="Anulada">Anulada</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Multa'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar multas.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Multas</h1>
            {renderVista()}
        </div>
    );
}

export default GestionMultas;