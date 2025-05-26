import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionGastos() {
    const [gastos, setGastos] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoGastoId, setEditandoGastoId] = useState(null);
    const [formData, setFormData] = useState({
        CON_CONDOMINIO: '',
        PRO_PROVEEDOR: '',
        GAS_DESCRIPCION: '',
        GAS_MONTO: '',
        GAS_FECHA: '',
        GAS_TIPO_GASTO: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoGastoId, setEliminandoGastoId] = useState(null);

    useEffect(() => {
        fetchGastos();
        fetchCondominios();
        fetchProveedores();
    }, []);

    const fetchGastos = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/gastos');
            if (response.data.success) {
                setGastos(response.data.data);
            } else {
                console.error('Error al listar gastos:', response.data.message);
                setMensaje(`Error al obtener los gastos: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener los gastos:', error);
            setMensaje('Error al conectar con el servidor.');
        }
    };

    const fetchCondominios = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/condominios');
            if (response.data.success) {
                setCondominios(response.data.data);
            } else {
                console.error('Error al listar condominios:', response.data.message);
            }
        } catch (error) {
            console.error('Error al obtener los condominios:', error);
            setMensaje('Error al conectar con el servidor.');
        }
    };

    const fetchProveedores = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/proveedores');
            if (response.data.success) {
                setProveedores(response.data.data);
            } else {
                console.error('Error al listar proveedores:', response.data.message);
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
            const response = await axios.post('http://localhost:3002/api/gastos', formData);
            setMensaje(response.data.message || (response.data.success ? 'Gasto agregado correctamente' : 'Error al insertar el gasto'));
            if (response.data.success) {
                setFormData({
                    CON_CONDOMINIO: '',
                    PRO_PROVEEDOR: '',
                    GAS_DESCRIPCION: '',
                    GAS_MONTO: '',
                    GAS_FECHA: '',
                    GAS_TIPO_GASTO: ''
                });
                setVista('listar');
                fetchGastos();
            }
        } catch (error) {
            setMensaje('Error al insertar el gasto.');
        }
    };

    const handleEditar = (id) => {
        const gastoAEditar = gastos.find(gasto => gasto[0] === id);
        if (gastoAEditar) {
            setEditandoGastoId(id);
            setFormData({
                CON_CONDOMINIO: gastoAEditar[1] || '',
                PRO_PROVEEDOR: gastoAEditar[2] || '',
                GAS_DESCRIPCION: gastoAEditar[3] || '',
                GAS_MONTO: gastoAEditar[4] || '',
                GAS_FECHA: gastoAEditar[5] ? gastoAEditar[5].substring(0, 10) : '',
                GAS_TIPO_GASTO: gastoAEditar[6] || ''
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/gastos/${editandoGastoId}`, formData);
            setMensaje(response.data.success ? 'Gasto actualizado correctamente' : 'Error al actualizar el gasto');
            if (response.data.success) {
                setVista('listar');
                setEditandoGastoId(null);
                fetchGastos();
            }
        } catch (error) {
            setMensaje('Error al actualizar el gasto.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el gasto con ID ${id}?`)) {
            setEliminandoGastoId(id);
            axios.delete(`http://localhost:3002/api/gastos/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Gasto eliminado correctamente' : 'Error al eliminar el gasto');
                    if (response.data.success) {
                        setGastos(gastos.filter(gasto => gasto[0] !== id));
                    }
                    setEliminandoGastoId(null);
                })
                .catch(error => setMensaje('Hubo un error al eliminar el gasto.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Gastos</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Gasto</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Condominio ID</th>
                                    <th>Proveedor ID</th>
                                    <th>Descripción</th>
                                    <th>Monto</th>
                                    <th>Fecha</th>
                                    <th>Tipo de Gasto</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gastos.map((gasto) => (
                                    <tr key={gasto[0]}>
                                        <td>{gasto[0]}</td>
                                        <td>{gasto[1]}</td>
                                        <td>{gasto[2]}</td>
                                        <td>{gasto[3]}</td>
                                        <td>{gasto[4]}</td>
                                        <td>{gasto[5]}</td>
                                        <td>{gasto[6]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(gasto[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(gasto[0])} className="btn btn-danger btn-sm" disabled={eliminandoGastoId === gasto[0]}>
                                                {eliminandoGastoId === gasto[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Gasto' : 'Agregar Gasto'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="CON_CONDOMINIO">ID de Condominio</label>
                                <select className="form-control" id="CON_CONDOMINIO" name="CON_CONDOMINIO" value={formData.CON_CONDOMINIO} onChange={handleInputChange} required>
                                    <option value="">Seleccionar Condominio</option>
                                    {condominios.map(condominio => (
                                        <option key={condominio[0]} value={condominio[0]}>{condominio[1]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="PRO_PROVEEDOR">ID de Proveedor (Opcional)</label>
                                <select className="form-control" id="PRO_PROVEEDOR" name="PRO_PROVEEDOR" value={formData.PRO_PROVEEDOR} onChange={handleInputChange}>
                                    <option value="">Seleccionar Proveedor (Opcional)</option>
                                    {proveedores.map(proveedor => (
                                        <option key={proveedor[0]} value={proveedor[0]}>{proveedor[1]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="GAS_DESCRIPCION">Descripción del Gasto</label>
                                <input type="text" className="form-control" id="GAS_DESCRIPCION" name="GAS_DESCRIPCION" value={formData.GAS_DESCRIPCION} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="GAS_MONTO">Monto del Gasto</label>
                                <input type="number" step="0.01" className="form-control" id="GAS_MONTO" name="GAS_MONTO" value={formData.GAS_MONTO} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="GAS_FECHA">Fecha del Gasto</label>
                                <input type="date" className="form-control" id="GAS_FECHA" name="GAS_FECHA" value={formData.GAS_FECHA} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="GAS_TIPO_GASTO">Tipo de Gasto</label>
                                <input type="text" className="form-control" id="GAS_TIPO_GASTO" name="GAS_TIPO_GASTO" value={formData.GAS_TIPO_GASTO} onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Gasto'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar gastos.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Gastos</h1>
            {renderVista()}
        </div>
    );
}

export default GestionGastos;