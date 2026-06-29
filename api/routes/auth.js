const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/verificar-senha-admin', verificarToken, authController.verificarSenhaAdmin);
router.get('/verificar', verificarToken, authController.verificarToken);

module.exports = router;
