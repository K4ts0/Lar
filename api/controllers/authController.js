const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../database');

const authController = {
  // Login de usuário
  async login(req, res) {
    try {
      const { usuario, senha } = req.body;

      if (!usuario || !senha) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Usuário e senha são obrigatórios' 
        });
      }

      const user = await db.get(
        'SELECT id, nome, usuario, senha, nivel, ativo FROM usuarios WHERE usuario = ?',
        [usuario]
      );

      if (!user) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Usuário não encontrado' 
        });
      }

      if (!user.ativo) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Usuário inativo. Contate o administrador' 
        });
      }

      const senhaValida = bcrypt.compareSync(senha, user.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Senha incorreta' 
        });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          nome: user.nome, 
          usuario: user.usuario, 
          nivel: user.nivel 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        sucesso: true,
        token,
        usuario: {
          id: user.id,
          nome: user.nome,
          usuario: user.usuario,
          nivel: user.nivel
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro interno do servidor' 
      });
    }
  },

  // Verificar senha do admin
  async verificarSenhaAdmin(req, res) {
    try {
      const { senha } = req.body;
      
      if (!senha) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Senha não fornecida' 
        });
      }

      const admin = await db.get(
        'SELECT senha FROM usuarios WHERE id = ? AND nivel = ?',
        [req.usuario.id, 'ADMIN']
      );

      if (!admin) {
        return res.status(403).json({ 
          sucesso: false, 
          erro: 'Usuário não é administrador' 
        });
      }

      const senhaValida = bcrypt.compareSync(senha, admin.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Senha incorreta' 
        });
      }

      res.json({ sucesso: true });

    } catch (error) {
      console.error('Erro ao verificar senha admin:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro interno do servidor' 
      });
    }
  },

  // Verificar token
  async verificarToken(req, res) {
    try {
      const user = await db.get(
        'SELECT id, nome, usuario, nivel FROM usuarios WHERE id = ? AND ativo = 1',
        [req.usuario.id]
      );

      if (!user) {
        return res.json({ valido: false });
      }

      res.json({ 
        valido: true, 
        usuario: user 
      });

    } catch (error) {
      console.error('Erro ao verificar token:', error);
      res.json({ valido: false });
    }
  }
};

module.exports = authController;
