// crudtablas/generatecuotas.js
const express = require('express');
const router = express.Router();

router.post('/generar', async (req, res) => {
  try {
    // Ejecuta el procedimiento almacenado para generar cuotas
    await req.executeQuery(`BEGIN GENERAR_CUOTAS_DEL_MES(); END;`);
    res.status(200).json({ message: 'Cuotas generadas exitosamente' });
  } catch (error) {
    console.error('Error al generar cuotas:', error);
    res.status(500).json({ message: 'Error al generar cuotas', error: error.message });
  }
});

module.exports = router;