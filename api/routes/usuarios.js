const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

router.get('/', verificarToken, verificarAdmin, usuarioController.listar);
router.get('/:id', verificarToken, verificarAdmin, usuarioController.buscarPorId);
router.post('/', verificarToken, verificarAdmin, usuarioController.criar);
router.put('/:id', verificarToken, verificarAdmin, usuarioController.atualizar);
router.patch('/:id/toggle-status', verificarToken, verificarAdmin, usuarioController.toggleStatus);
router.delete('/:id', verificarToken, verificarAdmin, usuarioController.deletar);

module.exports = router;