import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [vista, setVista] = useState('listar'); // 'listar', 'agregar', 'editar'
    const [editandoUsuarioId, setEditandoUsuarioId] = useState(null);
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        dpi: '',
        fechaNac: '',
        telefono: '',
        correo: '',
        nombreUsuario: '',
        contraseña: '',
        rolUsuario: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [eliminandoUsuarioId, setEliminandoUsuarioId] = useState(null);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/usuarios');
            if (response.data.success) {
                setUsuarios(response.data.data);
            } else {
                console.error('Error:', response.data.message);
                setMensaje(`Error al obtener los usuarios: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
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
            const response = await axios.post('http://localhost:3002/api/usuarios', formData);
            setMensaje(response.data.message || (response.data.success ? 'Usuario agregado correctamente' : 'Error al insertar el usuario'));
            if (response.data.success) {
                setFormData({
                    primerNombre: '',
                    segundoNombre: '',
                    primerApellido: '',
                    segundoApellido: '',
                    dpi: '',
                    fechaNac: '',
                    telefono: '',
                    correo: '',
                    nombreUsuario: '',
                    contraseña: '',
                    rolUsuario: ''
                });
                setVista('listar');
                fetchUsuarios();
            }
        } catch (error) {
            setMensaje('Error al insertar el usuario.');
        }
    };

    const handleEditar = (id) => {
        const usuarioAEditar = usuarios.find(usuario => usuario[0] === id);
        if (usuarioAEditar) {
            setEditandoUsuarioId(id);
            setFormData({
                primerNombre: usuarioAEditar[1] || '',
                segundoNombre: usuarioAEditar[2] || '',
                primerApellido: usuarioAEditar[3] || '',
                segundoApellido: usuarioAEditar[4] || '',
                dpi: usuarioAEditar[5] || '',
                fechaNac: usuarioAEditar[6] ? usuarioAEditar[6].substring(0, 10) : '',
                telefono: usuarioAEditar[7] || '',
                correo: usuarioAEditar[8] || '',
                nombreUsuario: usuarioAEditar[9] || '',
                contraseña: usuarioAEditar[10] || '',
                rolUsuario: usuarioAEditar[11] || ''
            });
            setVista('editar');
        }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3002/api/usuarios/${editandoUsuarioId}`, formData);
            setMensaje(response.data.success ? 'Usuario actualizado correctamente' : 'Error al actualizar');
            if (response.data.success) {
                setVista('listar');
                setEditandoUsuarioId(null);
                fetchUsuarios();
            }
        } catch (error) {
            setMensaje('Hubo un error al actualizar.');
        }
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el usuario con ID ${id}?`)) {
            setEliminandoUsuarioId(id);
            axios.delete(`http://localhost:3002/api/usuarios/${id}`)
                .then(response => {
                    setMensaje(response.data.success ? 'Usuario eliminado correctamente' : 'Error al eliminar el usuario');
                    if (response.data.success) {
                        setUsuarios(usuarios.filter(usuario => usuario[0] !== id));
                    }
                    setEliminandoUsuarioId(null);
                })
                .catch(error => setMensaje('Hubo un error al eliminar el usuario.'));
        }
    };

    const renderVista = () => {
        switch (vista) {
            case 'listar':
                return (
                    <div>
                        <h2>Listado de Usuarios</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <button onClick={() => setVista('agregar')} className="btn btn-success mb-3">Crear Usuario</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Primer Nombre</th>
                                    <th>Segundo Nombre</th>
                                    <th>Primer Apellido</th>
                                    <th>Segundo Apellido</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario[0]}>
                                        <td>{usuario[0]}</td>
                                        <td>{usuario[1]}</td>
                                        <td>{usuario[2]}</td>
                                        <td>{usuario[3]}</td>
                                        <td>{usuario[4]}</td>
                                        <td>{usuario[7]}</td>
                                        <td>{usuario[8]}</td>
                                        <td>{usuario[9]}</td>
                                        <td>{usuario[10]}</td>
                                        <td>
                                            <button onClick={() => handleEditar(usuario[0])} className="btn btn-info btn-sm mr-2">Editar</button>
                                            <button onClick={() => handleEliminar(usuario[0])} className="btn btn-danger btn-sm" disabled={eliminandoUsuarioId === usuario[0]}>
                                                {eliminandoUsuarioId === usuario[0] ? 'Eliminando...' : 'Eliminar'}
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
                        <h2>{esEditar ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
                        {mensaje && <div className={`alert ${mensaje.includes('error') ? 'alert-danger' : 'alert-success'}`} role="alert">{mensaje}</div>}
                        <form onSubmit={esEditar ? handleActualizar : handleAgregar}>
                            <div className="form-group">
                                <label htmlFor="primerNombre">Primer Nombre</label>
                                <input type="text" className="form-control" id="primerNombre" name="primerNombre" value={formData.primerNombre} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="segundoNombre">Segundo Nombre</label>
                                <input type="text" className="form-control" id="segundoNombre" name="segundoNombre" value={formData.segundoNombre} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="primerApellido">Primer Apellido</label>
                                <input type="text" className="form-control" id="primerApellido" name="primerApellido" value={formData.primerApellido} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="segundoApellido">Segundo Apellido</label>
                                <input type="text" className="form-control" id="segundoApellido" name="segundoApellido" value={formData.segundoApellido} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dpi">DPI</label>
                                <input type="text" className="form-control" id="dpi" name="dpi" value={formData.dpi} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fechaNac">Fecha de Nacimiento</label>
                                <input type="date" className="form-control" id="fechaNac" name="fechaNac" value={formData.fechaNac} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono</label>
                                <input type="text" className="form-control" id="telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="correo">Correo Electrónico</label>
                                <input type="email" className="form-control" id="correo" name="correo" value={formData.correo} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="nombreUsuario">Nombre de Usuario</label>
                                <input type="text" className="form-control" id="nombreUsuario" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="contraseña">Contraseña</label>
                                <input type="password" className="form-control" id="contraseña" name="contraseña" value={formData.contraseña} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="rolUsuario">Rol de Usuario</label>
                                <input type="text" className="form-control" id="rolUsuario" name="rolUsuario" value={formData.rolUsuario} onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="btn btn-primary">{esEditar ? 'Guardar Cambios' : 'Agregar Usuario'}</button>
                            <button onClick={() => setVista('listar')} className="btn btn-secondary ml-2">Cancelar</button>
                        </form>
                    </div>
                );
            default:
                return <div>Seleccione una opción para gestionar usuarios.</div>;
        }
    };

    return (
        <div className="container mt-4">
            <h1>Gestión de Usuarios</h1>
            {renderVista()}
        </div>
    );
}

export default GestionUsuarios;