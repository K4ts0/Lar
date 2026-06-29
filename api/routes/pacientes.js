const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Rotas públicas (requerem apenas autenticação)
router.get('/', verificarToken, pacienteController.listar);
router.get('/:id', verificarToken, pacienteController.buscarPorId);

// Rotas administrativas (requerem autenticação + admin)
router.post('/', verificarToken, verificarAdmin, pacienteController.criar);
router.put('/:id', verificarToken, verificarAdmin, pacienteController.atualizar);
router.patch('/:id/toggle-status', verificarToken, verificarAdmin, pacienteController.toggleStatus);
router.delete('/:id', verificarToken, verificarAdmin, pacienteController.deletar);

module.exports = router;