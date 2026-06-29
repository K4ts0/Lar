const db = require('../../database');

const pacienteController = {
  // Listar todos os pacientes
  async listar(req, res) {
    try {
      const { busca, ativos, inativos } = req.query;
      let sql = 'SELECT * FROM pacientes WHERE 1=1';
      const params = [];

      if (ativos === 'true' && inativos !== 'true') {
        sql += ' AND ativo = 1';
      } else if (inativos === 'true' && ativos !== 'true') {
        sql += ' AND ativo = 0';
      }

      if (busca) {
        sql += ' AND (nome_completo LIKE ? OR quarto LIKE ?)';
        params.push(`%${busca}%`, `%${busca}%`);
      }

      sql += ' ORDER BY nome_completo';
      
      const pacientes = await db.all(sql, params);
      
      res.json(pacientes);
    } catch (error) {
      console.error('Erro ao listar pacientes:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao listar pacientes' 
      });
    }
  },

  // Buscar paciente por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      const paciente = await db.get(
        'SELECT * FROM pacientes WHERE id = ?',
        [id]
      );

      if (!paciente) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Paciente não encontrado' 
        });
      }

      res.json(paciente);
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao buscar paciente' 
      });
    }
  },

  // Criar novo paciente
  async criar(req, res) {
    try {
      const { 
        nome_completo,
        data_nascimento,
        idade,
        sexo,
        telefone_responsavel,
        nome_responsavel,
        quarto,
        leito,
        data_internacao,
        diagnostico_principal,
        alergias,
        medicamentos_continuos,
        observacoes,
        ativo 
      } = req.body;

      console.log('📦 Dados recebidos para criar paciente:', req.body);

      // Validações
      if (!nome_completo) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Nome completo do paciente é obrigatório' 
        });
      }

      if (!data_nascimento) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Data de nascimento é obrigatória' 
        });
      }

      if (!sexo || !['M', 'F'].includes(sexo)) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Sexo deve ser M ou F' 
        });
      }

      const result = await db.run(
        `INSERT INTO pacientes (
          nome_completo, data_nascimento, idade, sexo,
          telefone_responsavel, nome_responsavel, quarto, leito,
          data_internacao, diagnostico_principal, alergias,
          medicamentos_continuos, observacoes, ativo, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nome_completo,
          data_nascimento,
          idade || null,
          sexo,
          telefone_responsavel || null,
          nome_responsavel || null,
          quarto || null,
          leito || null,
          data_internacao || null,
          diagnostico_principal || null,
          alergias || null,
          medicamentos_continuos || null,
          observacoes || null,
          ativo !== undefined ? (ativo ? 1 : 0) : 1,
          req.usuarioId || null
        ]
      );

      const novoPaciente = await db.get(
        'SELECT * FROM pacientes WHERE id = ?',
        [result.lastID]
      );

      res.status(201).json({
        sucesso: true,
        mensagem: 'Paciente cadastrado com sucesso',
        paciente: novoPaciente,
        id: result.lastID
      });

    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao criar paciente: ' + error.message 
      });
    }
  },

  // Atualizar paciente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { 
        nome_completo,
        data_nascimento,
        idade,
        sexo,
        telefone_responsavel,
        nome_responsavel,
        quarto,
        leito,
        data_internacao,
        diagnostico_principal,
        alergias,
        medicamentos_continuos,
        observacoes,
        ativo 
      } = req.body;

      console.log('📦 Dados recebidos para atualizar paciente:', req.body);

      // Verificar se paciente existe
      const paciente = await db.get('SELECT id FROM pacientes WHERE id = ?', [id]);
      
      if (!paciente) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Paciente não encontrado' 
        });
      }

      // Construir query dinamicamente
      let sql = 'UPDATE pacientes SET ';
      const params = [];
      const updates = [];

      if (nome_completo !== undefined) { 
        updates.push('nome_completo = ?'); 
        params.push(nome_completo); 
      }
      if (data_nascimento !== undefined) { 
        updates.push('data_nascimento = ?'); 
        params.push(data_nascimento); 
      }
      if (idade !== undefined) { 
        updates.push('idade = ?'); 
        params.push(idade); 
      }
      if (sexo !== undefined) { 
        updates.push('sexo = ?'); 
        params.push(sexo); 
      }
      if (telefone_responsavel !== undefined) { 
        updates.push('telefone_responsavel = ?'); 
        params.push(telefone_responsavel); 
      }
      if (nome_responsavel !== undefined) { 
        updates.push('nome_responsavel = ?'); 
        params.push(nome_responsavel); 
      }
      if (quarto !== undefined) { 
        updates.push('quarto = ?'); 
        params.push(quarto); 
      }
      if (leito !== undefined) { 
        updates.push('leito = ?'); 
        params.push(leito); 
      }
      if (data_internacao !== undefined) { 
        updates.push('data_internacao = ?'); 
        params.push(data_internacao); 
      }
      if (diagnostico_principal !== undefined) { 
        updates.push('diagnostico_principal = ?'); 
        params.push(diagnostico_principal); 
      }
      if (alergias !== undefined) { 
        updates.push('alergias = ?'); 
        params.push(alergias); 
      }
      if (medicamentos_continuos !== undefined) { 
        updates.push('medicamentos_continuos = ?'); 
        params.push(medicamentos_continuos); 
      }
      if (observacoes !== undefined) { 
        updates.push('observacoes = ?'); 
        params.push(observacoes); 
      }
      if (ativo !== undefined) { 
        updates.push('ativo = ?'); 
        params.push(ativo ? 1 : 0); 
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      updates.push('updated_by = ?');
      params.push(req.usuarioId || null);

      if (updates.length <= 2) { // Só tem updated_at e updated_by
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Nenhum dado para atualizar' 
        });
      }

      sql += updates.join(', ') + ' WHERE id = ?';
      params.push(id);

      await db.run(sql, params);

      const pacienteAtualizado = await db.get(
        'SELECT * FROM pacientes WHERE id = ?',
        [id]
      );

      res.json({
        sucesso: true,
        mensagem: 'Paciente atualizado com sucesso',
        paciente: pacienteAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao atualizar paciente: ' + error.message 
      });
    }
  },

  // Ativar/Desativar paciente
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;

      const paciente = await db.get('SELECT ativo FROM pacientes WHERE id = ?', [id]);
      
      if (!paciente) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Paciente não encontrado' 
        });
      }

      const novoStatus = paciente.ativo ? 0 : 1;
      
      await db.run(
        'UPDATE pacientes SET ativo = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
        [novoStatus, req.usuarioId || null, id]
      );

      res.json({
        sucesso: true,
        mensagem: `Paciente ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
        ativo: novoStatus === 1
      });

    } catch (error) {
      console.error('Erro ao alterar status:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao alterar status do paciente' 
      });
    }
  },

  // Deletar paciente (físico - apenas se realmente necessário)
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const paciente = await db.get('SELECT id FROM pacientes WHERE id = ?', [id]);
      
      if (!paciente) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Paciente não encontrado' 
        });
      }

      // Opcional: verificar se há relatórios vinculados antes de deletar
      const relatorios = await db.get(
        'SELECT COUNT(*) as total FROM relatorios WHERE paciente_id = ?', 
        [id]
      );

      if (relatorios && relatorios.total > 0) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Não é possível deletar paciente com relatórios vinculados. Utilize a opção de desativar.' 
        });
      }

      await db.run('DELETE FROM pacientes WHERE id = ?', [id]);

      res.json({
        sucesso: true,
        mensagem: 'Paciente deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao deletar paciente' 
      });
    }
  }
};

module.exports = pacienteController;