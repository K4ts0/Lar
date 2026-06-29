const jwt = require('jsonwebtoken');

module.exports = {
  // Verificar token JWT
  verificarToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        sucesso: false, 
        erro: 'Token não fornecido' 
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ 
        sucesso: false, 
        erro: 'Token inválido ou expirado' 
      });
    }
  },

  // Verificar se é ADMIN
  verificarAdmin: (req, res, next) => {
    if (req.usuario.nivel !== 'ADMIN') {
      return res.status(403).json({ 
        sucesso: false, 
        erro: 'Acesso negado. Apenas administradores podem realizar esta ação' 
      });
    }
    next();
  },

  // Verificar se é ENFERMEIRO ou superior
  verificarEnfermeiro: (req, res, next) => {
    if (!['ADMIN', 'ENFERMEIRO'].includes(req.usuario.nivel)) {
      return res.status(403).json({ 
        sucesso: false, 
        erro: 'Acesso negado. Apenas enfermeiros e administradores' 
      });
    }
    next();
  },

  // Verificar permissão para acessar relatório
  verificarAcessoRelatorio: (req, res, next) => {
    if (req.usuario.nivel === 'ADMIN') {
      return next();
    }
    
    // Usuários só podem ver seus próprios relatórios
    if (req.params.id) {
      req.verificarProprietario = true;
    }
    
    next();
  }
};
