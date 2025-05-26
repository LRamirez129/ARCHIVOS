const express = require('express');
const router = express.Router();

// Rutas CRUD para Formas de Pago (CON_FORMA_PAGO)

// Obtener todas las formas de pago
router.get('/', async (req, res) => {
  try {
    const result = await req.executeQuery('SELECT FOPA_FORMA_PAGO, FOPA_NOMBRE FROM CON_FORMA_PAGO');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al obtener las formas de pago" });
  }
});

// Obtener una forma de pago por su ID
router.get('/:id', async (req, res) => {
  const formaPagoId = req.params.id;
  try {
    const result = await req.executeQuery(
      'SELECT FOPA_FORMA_PAGO, FOPA_NOMBRE FROM CON_FORMA_PAGO WHERE FOPA_FORMA_PAGO = :id',
      [formaPagoId]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, formaPago: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Forma de pago no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al buscar la forma de pago' });
  }
});

// Insertar una nueva forma de pago
router.post('/', async (req, res) => {
  const { FOPA_NOMBRE } = req.body;
  if (!FOPA_NOMBRE) {
    return res.status(400).json({ success: false, message: 'El nombre de la forma de pago es obligatorio' });
  }
  try {
    const result = await req.executeQuery(
      'INSERT INTO CON_FORMA_PAGO (FOPA_NOMBRE) VALUES (:nombre)',
      { nombre: FOPA_NOMBRE }
    );
    res.status(201).json({ success: true, message: 'Forma de pago creada correctamente', insertedId: result.lastRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear la forma de pago' });
  }
});

// Actualizar una forma de pago existente
router.put('/:id', async (req, res) => {
  const formaPagoId = req.params.id;
  const { FOPA_NOMBRE } = req.body;
  if (!FOPA_NOMBRE) {
    return res.status(400).json({ success: false, message: 'El nombre de la forma de pago es obligatorio' });
  }
  try {
    const result = await req.executeQuery(
      'UPDATE CON_FORMA_PAGO SET FOPA_NOMBRE = :nombre WHERE FOPA_FORMA_PAGO = :id',
      { nombre: FOPA_NOMBRE, id: formaPagoId }
    );
    if (result.rowsAffected > 0) {
      res.json({ success: true, message: 'Forma de pago actualizada correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Forma de pago no encontrada' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar la forma de pago' });
  }
});

// Eliminar una forma de pago por su ID
router.delete('/:id', async (req, res) => {
  const formaPagoId = req.params.id;
  try {
    const result = await req.executeQuery(
      'DELETE FROM CON_FORMA_PAGO WHERE FOPA_FORMA_PAGO = :id',
      [formaPagoId]
    );
    if (result.rowsAffected > 0) {
      res.json({ success: true, message: 'Forma de pago eliminada correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Forma de pago no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar la forma de pago' });
  }
});

module.exports = router;