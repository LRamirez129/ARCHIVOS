// Backend/servidor.js
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const usuarioRoutes = require('./crudtablas/crudusuario');
const residenciaRoutes = require('./crudtablas/crudresidencia');
const notificacionRoutes = require('./crudtablas/crudnotificacion');
const tipoCobroRoutes = require('./crudtablas/crudtipocobro');
const cuotaRoutes = require('./crudtablas/crudcuota');
const formaPagoRoutes = require('./crudtablas/crudformapago');
const pagoRoutes = require('./crudtablas/crudpago');
const multaRoutes = require('./crudtablas/crudmulta');
const condominioRoutes = require('./crudtablas/crudcondominio');
const proveedorRoutes = require('./crudtablas/crudproveedor');
const gastoRoutes = require('./crudtablas/crudgasto');
const residenciaController = require('./control/controladoresresidencia'); 
const reporteIngresoEgresoRoutes = require('./reportes/ingresoyegreso');
const reporteGastosRoutes = require('./reportes/gastos');



const app = express();
const port = 3002;

// Configurar middleware
app.use(cors());
app.use(express.json());

// Configuración de conexión a Oracle (FIJA)
const dbConfig = {
  user: "CONDOMINIO2",
  password: "1234",
  connectionString: "localhost:1521/orcl"
};

// Función para manejar conexiones a Oracle y ejecutar consultas
async function executeQuery(query, params = [], options = {}) {
  let con;
  try {
    con = await oracledb.getConnection(dbConfig);
    const result = await con.execute(query, params, { autoCommit: true, ...options });
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (con) {
      try { await con.close(); } catch (closeErr) { console.error("Error al cerrar la conexión:", closeErr); }
    }
  }
}

// Middleware para pasar executeQuery a las rutas
const withQueryExecutor = (req, res, next) => {
  req.executeQuery = executeQuery;
  next();
};

// Montar las rutas
app.use('/api/usuarios', withQueryExecutor, usuarioRoutes);
app.use('/api/residencias', withQueryExecutor, residenciaRoutes);
app.use('/api/notificaciones', withQueryExecutor, notificacionRoutes);
app.use('/api/tiposcobro', withQueryExecutor, tipoCobroRoutes);
app.use('/api/cuotas', withQueryExecutor, cuotaRoutes);
app.use('/api/formaspago', withQueryExecutor, formaPagoRoutes);
app.use('/api/pagos', withQueryExecutor, pagoRoutes);
app.use('/api/multas', withQueryExecutor, multaRoutes);
app.use('/api/proveedores', withQueryExecutor, proveedorRoutes);
app.use('/api/gastos', withQueryExecutor, gastoRoutes);
app.use('/api/condominios', withQueryExecutor, condominioRoutes);


// Rutas para los cálculos de residencia
app.get('/api/ingresos-por-residencia/:residenciaId', withQueryExecutor, residenciaController.calcularIngresosPorResidencia);
app.get('/api/saldo-pendiente-residencia/:residenciaId', withQueryExecutor, residenciaController.calcularSaldoPendientePorResidencia);
app.use('/api/reportes-ingresos-egresos', withQueryExecutor, reporteIngresoEgresoRoutes);
app.use('/api/reportes-gastos', withQueryExecutor, reporteGastosRoutes);


// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});