const bcrypt = require('bcryptjs');
const db = require('../../database');

const usuarioController = {
  // Listar todos os usuários
  async listar(req, res) {
    try {
      const usuarios = await db.all(
        `SELECT id, nome, idade, sexo, telefone, usuario, nivel, ativo, 
                created_at, updated_at 
         FROM usuarios 
         ORDER BY nome`
      );
      
      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao listar usuários' 
      });
    }
  },

  // Buscar usuário por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      const usuario = await db.get(
        `SELECT id, nome, idade, sexo, telefone, usuario, nivel, ativo, 
                created_at, updated_at 
         FROM usuarios 
         WHERE id = ?`,
        [id]
      );

      if (!usuario) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Usuário não encontrado' 
        });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao buscar usuário' 
      });
    }
  },

  // Criar novo usuário
  async criar(req, res) {
    try {
      const { nome, idade, sexo, telefone, usuario, senha, nivel } = req.body;

      // Validações
      if (!nome || !usuario || !senha || !nivel) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Nome, usuário, senha e nível são obrigatórios' 
        });
      }

      // Verificar se usuário já existe
      const existente = await db.get(
        'SELECT id FROM usuarios WHERE usuario = ?',
        [usuario]
      );

      if (existente) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Nome de usuário já está em uso' 
        });
      }

      const senhaHash = bcrypt.hashSync(senha, 10);

      const result = await db.run(
        `INSERT INTO usuarios (nome, idade, sexo, telefone, usuario, senha, nivel) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, idade || null, sexo || null, telefone || null, usuario, senhaHash, nivel]
      );

      const novoUsuario = await db.get(
        `SELECT id, nome, idade, sexo, telefone, usuario, nivel, ativo, created_at 
         FROM usuarios WHERE id = ?`,
        [result.id]
      );

      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário criado com sucesso',
        usuario: novoUsuario
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao criar usuário' 
      });
    }
  },

  // Atualizar usuário
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, idade, sexo, telefone, usuario, senha, nivel, ativo } = req.body;

      const user = await db.get('SELECT id FROM usuarios WHERE id = ?', [id]);
      
      if (!user) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Usuário não encontrado' 
        });
      }

      // Verificar se novo usuário já existe (se foi alterado)
      if (usuario) {
        const existente = await db.get(
          'SELECT id FROM usuarios WHERE usuario = ? AND id != ?',
          [usuario, id]
        );

        if (existente) {
          return res.status(400).json({ 
            sucesso: false, 
            erro: 'Nome de usuário já está em uso' 
          });
        }
      }

      let sql = 'UPDATE usuarios SET ';
      const params = [];
      const updates = [];

      if (nome) { updates.push('nome = ?'); params.push(nome); }
      if (idade) { updates.push('idade = ?'); params.push(idade); }
      if (sexo) { updates.push('sexo = ?'); params.push(sexo); }
      if (telefone) { updates.push('telefone = ?'); params.push(telefone); }
      if (usuario) { updates.push('usuario = ?'); params.push(usuario); }
      if (nivel) { updates.push('nivel = ?'); params.push(nivel); }
      if (ativo !== undefined) { updates.push('ativo = ?'); params.push(ativo ? 1 : 0); }
      
      if (senha) {
        updates.push('senha = ?');
        params.push(bcrypt.hashSync(senha, 10));
      }

      if (updates.length === 0) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Nenhum dado para atualizar' 
        });
      }

      sql += updates.join(', ') + ' WHERE id = ?';
      params.push(id);

      await db.run(sql, params);

      const usuarioAtualizado = await db.get(
        `SELECT id, nome, idade, sexo, telefone, usuario, nivel, ativo, 
                created_at, updated_at 
         FROM usuarios WHERE id = ?`,
        [id]
      );

      res.json({
        sucesso: true,
        mensagem: 'Usuário atualizado com sucesso',
        usuario: usuarioAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao atualizar usuário' 
      });
    }
  },

  // Ativar/Desativar usuário
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;

      if (id == 1) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Não é possível desativar o administrador principal' 
        });
      }

      const user = await db.get('SELECT ativo FROM usuarios WHERE id = ?', [id]);
      
      if (!user) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Usuário não encontrado' 
        });
      }

      const novoStatus = user.ativo ? 0 : 1;
      
      await db.run(
        'UPDATE usuarios SET ativo = ? WHERE id = ?',
        [novoStatus, id]
      );

      res.json({
        sucesso: true,
        mensagem: `Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
        ativo: novoStatus === 1
      });

    } catch (error) {
      console.error('Erro ao alterar status:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao alterar status do usuário' 
      });
    }
  },

  // Deletar usuário
  async deletar(req, res) {
    try {
      const { id } = req.params;

      if (id == 1) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Não é possível deletar o administrador principal' 
        });
      }

      const user = await db.get('SELECT id FROM usuarios WHERE id = ?', [id]);
      
      if (!user) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Usuário não encontrado' 
        });
      }

      await db.run('DELETE FROM usuarios WHERE id = ?', [id]);

      res.json({
        sucesso: true,
        mensagem: 'Usuário deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao deletar usuário' 
      });
    }
  }
};

module.exports = usuarioController;