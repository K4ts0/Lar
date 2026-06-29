const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const { verificarToken, verificarAdmin, verificarEnfermeiro } = require('../middleware/auth');

router.get('/', verificarToken, relatorioController.listar);
router.get('/:id', verificarToken, relatorioController.buscarPorId);
router.get('/:id/completo', verificarToken, relatorioController.buscarCompleto);
router.post('/', verificarToken, relatorioController.criar);
router.put('/:id', verificarToken, verificarEnfermeiro, relatorioController.atualizar);
router.delete('/:id', verificarToken, verificarAdmin, relatorioController.deletar);

module.exports = router;