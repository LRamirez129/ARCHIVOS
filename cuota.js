import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionCuotas() {
    const [cuotas, setCuotas] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoCuotaId, setEditandoCuotaId] = useState(null);
    const [formData, setFormData] = useState({
        RES_RESIDENCIA: '',
        TICO_TIPO_COBRO: '',
        CUO_PERIODO: '',
        CUO_MONTO: '',
        CUO_FECHA_GENERACION: '',
        CUO_ESTADO: 'Pendiente',
        CUO_FECHA_LIMITE: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoCuotaId, setEliminandoCuotaId] = useState(null);

    useEffect(() => {
        fetchCuotas();
    }, []);

    const fetchCuotas = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/cuotas');
            if (response.data.success) {
                setCuotas(response.data.data);
            } else {
                console.error('Error:', response.data.message);
                setMensaje(`Error al obtener las cuotas: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener las cuotas:', error);
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
            const response = await axios.post('http://localhost:3002/api/cuotas', formData);
            setMensaje(response.data.message || (response.data.success ? 'Cuota agregada correctamente' : 'Error al insertar la cuota'));
            if (response.data.success) {
                setFormData({
                    RES_RESIDENCIA: '',
                    TICO_TIPO_COBRO: '',
                    CUO_PERIODO: '',
                    CUO_MONTO: '',
                    CUO_FECHA_GENERACION: '',
                    CUO_ESTADO: 'Pendiente',
                    CUO_FECHA_LIMITE: ''
                });
                setVista('listar');
                fetchCuotas();
            }
        } catch (error) {
            setMensaje('Error al insertar la cuota.');
        }
    };

    const handleEditar = (id) => {
        const cuotaAEditar = cuotas.find(cuota => cuota[0] === id);
        if (cuotaAEditar) {
            setEditandoCuotaId(id);
            setFormData({
                RES_RESIDENCIA: cuotaAEditar[1] || '',
                TICO_TIPO_COBRO: cuotaAEditar[2] || '',
                CUO_PERIODO: cuotaAEditar[3] || '',
                CUO_MONTO: cuotaAEditar[4] || '',
                CUO_FECHA_GENERACION: cuotaAEditar[5] ? cuotaAEditar[5].substring(0, 10) : '',
                CUO_ESTADO: cuotaAEditar[6] || '',
                CUO_FECHA_LIMITE: cuotaAEditar[7] ? cuotaAEditar[7].substring(0, 10) : ''
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/cuotas/${editandoCuotaId}`, formData);
            setMensaje(response.data.success ? 'Cuota actualizada correctamente' : 'Error al actualizar la cuota');
            if (response.data.success) {
                setVista('listar');
                setEditandoCuotaId(null);
                fetchCuotas();
            }
        } catch (error) {
            setMensaje('Error al actualizar la cuota.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la cuota con ID ${id}?`)) {
            setEliminandoCuotaId(id);
            axios.delete(`http://localhost:3002/api/cuotas/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Cuota eliminada correctamente' : 'Error al eliminar la cuota');
                    if (response.data.success) {
                        setCuotas(cuotas.filter(cuota => cuota[0] !== id));
                    }
                    setEliminandoCuotaId(null);
                })
                .catch(error => setMensaje('Error al eliminar la cuota.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Cuotas</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Cuota</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Residencia ID</th>
                                    <th>Tipo de Cobro ID</th>
                                    <th>Periodo</th>
                                    <th>Monto</th>
                                    <th>Fecha Generación</th>
                                    <th>Estado</th>
                                    <th>Fecha Límite</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cuotas.map((cuota) => (
                                    <tr key={cuota[0]}>
                                        <td>{cuota[0]}</td>
                                        <td>{cuota[1]}</td>
                                        <td>{cuota[2]}</td>
                                        <td>{cuota[3]}</td>
                                        <td>{cuota[4]}</td>
                                        <td>{cuota[5]}</td>
                                        <td>{cuota[6]}</td>
                                        <td>{cuota[7]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(cuota[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(cuota[0])} className="btn btn-danger btn-sm" disabled={eliminandoCuotaId === cuota[0]}>
                                                {eliminandoCuotaId === cuota[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Cuota' : 'Agregar Cuota'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="RES_RESIDENCIA">ID de Residencia</label>
                                <input type="number" className="form-control" id="RES_RESIDENCIA" name="RES_RESIDENCIA" value={formData.RES_RESIDENCIA} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="TICO_TIPO_COBRO">ID de Tipo de Cobro</label>
                                <input type="number" className="form-control" id="TICO_TIPO_COBRO" name="TICO_TIPO_COBRO" value={formData.TICO_TIPO_COBRO} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="CUO_PERIODO">Periodo</label>
                                <input type="text" className="form-control" id="CUO_PERIODO" name="CUO_PERIODO" value={formData.CUO_PERIODO} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="CUO_MONTO">Monto</label>
                                <input type="number" step="0.01" className="form-control" id="CUO_MONTO" name="CUO_MONTO" value={formData.CUO_MONTO} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="CUO_FECHA_GENERACION">Fecha de Generación (YYYY-MM-DD)</label>
                                <input type="date" className="form-control" id="CUO_FECHA_GENERACION" name="CUO_FECHA_GENERACION" value={formData.CUO_FECHA_GENERACION} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="CUO_ESTADO">Estado</label>
                                <select className="form-control" id="CUO_ESTADO" name="CUO_ESTADO" value={formData.CUO_ESTADO} onChange={handleInputChange}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagada">Pagada</option>
                                    <option value="Vencida">Vencida</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="CUO_FECHA_LIMITE">Fecha Límite (YYYY-MM-DD)</label>
                                <input type="date" className="form-control" id="CUO_FECHA_LIMITE" name="CUO_FECHA_LIMITE" value={formData.CUO_FECHA_LIMITE} onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Cuota'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar cuotas.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Cuotas</h1>
            {renderVista()}
        </div>
    );
}

export default GestionCuotas;